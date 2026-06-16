import {
	type QueryClient,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { api } from "./api";
import { useT } from "./i18n";
import * as css from "./links.css";
import { q } from "./queries";
import { useSetting } from "./settings";
import { Muted } from "./ui";

// --- Track-detail prewarming -------------------------------------------------
// One shared, debounced batch queue. Every warm request — a list mounting, a row
// dwelling into view, a hover — funnels its uris here instead of firing its own
// query, so they coalesce into a single `api.trackDetails(...)` per window. That
// is the whole point: without it, per-row dwell on a 100-row table raced the
// bulk warm and flung ~100 single-track queries at the one DuckDB worker. The
// queue dedupes against the cache and against in-flight uris, and chunks large
// sets so the IN list and the materialized result stay bounded.
const WARM_DEBOUNCE = 120;
const WARM_CHUNK = 120;
const warmPending = new Set<string>();
const warmInflight = new Set<string>();
let warmTimer: ReturnType<typeof setTimeout> | undefined;
let warmClient: QueryClient | null = null;

export function warmTrackDetails(qc: QueryClient, uris: Iterable<string>) {
	warmClient = qc;
	for (const u of uris) {
		if (!u || warmPending.has(u) || warmInflight.has(u)) continue;
		if (qc.getQueryData(q.trackDetail(u).queryKey) !== undefined) continue;
		warmPending.add(u);
	}
	if (warmPending.size > 0 && warmTimer === undefined) {
		warmTimer = setTimeout(flushWarm, WARM_DEBOUNCE);
	}
}

function flushWarm() {
	warmTimer = undefined;
	const qc = warmClient;
	if (!qc || warmPending.size === 0) return;
	const batch = [...warmPending];
	warmPending.clear();
	for (let i = 0; i < batch.length; i += WARM_CHUNK) {
		const chunk = batch.slice(i, i + WARM_CHUNK);
		for (const u of chunk) warmInflight.add(u);
		api
			.trackDetails(chunk)
			.then((details) => {
				for (const d of details)
					qc.setQueryData(q.trackDetail(d.track_uri).queryKey, d);
			})
			.catch(() => {})
			.finally(() => {
				for (const u of chunk) warmInflight.delete(u);
			});
	}
}

// Feed a list view's rendered rows into the shared warm queue. The per-row dwell
// hook below feeds the same queue, so the two can't double-fetch a row.
export function usePrefetchTrackDetails(uris: string[]) {
	const qc = useQueryClient();
	// Encode as a string so the effect only refires when the set actually changes.
	const key = uris.join("\n");
	useEffect(() => {
		if (key) warmTrackDetails(qc, key.split("\n"));
	}, [key, qc]);
}

function trackId(uri: string) {
	return uri.startsWith("spotify:track:")
		? uri.slice("spotify:track:".length)
		: null;
}

// Prefetch a detail's data once its link has dwelled in view for a beat. The
// router's built-in preload="viewport" fires the instant a link crosses the
// viewport with no dwell, so scrolling a 100-row table flings hundreds of heavy
// detail queries at the single DuckDB worker at once — saturating it, stalling
// the click you actually make, and tripping "message handler took Nms". The
// dwell means only rows you pause on get warmed; a fast scroll-past cancels
// before any query is issued. Fires once, then disconnects.
const DWELL_MS = 350;
function useDwellPrefetch<T extends HTMLElement>(run: () => void) {
	const runRef = useRef(run);
	runRef.current = run;
	const ref = useRef<T | null>(null);
	useEffect(() => {
		const el = ref.current;
		if (!el || !("IntersectionObserver" in window)) return;
		let timer: ReturnType<typeof setTimeout> | undefined;
		const io = new IntersectionObserver((entries) => {
			if (entries.some((e) => e.isIntersecting)) {
				timer = setTimeout(() => {
					runRef.current();
					io.disconnect();
				}, DWELL_MS);
			} else if (timer) {
				clearTimeout(timer);
				timer = undefined;
			}
		});
		io.observe(el);
		return () => {
			if (timer) clearTimeout(timer);
			io.disconnect();
		};
	}, []);
	return ref;
}

// Clickable track / artist names. Used in every table and list so any name
// becomes a jump to its detail page. Track links warm through the shared batch
// queue when they dwell in view; `preload={false}` disables the router's per-row
// "intent" preload, which would otherwise fire a single-track query per hover and
// bypass the batch.

export function TrackLink({ uri, name }: { uri: string; name: string }) {
	const qc = useQueryClient();
	const ref = useDwellPrefetch<HTMLAnchorElement>(() => {
		warmTrackDetails(qc, [uri]);
	});
	return (
		<Link
			ref={ref}
			to="/track/$uri"
			params={{ uri }}
			preload={false}
			className={css.entity}
			title={name}
		>
			{name}
		</Link>
	);
}

export function ArtistLink({ name, muted }: { name: string; muted?: boolean }) {
	const t = useT();
	const qc = useQueryClient();
	const ref = useDwellPrefetch<HTMLAnchorElement>(() => {
		qc.prefetchQuery(q.artist(name));
		qc.prefetchQuery(q.artistTracks(name));
	});
	if (!name || name === "?") return <Muted>{name || t("common.dash")}</Muted>;
	return (
		<Link
			ref={ref}
			to="/artist/$name"
			params={{ name }}
			className={muted ? `${css.entity} ${css.entityMuted}` : css.entity}
			title={name}
		>
			{name}
		</Link>
	);
}

// Opens a track in Spotify. The `spotify:track:<id>` URI deep-links straight
// into the installed desktop/mobile app; we hand the web player URL to the
// anchor so it still resolves in a browser when the app isn't present (the
// web player itself offers to hand off to the app).
export function SpotifyLink({ uri }: { uri: string }) {
	const t = useT();
	const id = trackId(uri);
	if (!id) return null;
	return (
		<a
			className={css.spotifyButton}
			href={`https://open.spotify.com/track/${id}`}
			target="_blank"
			rel="noreferrer"
		>
			▶ {t("links.openInSpotify")}
		</a>
	);
}

// Embedded Spotify web player for a track. Spotify's embed iframe is
// cross-origin and never fires onError, so we probe the public oembed endpoint
// first: if the track is unavailable (bad/region-locked id) the probe fails and
// we render nothing rather than a broken iframe cluttering the page. The probe
// runs through the query cache so revisiting a track doesn't refetch it.
export function SpotifyEmbed({ uri }: { uri: string }) {
	const t = useT();
	const enabled = useSetting("showPlayer");
	const id = trackId(uri);
	const { data: ok } = useQuery({
		queryKey: ["spotify-oembed", id],
		enabled: Boolean(id && enabled),
		retry: false,
		queryFn: async () => {
			const url = `https://open.spotify.com/track/${id}`;
			try {
				const r = await fetch(
					`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`,
				);
				return r.ok;
			} catch {
				return false;
			}
		},
	});

	// Hidden entirely when disabled, not a track, or the probe failed.
	if (!enabled || !id || ok === false) return null;

	// Two independent loads gate this widget: the oembed probe (availability) and
	// the iframe's own content fetch. We keep the skeleton mounted until BOTH are
	// done — the iframe is stacked on top and fades in on its onLoad, so there's
	// no blank-box flash between "skeleton gone" and "player painted". The probe
	// also needs to have resolved before we mount the iframe at all (ok === true).
	return (
		<div className={css.spotifyEmbedFrame}>
			<div className={css.spotifyEmbedSkeleton} />
			{ok === true && (
				<iframe
					title={t("links.spotifyPlayer")}
					data-testid="embed-iframe"
					className={css.spotifyEmbed}
					src={`https://open.spotify.com/embed/track/${id}`}
					width="100%"
					height="152"
					frameBorder="0"
					allowFullScreen
					allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
					onLoad={(e) => e.currentTarget.classList.add(css.spotifyEmbedLoaded)}
				/>
			)}
		</div>
	);
}

export function BackLink() {
	const t = useT();
	return (
		<button
			type="button"
			className={css.backButton}
			onClick={() => history.back()}
			aria-label={t("links.backLabel")}
		>
			<span className={css.backIcon} aria-hidden="true">
				←
			</span>
			{t("links.back")}
		</button>
	);
}
