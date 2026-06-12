import { ensureReady, ingestZip } from "./db/lifecycle";
import * as q from "./db/queries";

// The data façade every view talks to. Until the DuckDB-WASM migration this
// wrapped fetch calls to the Go backend; now each method runs SQL locally.
// Types and signatures are unchanged so views never noticed the swap.

export type YearCount = { year: number; plays: number; hours: number };

export type Summary = {
	plays: number;
	streams: number;
	skips: number;
	hours: number;
	tracks: number;
	artists: number;
	first_play: string;
	last_play: string;
	years: YearCount[];
};

export type TopTrack = {
	track_uri: string;
	name: string;
	artist: string;
	plays: number;
	hours: number;
};

export type TopArtist = {
	artist: string;
	plays: number;
	hours: number;
	tracks: number;
};

export type Bucket = { bucket: number; plays: number; hours: number };

export type TrackRow = {
	track_uri: string;
	name: string;
	artist: string;
	album: string;
	plays: number;
	hours: number;
	first_play: string;
	last_play: string;
	skip_ratio: number;
};

export type TracksPage = {
	items: TrackRow[];
	next_cursor: number | null;
	total: number;
};

export type PlayRow = {
	ts: string;
	ms_played: number;
	name: string;
	artist: string;
	album: string;
	track_uri: string;
	skipped: boolean;
	shuffle: boolean | null;
	platform: string;
	country: string;
};

export type PlaysPage = { items: PlayRow[]; next_cursor: string | null };

export type Metric = "plays" | "ms";

export type Window = { from?: string; to?: string };

export type LabelCount = { label: string; plays: number };
export type MonthCount = { month: string; plays: number; hours: number };

export type TrackDetail = {
	track_uri: string;
	name: string;
	artist: string;
	album: string;
	plays: number;
	hours: number;
	skip_ratio: number;
	first_play: string;
	last_play: string;
	rank_plays: number;
	max_ms: number;
	monthly: MonthCount[];
	hourly: Bucket[];
	platforms: LabelCount[];
	reason_start: LabelCount[];
	completion: LabelCount[];
};

export type AlbumRow = { album: string; plays: number; hours: number };

export type ArtistDetail = {
	artist: string;
	plays: number;
	hours: number;
	tracks: number;
	skip_ratio: number;
	first_play: string;
	last_play: string;
	rank_plays: number;
	monthly: MonthCount[];
	albums: AlbumRow[];
};

export type DayCount = { date: string; plays: number; hours: number };
export type Calendar = { year: number; days: DayCount[] };

export type OnThisDay = {
	year: number;
	date: string;
	track_uri: string;
	name: string;
	artist: string;
	plays: number;
	hours: number;
};

export type RankDelta = { rank: number; prev_rank: number | null };

export type YearTrackDelta = RankDelta & {
	track_uri: string;
	name: string;
	artist: string;
	plays: number;
};

export type YearArtistDelta = RankDelta & { artist: string; plays: number };

export type YearReview = {
	year: number;
	plays: number;
	streams: number;
	hours: number;
	tracks: number;
	artists: number;
	top_tracks: YearTrackDelta[];
	top_artists: YearArtistDelta[];
	busiest_day: DayCount | null;
	streak: { days: number; from: string; to: string } | null;
	discovery: { artist: string; hours: number } | null;
	skip_champion: {
		track_uri: string;
		name: string;
		artist: string;
		plays: number;
		skip_ratio: number;
	} | null;
};

export const api = {
	status: () => ensureReady(),
	importZip: (file: File, onProgress?: (fraction: number) => void) =>
		ingestZip(file, onProgress),

	summary: () => q.summary(),

	topTracks: (metric: Metric, w: Window, minMs: number, limit: number) =>
		q.topTracks(metric, w, minMs, limit),

	topArtists: (metric: Metric, w: Window, minMs: number, limit: number) =>
		q.topArtists(metric, w, minMs, limit),

	hourly: (w: Window) => q.hourly(w),
	weekly: (w: Window) => q.weekly(w),

	// Library view gets the whole distinct-track list once (~20k rows) and
	// filters/sorts in memory; the DOM is virtualized.
	allTracks: () => q.allTracks(),

	plays: (cursor: string | undefined, search: string, w: Window) =>
		q.plays(cursor, search, w),

	track: (uri: string) => q.track(uri),

	artist: (name: string) => q.artist(name),
	artistTracks: (name: string) => q.artistTracks(name),

	calendar: (year?: number) => q.calendar(year),
	onThisDay: () => q.onThisDay(),
	year: (year: number) => q.year(year),
};
