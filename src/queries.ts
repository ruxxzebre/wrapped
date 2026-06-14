import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { api, type Metric, type Window } from "./api";

// Single source of truth for every query's key + fetcher. Route loaders and
// view hooks both consume these factories, so a loader can never warm a key the
// view then misses. Keys are `as const` tuples for type-checked invalidation,
// and the data type flows from the fetcher through to useQuery automatically.

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

	track: (uri: string) =>
		queryOptions({
			queryKey: ["track", uri] as const,
			queryFn: () => api.track(uri),
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

	// minMs is fixed at 30000 in the fetcher and intentionally absent from the
	// key — mirrors the original TopArtists query so the cache aligns.
	topArtists: (metric: Metric, window: Window, limit: number) =>
		queryOptions({
			queryKey: ["topArtists", metric, window, limit] as const,
			queryFn: () => api.topArtists(metric, window, 30000, limit),
		}),
	topTracks: (metric: Metric, window: Window, minMs: number, limit: number) =>
		queryOptions({
			queryKey: ["topTracks", metric, window, minMs, limit] as const,
			queryFn: () => api.topTracks(metric, window, minMs, limit),
		}),

	hourly: (window: Window) =>
		queryOptions({
			queryKey: ["hourly", window] as const,
			queryFn: () => api.hourly(window),
		}),
	weekly: (window: Window) =>
		queryOptions({
			queryKey: ["weekly", window] as const,
			queryFn: () => api.weekly(window),
		}),

	plays: (search: string, window: Window) =>
		infiniteQueryOptions({
			queryKey: ["plays", search, window] as const,
			queryFn: ({ pageParam }) => api.plays(pageParam, search, window),
			initialPageParam: undefined as string | undefined,
			getNextPageParam: (last) => last.next_cursor ?? undefined,
		}),

	// Compare's two columns each hold a top-N of a window, normalised to a shared
	// shape so artists and tracks join on one key.
	compareTop: (entity: CompareEntity, metric: Metric, window: Window) =>
		queryOptions({
			queryKey: [entity, "cmp", metric, window] as const,
			queryFn: () => fetchTop(entity, metric, window),
		}),

	// --- Insights (ideas.md §15–§25) — keyed by the shared period filter ----
	seasonal: (period: Window) =>
		queryOptions({
			queryKey: ["seasonal", period] as const,
			queryFn: () => api.seasonal(period),
		}),
	attention: (period: Window) =>
		queryOptions({
			queryKey: ["attention", period] as const,
			queryFn: () => api.attention(period),
		}),
	companions: (kind: "track" | "artist", period: Window) =>
		queryOptions({
			queryKey: ["companions", kind, period] as const,
			queryFn: () => api.companions(kind, period),
		}),
	rediscoveries: (period: Window) =>
		queryOptions({
			queryKey: ["rediscoveries", period] as const,
			queryFn: () => api.rediscoveries(period),
		}),
	loops: (period: Window) =>
		queryOptions({
			queryKey: ["loops", period] as const,
			queryFn: () => api.loops(period),
		}),
	weekendSplit: (period: Window) =>
		queryOptions({
			queryKey: ["weekendSplit", period] as const,
			queryFn: () => api.weekendSplit(period),
		}),
	chronotype: (period: Window) =>
		queryOptions({
			queryKey: ["chronotype", period] as const,
			queryFn: () => api.chronotype(period),
		}),
	devices: (period: Window) =>
		queryOptions({
			queryKey: ["devices", period] as const,
			queryFn: () => api.devices(period),
		}),
	privacy: (period: Window) =>
		queryOptions({
			queryKey: ["privacy", period] as const,
			queryFn: () => api.privacy(period),
		}),
	rangeIndex: (period: Window) =>
		queryOptions({
			queryKey: ["rangeIndex", period] as const,
			queryFn: () => api.rangeIndex(period),
		}),
	hiatuses: (period: Window) =>
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
	window: Window,
): Promise<CompareTop[]> {
	if (entity === "artists") {
		const rows = await api.topArtists(metric, window, 30000, COMPARE_LIMIT);
		return rows.map((r) => ({
			key: r.artist,
			name: r.artist,
			plays: r.plays,
			hours: r.hours,
		}));
	}
	const rows = await api.topTracks(metric, window, 30000, COMPARE_LIMIT);
	return rows.map((r) => ({
		key: r.track_uri,
		name: r.name,
		artist: r.artist,
		uri: r.track_uri,
		plays: r.plays,
		hours: r.hours,
	}));
}
