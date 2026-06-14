import { clearDatabase, ensureReady, ingestZip } from "./db/lifecycle";
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

export type Period = { from?: string; to?: string };

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

// --- Story: the narrative "story stack" at the top of the summary page ------

export type StoryOrigin = {
	date: string; // YYYY-MM-DD, local
	weekday: string; // "Tuesday"
	track_uri: string;
	name: string;
	artist: string;
};

export type StoryPersona = {
	night_ratio: number; // share of plays in the 21:00–05:00 window (local)
	skip_ratio: number;
	total_artists: number;
	oneshot_artists: number; // artists played exactly once
	loyal_artists: number; // artists with ≥50 plays
};

export type StoryObsession = {
	date: string;
	track_uri: string;
	name: string;
	artist: string;
	plays: number; // plays of this one track on this one day
};

export type StoryFaded = {
	track_uri: string;
	name: string;
	artist: string;
	plays: number; // plays in its peak year
	peak_year: number;
	last_play: string;
};

// The artist who stayed: present across the widest span of years.
export type StoryCompanion = {
	artist: string;
	plays: number;
	hours: number;
	years: number; // span from first to last year, inclusive
	first_year: number;
};

// A track you let go quiet, then came roaring back to (mirror of `faded`).
export type StoryComeback = {
	track_uri: string;
	name: string;
	artist: string;
	date: string; // the comeback play, YYYY-MM-DD
	gap_days: number; // silence before it
	plays_30d: number; // plays in the 30 days after
};

// Your single most-consumed calendar day — total immersion.
export type StoryMarathon = {
	date: string;
	weekday: string;
	hours: number;
	streams: number;
	artist: string; // the artist that led that day
};

// A track you played many times and never once skipped — pure commitment.
export type StoryDevotion = {
	track_uri: string;
	name: string;
	artist: string;
	plays: number;
	skip_ratio: number; // your overall skip rate, for contrast
};

// Every beat but the persona may be null when the library is too thin to
// support it; the view simply omits that scene.
export type Story = {
	origin: StoryOrigin | null;
	persona: StoryPersona | null;
	obsession: StoryObsession | null;
	faded: StoryFaded | null;
	companion: StoryCompanion | null;
	comeback: StoryComeback | null;
	marathon: StoryMarathon | null;
	devotion: StoryDevotion | null;
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

// --- Insights (ideas.md §15–§25) -------------------------------------------

// §15 Seasonal fingerprint: tracks whose plays cluster in one part of the year.
// peak_month is 0-based (0 = Jan); concentration is the circular resultant
// length R in [0,1] (1 = one tight season, 0 = spread year-round).
export type SeasonalTrack = {
	track_uri: string;
	name: string;
	artist: string;
	plays: number;
	peak_month: number;
	concentration: number;
};

// §16 Attention span: completion behaviour trended per year.
export type AttentionYear = {
	year: number;
	median_ms: number;
	avg_completion: number; // 0..1, mean fraction of a track played
};

// §17 Loyal companions: tracks/artists played in every year of the export.
export type Companion = {
	key: string; // track_uri (track) or artist name (artist) — links + react key
	name: string;
	artist: string; // "" for the artist variant
	plays: number;
	hours: number;
	years: number;
};

// §18 Rediscovery: a track returned after a long silence and stuck around.
export type Rediscovery = {
	track_uri: string;
	name: string;
	artist: string;
	date: string; // the comeback play, YYYY-MM-DD
	gap_days: number; // silence before it
	plays_30d: number; // plays in the 30 days after the comeback
};

// §19 Repeat-one: longest back-to-back consecutive run of the same track.
export type Loop = {
	track_uri: string;
	name: string;
	artist: string;
	date: string; // when the run started
	run_len: number;
};

// §20 Weekend vs weekday self.
export type SplitArtist = { artist: string; plays: number };
export type WeekendSplit = {
	weekday: SplitArtist[];
	weekend: SplitArtist[];
	divergence: number; // 1 − Jaccard(top-50 weekday, top-50 weekend)
};

// §21 Chronotype drift: circular-mean listening hour per year + night share.
export type ChronotypeYear = {
	year: number;
	mean_hour: number; // 0..23, circular mean of local start hour
	night_share: number; // share of plays before 06:00 local
	plays: number;
};

// §22 Device archaeology (coarse, platform-family only — user_agent is PII).
export type Device = {
	device: string;
	first_seen: string;
	last_seen: string;
	hours: number;
	plays: number;
};

// §23 Incognito & offline listening.
export type PrivacyStats = {
	plays: number;
	incognito: number;
	offline: number;
	incognito_hours: number;
	offline_hours: number;
	topOffline: TopTrack[];
	topIncognito: TopTrack[];
};

// §24 Range index: how concentrated taste is. bucket is a year or "all".
export type RangeBucket = {
	bucket: string;
	tracks: number;
	gini: number; // 0 = perfectly even, →1 = dominated by a few tracks
	top1pct_share: number; // share of plays from the top 1% of tracks
};
export type RangeIndex = { all: RangeBucket | null; years: RangeBucket[] };

// §25 Hiatuses: stretches with no listening between active days.
export type Hiatus = { from: string; to: string; days: number };

export const api = {
	status: () => ensureReady(),
	importZip: (file: File, onProgress?: (fraction: number) => void) =>
		ingestZip(file, onProgress),
	clearDatabase: () => clearDatabase(),

	summary: () => q.summary(),
	story: () => q.story(),

	topTracks: (metric: Metric, p: Period, minMs: number, limit: number) =>
		q.topTracks(metric, p, minMs, limit),

	topArtists: (metric: Metric, p: Period, minMs: number, limit: number) =>
		q.topArtists(metric, p, minMs, limit),

	hourly: (p: Period) => q.hourly(p),
	weekly: (p: Period) => q.weekly(p),

	// Library view gets the whole distinct-track list once (~20k rows) and
	// filters/sorts in memory; the DOM is virtualized.
	allTracks: () => q.allTracks(),

	plays: (cursor: string | undefined, search: string, p: Period) =>
		q.plays(cursor, search, p),

	track: (uri: string) => q.track(uri),

	artist: (name: string) => q.artist(name),
	artistTracks: (name: string) => q.artistTracks(name),

	calendar: (year?: number) => q.calendar(year),
	onThisDay: () => q.onThisDay(),
	year: (year: number) => q.year(year),

	// --- Insights (§15–§25) — all accept the shared Insights period filter -
	seasonal: (p: Period) => q.seasonal(p),
	attention: (p: Period) => q.attention(p),
	companions: (kind: "track" | "artist", p: Period) => q.companions(kind, p),
	rediscoveries: (p: Period) => q.rediscoveries(p),
	loops: (p: Period) => q.loops(p),
	weekendSplit: (p: Period) => q.weekendSplit(p),
	chronotype: (p: Period) => q.chronotype(p),
	devices: (p: Period) => q.devices(p),
	privacy: (p: Period) => q.privacy(p),
	rangeIndex: (p: Period) => q.rangeIndex(p),
	hiatuses: (p: Period) => q.hiatuses(p),
};
