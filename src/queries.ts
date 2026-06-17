import {
	infiniteQueryOptions,
	keepPreviousData,
	queryOptions,
} from "@tanstack/react-query";
import { api, type Metric, type Period } from "./api";

// Single source of truth for every query's key + fetcher. Route loaders and
// view hooks both consume these factories, so a loader can never warm a key the
// view then misses. Keys are `as const` tuples for type-checked invalidation,
// and the data type flows from the fetcher through to useQuery automatically.

// Page size for the infinitely-scrolled Top lists (artists/albums/tracks).
const TOP_PAGE = 100;

export const q = {
	status: () =>
		queryOptions({ queryKey: ["status"] as const, queryFn: api.status }),
	summary: () =>
		queryOptions({ queryKey: ["summary"] as const, queryFn: api.summary }),
	story: () =>
		queryOptions({ queryKey: ["story"] as const, queryFn: api.story }),
	onThisDay: () =>
		queryOptions({ queryKey: ["onThisDay"] as const, queryFn: api.onThisDay }),
	allTracks: () =>
		queryOptions({ queryKey: ["allTracks"] as const, queryFn: api.allTracks }),

	// Track detail (cards + panels) in one cache entry. List pages pre-warm the
	// on-screen rows in bulk via api.trackDetails (one batched pass); a cold
	// direct open falls back to the single-track fetch.
	trackDetail: (uri: string) =>
		queryOptions({
			queryKey: ["track", "detail", uri] as const,
			queryFn: () => api.trackDetail(uri),
		}),
	artist: (name: string) =>
		queryOptions({
			queryKey: ["artist", name] as const,
			queryFn: () => api.artist(name),
		}),
	artistTracks: (name: string) =>
		queryOptions({
			queryKey: ["artistTracks", name] as const,
			queryFn: () => api.artistTracks(name),
		}),
	album: (artist: string, name: string) =>
		queryOptions({
			queryKey: ["album", artist, name] as const,
			queryFn: () => api.album(artist, name),
		}),
	albumTracks: (artist: string, name: string) =>
		queryOptions({
			queryKey: ["albumTracks", artist, name] as const,
			queryFn: () => api.albumTracks(artist, name),
		}),

	calendar: (year?: number) =>
		queryOptions({
			queryKey: ["calendar", year] as const,
			queryFn: () => api.calendar(year),
		}),
	year: (year: number) =>
		queryOptions({
			queryKey: ["year", year] as const,
			queryFn: () => api.year(year),
		}),

	// The Top lists scroll infinitely: each page is a TOP_PAGE-sized window keyed
	// off the running offset, so the view flatMaps pages and fetches the next as
	// the table nears its end. minMs is fixed at 30000 in the fetcher and absent
	// from the key — mirrors the original queries so the cache aligns. A short
	// final page (fewer than TOP_PAGE rows) signals the end.
	topArtists: (metric: Metric, period: Period) =>
		infiniteQueryOptions({
			queryKey: ["topArtists", metric, period] as const,
			queryFn: ({ pageParam }) =>
				api.topArtists(metric, period, 30000, TOP_PAGE, pageParam),
			initialPageParam: 0,
			getNextPageParam: (last, _all, lastParam) =>
				last.length < TOP_PAGE ? undefined : lastParam + TOP_PAGE,
			placeholderData: keepPreviousData,
		}),
	topAlbums: (metric: Metric, period: Period) =>
		infiniteQueryOptions({
			queryKey: ["topAlbums", metric, period] as const,
			queryFn: ({ pageParam }) =>
				api.topAlbums(metric, period, 30000, TOP_PAGE, pageParam),
			initialPageParam: 0,
			getNextPageParam: (last, _all, lastParam) =>
				last.length < TOP_PAGE ? undefined : lastParam + TOP_PAGE,
			placeholderData: keepPreviousData,
		}),
	topTracks: (metric: Metric, period: Period, minMs: number) =>
		infiniteQueryOptions({
			queryKey: ["topTracks", metric, period, minMs] as const,
			queryFn: ({ pageParam }) =>
				api.topTracks(metric, period, minMs, TOP_PAGE, pageParam),
			initialPageParam: 0,
			getNextPageParam: (last, _all, lastParam) =>
				last.length < TOP_PAGE ? undefined : lastParam + TOP_PAGE,
			placeholderData: keepPreviousData,
		}),

	hourly: (period: Period) =>
		queryOptions({
			queryKey: ["hourly", period] as const,
			queryFn: () => api.hourly(period),
		}),
	weekly: (period: Period) =>
		queryOptions({
			queryKey: ["weekly", period] as const,
			queryFn: () => api.weekly(period),
		}),

	plays: (search: string, period: Period) =>
		infiniteQueryOptions({
			queryKey: ["plays", search, period] as const,
			queryFn: ({ pageParam }) => api.plays(pageParam, search, period),
			initialPageParam: undefined as string | undefined,
			getNextPageParam: (last) => last.next_cursor ?? undefined,
		}),

	// Compare's two columns each hold a top-N of a period, normalised to a shared
	// shape so artists and tracks join on one key.
	compareTop: (entity: CompareEntity, metric: Metric, period: Period) =>
		queryOptions({
			queryKey: [entity, "cmp", metric, period] as const,
			queryFn: () => fetchTop(entity, metric, period),
		}),

	// --- Insights (ideas.md §15–§25) — keyed by the shared period filter ----
	seasonal: (period: Period) =>
		queryOptions({
			queryKey: ["seasonal", period] as const,
			queryFn: () => api.seasonal(period),
		}),
	attention: (period: Period) =>
		queryOptions({
			queryKey: ["attention", period] as const,
			queryFn: () => api.attention(period),
		}),
	companions: (kind: "track" | "artist", period: Period) =>
		queryOptions({
			queryKey: ["companions", kind, period] as const,
			queryFn: () => api.companions(kind, period),
		}),
	rediscoveries: (period: Period) =>
		queryOptions({
			queryKey: ["rediscoveries", period] as const,
			queryFn: () => api.rediscoveries(period),
		}),
	loops: (period: Period) =>
		queryOptions({
			queryKey: ["loops", period] as const,
			queryFn: () => api.loops(period),
		}),
	weekendSplit: (period: Period) =>
		queryOptions({
			queryKey: ["weekendSplit", period] as const,
			queryFn: () => api.weekendSplit(period),
		}),
	chronotype: (period: Period) =>
		queryOptions({
			queryKey: ["chronotype", period] as const,
			queryFn: () => api.chronotype(period),
		}),
	devices: (period: Period) =>
		queryOptions({
			queryKey: ["devices", period] as const,
			queryFn: () => api.devices(period),
		}),
	privacy: (period: Period) =>
		queryOptions({
			queryKey: ["privacy", period] as const,
			queryFn: () => api.privacy(period),
		}),
	rangeIndex: (period: Period) =>
		queryOptions({
			queryKey: ["rangeIndex", period] as const,
			queryFn: () => api.rangeIndex(period),
		}),
	hiatuses: (period: Period) =>
		queryOptions({
			queryKey: ["hiatuses", period] as const,
			queryFn: () => api.hiatuses(period),
		}),
};

// --- Compare helpers (shared by the loader and the view) -------------------

export type CompareEntity = "artists" | "tracks";

export type CompareTop = {
	key: string;
	name: string;
	artist?: string;
	uri?: string;
	plays: number;
	hours: number;
};

const COMPARE_LIMIT = 250; // top-N of each window; entries outside read as absent

async function fetchTop(
	entity: CompareEntity,
	metric: Metric,
	period: Period,
): Promise<CompareTop[]> {
	if (entity === "artists") {
		const rows = await api.topArtists(metric, period, 30000, COMPARE_LIMIT);
		return rows.map((r) => ({
			key: r.artist,
			name: r.artist,
			plays: r.plays,
			hours: r.hours,
		}));
	}
	const rows = await api.topTracks(metric, period, 30000, COMPARE_LIMIT);
	return rows.map((r) => ({
		key: r.track_uri,
		name: r.name,
		artist: r.artist,
		uri: r.track_uri,
		plays: r.plays,
		hours: r.hours,
	}));
}
