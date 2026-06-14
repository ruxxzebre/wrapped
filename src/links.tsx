import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { api } from "./api";
import { useT } from "./i18n";
import * as css from "./links.css";
import { q } from "./queries";
import { useSetting } from "./settings";
import { Muted } from "./ui";

// Batch-warm the head (card) data for a list of track links in a single query,
// so a table of N track rows costs one round-trip instead of N full track opens
// against the single DuckDB worker. Only URIs not already cached are fetched,
// and the request is debounced so re-renders (sort, filter, search keystrokes)
// don't refire. Capped because the head aggregate is one IN-scan: huge lists
// (the ~20k-row virtualized Library) would build an unwieldy IN clause, so they
// stay on per-row dwell prefetch instead of calling this.
const PREFETCH_HEADS_CAP = 1000;
const PREFETCH_HEADS_DELAY = 200;
export function usePrefetchTrackHeads(uris: string[]) {
	const qc = useQueryClient();
	// Encode the list as a string so the effect only refires when the set of
	// URIs actually changes, not on every render that produces a new array.
	const key = uris.join("\n");
	useEffect(() => {
		const list = key ? key.split("\n") : [];
		if (list.length === 0 || list.length > PREFETCH_HEADS_CAP) return;
		const missing = list.filter(
			(u) => u && qc.getQueryData(q.trackHead(u).queryKey) === undefined,
		);
		if (missing.length === 0) return;
		let cancelled = false;
		const timer = setTimeout(() => {
			api
				.trackHeads(missing)
				.then((heads) => {
					if (cancelled) return;
					for (const h of heads)
						qc.setQueryData(q.trackHead(h.track_uri).queryKey, h);
				})
				.catch(() => {});
		}, PREFETCH_HEADS_DELAY);
		return () => {
			cancelled = true;
			clearTimeout(timer);
		};
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
// becomes a jump to its detail page. Hover still preloads via the router's
// default "intent"; the dwell hook adds an in-view warm-up on top.

export function TrackLink({ uri, name }: { uri: string; name: string }) {
	const qc = useQueryClient();
	const ref = useDwellPrefetch<HTMLAnchorElement>(() => {
		qc.prefetchQuery(q.trackHead(uri));
	});
	return (
		<Link
			ref={ref}
			to="/track/$uri"
			params={{ uri }}
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
