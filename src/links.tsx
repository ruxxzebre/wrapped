import { useQuery } from "@tanstack/react-query";
import { useT } from "./i18n";
import * as css from "./links.css";
import { artistPath, Link, trackPath } from "./router";
import { useSetting } from "./settings";
import { Muted } from "./ui";

function trackId(uri: string) {
	return uri.startsWith("spotify:track:")
		? uri.slice("spotify:track:".length)
		: null;
}

// Clickable track / artist names. Used in every table and list so any name
// becomes a jump to its detail page.

export function TrackLink({ uri, name }: { uri: string; name: string }) {
	return (
		<Link to={trackPath(uri)} className={css.entity} title={name}>
			{name}
		</Link>
	);
}

export function ArtistLink({ name, muted }: { name: string; muted?: boolean }) {
	const t = useT();
	if (!name || name === "?") return <Muted>{name || t("common.dash")}</Muted>;
	return (
		<Link
			to={artistPath(name)}
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

	// Hidden entirely when disabled, not a track, or the probe failed. While the
	// probe is in flight (ok === undefined) we show a skeleton so the layout
	// doesn't jump; it's replaced by the player on success or vanishes on
	// failure.
	if (!enabled || !id || ok === false) return null;
	if (ok === undefined) return <div className={css.spotifyEmbedSkeleton} />;

	return (
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
			loading="lazy"
		/>
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
