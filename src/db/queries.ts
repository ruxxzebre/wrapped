import type {
	AlbumDetail,
	ArtistDetail,
	AttentionYear,
	Bucket,
	Calendar,
	ChronotypeYear,
	Companion,
	CompletionYear,
	DayCount,
	Device,
	Discovery,
	Hiatus,
	LabelCount,
	Loop,
	Metric,
	MonthCount,
	Neighbor,
	OnThisDay,
	Pace,
	Period,
	PlayRow,
	PlaysPage,
	PrivacyStats,
	RangeBucket,
	RangeIndex,
	RankYear,
	Records,
	Rediscovery,
	SeasonalTrack,
	SplitArtist,
	Story,
	StoryComeback,
	StoryCompanion,
	StoryDevotion,
	StoryFaded,
	StoryMarathon,
	StoryObsession,
	StoryOrigin,
	StoryPersona,
	Streak,
	Summary,
	TopAlbum,
	TopArtist,
	TopTrack,
	TrackDetail,
	TrackHead,
	TrackLoop,
	TrackOrigin,
	TrackRow,
	TracksPage,
	WeekendSplit,
	YearArtistDelta,
	YearCount,
	YearReview,
	YearTrackDelta,
} from "../api";
import { query } from "./duckdb";

// Analytics queries, ported verbatim from backend/internal/api/*.go. Same SQL,
// same parameter shapes, same response types — views never notice the backend
// is gone.

// --- shared helpers (params.go) --------------------------------------------

function one<T>(rows: T[]): T {
	const row = rows[0];
	if (row === undefined) throw new Error("empty result");
	return row;
}

/** YYYY-MM-DD plus one day, so a `to` date is inclusive (filter is < to+1d). */
function plusDay(date: string): string {
	const t = new Date(`${date}T00:00:00Z`);
	t.setUTCDate(t.getUTCDate() + 1);
	return t.toISOString().slice(0, 10);
}

/** Appends ts-window conditions and their args. */
function periodWhere(p: Period, conds: string[], args: unknown[]): void {
	if (p.from) {
		conds.push("ts >= CAST(? AS TIMESTAMP)");
		args.push(p.from);
	}
	if (p.to) {
		conds.push("ts < CAST(? AS TIMESTAMP)");
		args.push(plusDay(p.to));
	}
}

/** Escapes LIKE wildcards in user search input. */
function escapeLike(s: string): string {
	return s
		.replaceAll("\\", "\\\\")
		.replaceAll("%", "\\%")
		.replaceAll("_", "\\_");
}

// Keyset cursor for the raw play log: (ts, track_uri), base64-encoded.
function encodeCursor(ts: string, uri: string): string {
	return btoa(`${ts}|${uri}`);
}

function decodeCursor(cursor: string): { ts: string; uri: string } {
	let raw: string;
	try {
		raw = atob(cursor);
	} catch {
		throw new Error("bad cursor");
	}
	const i = raw.indexOf("|");
	if (i === -1) throw new Error("bad cursor");
	return { ts: raw.slice(0, i), uri: raw.slice(i + 1) };
}

// metric → whitelisted SQL aggregate. Never interpolate user input.
const METRICS: Record<Metric, string> = {
	plays: "count(*)",
	ms: "sum(ms_played)",
};

// --- session caches for library-wide constants -----------------------------
// The skip-rate baseline and every track's lifetime play-rank are identical for
// every track-detail open, yet each open used to recompute both — a full-table
// avg and a full GROUP BY + RANK window over all tracks. Compute each once per
// dataset and reuse it; createListensView() calls resetTrackCaches() whenever
// the listens table is rebuilt (import, restore, timezone change), so the memos
// never outlive the data they were derived from. Promises are memoized (not
// values) so concurrent first callers share one in-flight query.
let baselineSkipPromise: Promise<number> | null = null;
let rankMapPromise: Promise<Map<string, number>> | null = null;

// The global-window passes behind a track's deep panels — segue (LAG/LEAD over
// the whole ordered log), origin, the repeat-one run map, and per-year rank —
// are identical for every track, yet each open used to recompute them and filter
// to one uri. Compute each once per dataset, keyed by track_uri, and let every
// open (single or batched) read its slice. Same memoize-the-promise discipline as
// the two caches above; resetTrackCaches() clears them when listens is rebuilt.
let segueMapPromise: Promise<Map<string, SegueEntry>> | null = null;
let originMapPromise: Promise<Map<string, TrackOrigin>> | null = null;
let loopMapPromise: Promise<Map<string, TrackLoop>> | null = null;
let rankYearlyMapPromise: Promise<Map<string, RankYear[]>> | null = null;

export function resetTrackCaches(): void {
	baselineSkipPromise = null;
	rankMapPromise = null;
	segueMapPromise = null;
	originMapPromise = null;
	loopMapPromise = null;
	rankYearlyMapPromise = null;
}

type SegueEntry = { before: Neighbor[]; after: Neighbor[] };

/** Library-wide skip rate — the baseline a track's own rate is compared against. */
function librarySkipRate(): Promise<number> {
	baselineSkipPromise ??= query<{ s: number | null }>(
		"SELECT avg(CASE WHEN was_skipped THEN 1.0 ELSE 0.0 END) AS s FROM listens",
	).then((rows) => rows[0]?.s ?? 0);
	return baselineSkipPromise;
}

/** track_uri → lifetime rank by play count, computed once over the whole log. */
function trackRankMap(): Promise<Map<string, number>> {
	rankMapPromise ??= query<{ track_uri: string; rnk: number }>(
		`SELECT track_uri, RANK() OVER (ORDER BY count(*) DESC) AS rnk
		 FROM listens GROUP BY track_uri`,
	).then((rows) => new Map(rows.map((r) => [r.track_uri, r.rnk])));
	return rankMapPromise;
}

// --- summary.go -------------------------------------------------------------

export async function summary(): Promise<Summary> {
	const head = one(
		await query<Omit<Summary, "years">>(`
		SELECT count(*)                              AS plays,
		       count(*) FILTER (WHERE counts_as_stream) AS streams,
		       count(*) FILTER (WHERE was_skipped)  AS skips,
		       sum(ms_played) / 3600000.0           AS hours,
		       count(DISTINCT track_uri)            AS tracks,
		       count(DISTINCT artist_name)          AS artists,
		       min(ts) AS first_play, max(ts) AS last_play
		FROM listens`),
	);
	const years = await query<YearCount>(`
		SELECT year(ts) AS year, count(*) AS plays,
		       CAST(round(sum(ms_played) / 3600000.0) AS BIGINT) AS hours
		FROM plays GROUP BY year ORDER BY year`);
	return { ...head, years };
}

// --- story: the narrative beats on the summary page -------------------------

// The very first play in the history — the origin point. Reads on started_local
// so the weekday/date land on the listener's own calendar.
async function storyOrigin(): Promise<StoryOrigin | null> {
	const rows = await query<StoryOrigin>(`
		SELECT strftime(CAST(started_local AS DATE), '%Y-%m-%d') AS date,
		       dayname(started_local)         AS weekday,
		       track_uri,
		       COALESCE(track_name, '?')      AS name,
		       COALESCE(artist_name, '?')     AS artist
		FROM listens ORDER BY started_local ASC LIMIT 1`);
	return rows[0] ?? null;
}

// Habit fingerprint behind the persona line: how nocturnal, how skip-happy, and
// how loyal vs. restless across artists. The view turns these into adjectives.
async function storyPersona(): Promise<StoryPersona | null> {
	const beh = (
		await query<{ night_ratio: number | null; skip_ratio: number | null }>(`
		SELECT avg(CASE WHEN hour(started_local) >= 21 OR hour(started_local) < 5
		                THEN 1.0 ELSE 0.0 END) AS night_ratio,
		       avg(CASE WHEN was_skipped THEN 1.0 ELSE 0.0 END) AS skip_ratio
		FROM listens`)
	)[0];
	if (!beh || beh.night_ratio === null) return null; // empty library

	const art = (
		await query<{
			total_artists: number;
			oneshot_artists: number;
			loyal_artists: number;
		}>(`
		WITH a AS (
			SELECT artist_name, count(*) AS n
			FROM listens WHERE artist_name IS NOT NULL GROUP BY artist_name
		)
		SELECT count(*)                        AS total_artists,
		       count(*) FILTER (WHERE n = 1)    AS oneshot_artists,
		       count(*) FILTER (WHERE n >= 50)  AS loyal_artists
		FROM a`)
	)[0];

	return {
		night_ratio: beh.night_ratio ?? 0,
		skip_ratio: beh.skip_ratio ?? 0,
		total_artists: art?.total_artists ?? 0,
		oneshot_artists: art?.oneshot_artists ?? 0,
		loyal_artists: art?.loyal_artists ?? 0,
	};
}

// The single most-repeated track within one calendar day — the obsession record.
// Only counts when it crosses a threshold so a sparse library doesn't surface a
// mundane "3 plays" as a confession.
async function storyObsession(): Promise<StoryObsession | null> {
	const rows = await query<StoryObsession>(`
		SELECT strftime(CAST(started_local AS DATE), '%Y-%m-%d') AS date,
		       track_uri,
		       COALESCE(max(track_name), '?')  AS name,
		       COALESCE(max(artist_name), '?') AS artist,
		       count(*)                        AS plays
		FROM listens
		GROUP BY date, track_uri
		HAVING count(*) >= 8
		ORDER BY plays DESC LIMIT 1`);
	return rows[0] ?? null;
}

// A track you once leaned on hard and then let go: a clear peak year, but
// untouched for at least a year before your latest listening. Picks the biggest
// such peak so the "you left this behind" hits hardest.
async function storyFaded(): Promise<StoryFaded | null> {
	const rows = await query<StoryFaded>(`
		WITH per_year AS (
			SELECT track_uri, year(started_local) AS y, count(*) AS plays
			FROM listens GROUP BY track_uri, y
		),
		peak AS (
			SELECT track_uri, y AS peak_year, plays AS peak_plays,
			       ROW_NUMBER() OVER (PARTITION BY track_uri ORDER BY plays DESC) AS rn
			FROM per_year
		),
		life AS (
			SELECT track_uri, max(ts) AS last_play,
			       COALESCE(max(track_name), '?')  AS name,
			       COALESCE(max(artist_name), '?') AS artist
			FROM listens GROUP BY track_uri
		)
		SELECT l.track_uri, l.name, l.artist,
		       p.peak_plays                       AS plays,
		       p.peak_year                        AS peak_year,
		       strftime(l.last_play, '%Y-%m-%d')  AS last_play
		FROM peak p JOIN life l USING (track_uri)
		WHERE p.rn = 1
		  AND p.peak_plays >= 15
		  AND l.last_play < (SELECT max(ts) FROM listens) - INTERVAL '1 year'
		ORDER BY p.peak_plays DESC LIMIT 1`);
	return rows[0] ?? null;
}

// The artist who has stayed the longest: present across the widest span of
// calendar years (loyalty over time), tie-broken by hours. Needs ≥3 years of
// span so "all those years" actually means something.
async function storyCompanion(): Promise<StoryCompanion | null> {
	const rows = await query<StoryCompanion>(`
		SELECT artist_name                  AS artist,
		       count(*)                     AS plays,
		       sum(ms_played) / 3600000.0   AS hours,
		       max(year(started_local)) - min(year(started_local)) + 1 AS years,
		       min(year(started_local))     AS first_year
		FROM listens WHERE artist_name IS NOT NULL
		GROUP BY artist_name
		HAVING count(DISTINCT year(started_local)) >= 3
		   AND max(year(started_local)) - min(year(started_local)) + 1 >= 3
		ORDER BY count(DISTINCT year(started_local)) DESC, hours DESC LIMIT 1`);
	return rows[0] ?? null;
}

// A track that went quiet for 6+ months and then came roaring back with 5+
// plays in the next 30 days — the mirror of `faded`. Picks the longest such
// silence so the return hits hardest. (Same shape as the §18 insight, distilled
// to one hero record.)
async function storyComeback(): Promise<StoryComeback | null> {
	const rows = await query<StoryComeback>(`
		WITH g AS (
			SELECT track_uri, ts,
			       COALESCE(track_name, '?')  AS name,
			       COALESCE(artist_name, '?') AS artist,
			       date_diff('day', LAG(ts) OVER (PARTITION BY track_uri ORDER BY ts), ts)
			           AS gap_days,
			       count(*) OVER (
			           PARTITION BY track_uri ORDER BY ts
			           RANGE BETWEEN CURRENT ROW AND INTERVAL '30 days' FOLLOWING
			       ) AS plays_30d
			FROM listens
		)
		SELECT track_uri, name, artist,
		       strftime(ts, '%Y-%m-%d') AS date,
		       gap_days, plays_30d
		FROM g
		WHERE gap_days >= 180 AND plays_30d >= 5
		ORDER BY gap_days DESC, plays_30d DESC LIMIT 1`);
	return rows[0] ?? null;
}

// Your single most-consumed calendar day, and the artist who led it. Only counts
// when the day clears 6 hours so a thin library doesn't surface an ordinary
// afternoon as a marathon.
async function storyMarathon(): Promise<StoryMarathon | null> {
	const day = (
		await query<{
			date: string;
			weekday: string;
			hours: number;
			streams: number;
		}>(`
		SELECT strftime(CAST(started_local AS DATE), '%Y-%m-%d') AS date,
		       dayname(started_local)                            AS weekday,
		       sum(ms_played) / 3600000.0                        AS hours,
		       count(*) FILTER (WHERE counts_as_stream)          AS streams
		FROM listens
		GROUP BY 1, 2 HAVING sum(ms_played) / 3600000.0 >= 6
		ORDER BY hours DESC LIMIT 1`)
	)[0];
	if (!day) return null;

	const top = (
		await query<{ artist: string }>(
			`
		SELECT COALESCE(artist_name, '?') AS artist
		FROM listens WHERE CAST(started_local AS DATE) = CAST(? AS DATE)
		GROUP BY artist_name ORDER BY count(*) DESC LIMIT 1`,
			[day.date],
		)
	)[0];
	return { ...day, artist: top?.artist ?? "?" };
}

// A track you played many times and never once skipped — the counter-confession
// to the persona's skip rate. The overall skip ratio rides along for contrast.
async function storyDevotion(): Promise<StoryDevotion | null> {
	const rows = await query<StoryDevotion>(`
		SELECT track_uri,
		       COALESCE(max(track_name), '?')  AS name,
		       COALESCE(max(artist_name), '?') AS artist,
		       count(*)                        AS plays,
		       (SELECT avg(CASE WHEN was_skipped THEN 1.0 ELSE 0.0 END) FROM listens)
		           AS skip_ratio
		FROM listens
		GROUP BY track_uri
		HAVING count(*) >= 25
		   AND sum(CASE WHEN was_skipped THEN 1 ELSE 0 END) = 0
		ORDER BY count(*) DESC LIMIT 1`);
	return rows[0] ?? null;
}

export async function story(): Promise<Story> {
	const [
		origin,
		persona,
		obsession,
		faded,
		companion,
		comeback,
		marathon,
		devotion,
	] = await Promise.all([
		storyOrigin(),
		storyPersona(),
		storyObsession(),
		storyFaded(),
		storyCompanion(),
		storyComeback(),
		storyMarathon(),
		storyDevotion(),
	]);
	return {
		origin,
		persona,
		obsession,
		faded,
		companion,
		comeback,
		marathon,
		devotion,
	};
}

// --- streak: consecutive listening days -------------------------------------

// The current and all-time-longest runs of consecutive calendar days with at
// least one real stream. Classic gaps-and-islands: number the distinct active
// days, and (day - row_number) is constant within a consecutive run, so it keys
// the islands. A day counts only when `counts_as_stream` (≥30s), so a day spent
// skipping doesn't prop up a streak. "Current" is the run ending on the most
// recent active day — anchored on the data, not wall-clock, since the export is
// static. Returns null for an empty library so the card omits itself.
export async function streak(): Promise<Streak | null> {
	const row = (
		await query<{
			longest: number | null;
			longest_start: string | null;
			longest_end: string | null;
			current: number | null;
			current_start: string | null;
			last_active: string | null;
		}>(`
		WITH days AS (
			SELECT DISTINCT CAST(started_local AS DATE) AS d
			FROM listens WHERE counts_as_stream
		),
		grp AS (
			SELECT d, d - CAST(ROW_NUMBER() OVER (ORDER BY d) AS INTEGER) AS g
			FROM days
		),
		runs AS (
			SELECT min(d) AS start_d, max(d) AS end_d, count(*)::INTEGER AS len
			FROM grp GROUP BY g
		)
		SELECT
			(SELECT max(len) FROM runs) AS longest,
			strftime((SELECT start_d FROM runs ORDER BY len DESC, end_d DESC LIMIT 1),
			         '%Y-%m-%d') AS longest_start,
			strftime((SELECT end_d FROM runs ORDER BY len DESC, end_d DESC LIMIT 1),
			         '%Y-%m-%d') AS longest_end,
			(SELECT len FROM runs ORDER BY end_d DESC LIMIT 1) AS current,
			strftime((SELECT start_d FROM runs ORDER BY end_d DESC LIMIT 1),
			         '%Y-%m-%d') AS current_start,
			strftime((SELECT max(end_d) FROM runs), '%Y-%m-%d') AS last_active`)
	)[0];
	if (!row || row.longest === null) return null;
	return {
		longest: row.longest,
		longest_start: row.longest_start ?? "",
		longest_end: row.longest_end ?? "",
		current: row.current ?? 0,
		current_start: row.current_start ?? "",
		last_active: row.last_active ?? "",
	};
}

// --- pace: this year against last year, to the same point ------------------

// This-year-to-date totals vs the same day-of-year last year, anchored on the
// data's latest play (the export is static, so "this year" is the year of
// max(ts) and "to date" is its day-of-year). The view turns this into an
// ahead/behind verdict and a naive year-end projection. Null when empty.
export async function pace(): Promise<Pace | null> {
	const row = (
		await query<Pace>(`
		WITH b AS (
			SELECT year(max(ts)) AS yr, dayofyear(max(ts)) AS doy FROM listens
		)
		SELECT b.yr AS year, b.doy AS doy,
		       count(*) FILTER (WHERE year(l.ts) = b.yr)                 AS this_plays,
		       COALESCE(sum(l.ms_played) FILTER (WHERE year(l.ts) = b.yr), 0)
		           / 3600000.0                                           AS this_hours,
		       count(*) FILTER (
		           WHERE year(l.ts) = b.yr - 1 AND dayofyear(l.ts) <= b.doy
		       )                                                         AS prev_plays,
		       COALESCE(sum(l.ms_played) FILTER (
		           WHERE year(l.ts) = b.yr - 1 AND dayofyear(l.ts) <= b.doy
		       ), 0) / 3600000.0                                         AS prev_hours
		FROM listens l, b
		GROUP BY b.yr, b.doy`)
	)[0];
	return row ?? null;
}

// --- discovery: new artists/tracks met this year ---------------------------

// First-ever play per artist and per track gives a "met this year" count; the
// same point last year rides along for an ahead/behind read, and the single
// biggest discovery year (most artists first heard) feeds the records board.
// Anchored on max(ts) like pace(). Null when empty.
export async function discovery(): Promise<Discovery | null> {
	const row = (
		await query<{
			year: number | null;
			this_artists: number;
			this_tracks: number;
			prev_artists: number;
			best_year: number | null;
			best_count: number | null;
		}>(`
		WITH b AS (
			SELECT year(max(ts)) AS yr, dayofyear(max(ts)) AS doy FROM listens
		),
		afirst AS (
			SELECT artist_name, min(ts) AS f
			FROM listens WHERE artist_name IS NOT NULL GROUP BY artist_name
		),
		tfirst AS (SELECT track_uri, min(ts) AS f FROM listens GROUP BY track_uri),
		ayear AS (SELECT year(f) AS yr, count(*) AS n FROM afirst GROUP BY year(f))
		SELECT b.yr AS year,
		       (SELECT count(*) FROM afirst WHERE year(f) = b.yr)        AS this_artists,
		       (SELECT count(*) FROM tfirst WHERE year(f) = b.yr)        AS this_tracks,
		       (SELECT count(*) FROM afirst
		           WHERE year(f) = b.yr - 1 AND dayofyear(f) <= b.doy)   AS prev_artists,
		       (SELECT yr  FROM ayear ORDER BY n DESC LIMIT 1)           AS best_year,
		       (SELECT max(n) FROM ayear)                                AS best_count
		FROM b`)
	)[0];
	if (!row || row.year === null) return null;
	return {
		year: row.year,
		this_artists: row.this_artists,
		this_tracks: row.this_tracks,
		prev_artists: row.prev_artists,
		best_year: row.best_year ?? row.year,
		best_count: row.best_count ?? 0,
	};
}

// --- records: the personal-bests board -------------------------------------

// The hero superlatives gathered in one pass: the single most-consumed calendar
// day, the most plays of one track in a day, and the longest back-to-back
// repeat-one run. The board also shows the longest streak and biggest discovery
// year, but those come free from the streak()/discovery() queries the same page
// already runs. Null when empty.
export async function records(): Promise<Records | null> {
	const row = (
		await query<{
			day_date: string | null;
			day_hours: number | null;
			obs_uri: string | null;
			obs_name: string | null;
			obs_artist: string | null;
			obs_plays: number | null;
			loop_uri: string | null;
			loop_name: string | null;
			loop_artist: string | null;
			loop_run: number | null;
		}>(`
		WITH day AS (
			SELECT CAST(started_local AS DATE) AS d, sum(ms_played) / 3600000.0 AS h
			FROM listens GROUP BY d ORDER BY h DESC LIMIT 1
		),
		obs AS (
			SELECT track_uri,
			       COALESCE(max(track_name), '?')  AS name,
			       COALESCE(max(artist_name), '?') AS artist,
			       count(*) AS plays
			FROM listens GROUP BY track_uri, CAST(started_local AS DATE)
			ORDER BY plays DESC LIMIT 1
		),
		flagged AS (
			SELECT track_uri, track_name, artist_name, started_local,
			       CASE WHEN LAG(track_uri) OVER (ORDER BY started_local) = track_uri
			            THEN 0 ELSE 1 END AS is_new
			FROM listens
		),
		runs AS (SELECT *, sum(is_new) OVER (ORDER BY started_local) AS rid FROM flagged),
		loop AS (
			SELECT track_uri,
			       COALESCE(max(track_name), '?')  AS name,
			       COALESCE(max(artist_name), '?') AS artist,
			       count(*) AS run
			FROM runs GROUP BY track_uri, rid ORDER BY run DESC LIMIT 1
		)
		SELECT strftime((SELECT d FROM day), '%Y-%m-%d') AS day_date,
		       (SELECT h        FROM day)  AS day_hours,
		       (SELECT track_uri FROM obs) AS obs_uri,
		       (SELECT name     FROM obs)  AS obs_name,
		       (SELECT artist   FROM obs)  AS obs_artist,
		       (SELECT plays    FROM obs)  AS obs_plays,
		       (SELECT track_uri FROM loop) AS loop_uri,
		       (SELECT name     FROM loop) AS loop_name,
		       (SELECT artist   FROM loop) AS loop_artist,
		       (SELECT run      FROM loop) AS loop_run`)
	)[0];
	if (!row || row.day_date === null) return null;
	return {
		day_date: row.day_date,
		day_hours: row.day_hours ?? 0,
		obs_uri: row.obs_uri ?? "",
		obs_name: row.obs_name ?? "?",
		obs_artist: row.obs_artist ?? "?",
		obs_plays: row.obs_plays ?? 0,
		loop_uri: row.loop_uri ?? "",
		loop_name: row.loop_name ?? "?",
		loop_artist: row.loop_artist ?? "?",
		loop_run: row.loop_run ?? 0,
	};
}

// --- top.go -----------------------------------------------------------------

export async function topTracks(
	metric: Metric,
	p: Period,
	minMs: number,
	limit: number,
	offset = 0,
): Promise<TopTrack[]> {
	const conds = ["ms_played >= ?"];
	const args: unknown[] = [minMs];
	periodWhere(p, conds, args);
	args.push(limit, offset);
	return query<TopTrack>(
		`
		SELECT track_uri,
		       COALESCE(max(track_name), '?')  AS name,
		       COALESCE(max(artist_name), '?') AS artist,
		       count(*)                        AS plays,
		       sum(ms_played) / 3600000.0      AS hours
		FROM listens
		WHERE ${conds.join(" AND ")}
		GROUP BY track_uri
		ORDER BY ${METRICS[metric]} DESC, track_uri
		LIMIT ? OFFSET ?`,
		args,
	);
}

export async function topArtists(
	metric: Metric,
	p: Period,
	minMs: number,
	limit: number,
	offset = 0,
): Promise<TopArtist[]> {
	const conds = ["ms_played >= ?", "artist_name IS NOT NULL"];
	const args: unknown[] = [minMs];
	periodWhere(p, conds, args);
	args.push(limit, offset);
	return query<TopArtist>(
		`
		SELECT artist_name                AS artist,
		       count(*)                   AS plays,
		       sum(ms_played) / 3600000.0 AS hours,
		       count(DISTINCT track_uri)  AS tracks
		FROM listens
		WHERE ${conds.join(" AND ")}
		GROUP BY artist_name
		ORDER BY ${METRICS[metric]} DESC, artist_name
		LIMIT ? OFFSET ?`,
		args,
	);
}

// Albums are grouped by (artist, album) since the export has no album id. Blank
// album names are excluded so the list isn't headed by a giant "?" bucket.
export async function topAlbums(
	metric: Metric,
	p: Period,
	minMs: number,
	limit: number,
	offset = 0,
): Promise<TopAlbum[]> {
	const conds = [
		"ms_played >= ?",
		"album_name IS NOT NULL",
		"album_name <> ''",
	];
	const args: unknown[] = [minMs];
	periodWhere(p, conds, args);
	args.push(limit, offset);
	return query<TopAlbum>(
		`
		SELECT album_name                 AS album,
		       COALESCE(artist_name, '?')  AS artist,
		       count(*)                   AS plays,
		       sum(ms_played) / 3600000.0 AS hours,
		       count(DISTINCT track_uri)  AS tracks
		FROM listens
		WHERE ${conds.join(" AND ")}
		GROUP BY album_name, artist_name
		ORDER BY ${METRICS[metric]} DESC, album_name, artist_name
		LIMIT ? OFFSET ?`,
		args,
	);
}

// --- patterns.go ------------------------------------------------------------

// Patterns bucket on started_local: playback START time converted to local tz
// (ts alone is the UTC stop time and lands long tracks in the wrong hour).
async function pattern(bucketExpr: string, p: Period): Promise<Bucket[]> {
	const conds = ["ms_played >= ?"];
	const args: unknown[] = [30000];
	periodWhere(p, conds, args);
	return query<Bucket>(
		`
		SELECT ${bucketExpr}              AS bucket,
		       count(*)                   AS plays,
		       sum(ms_played) / 3600000.0 AS hours
		FROM listens
		WHERE ${conds.join(" AND ")}
		GROUP BY bucket
		ORDER BY bucket`,
		args,
	);
}

export const hourly = (p: Period) => pattern("hour(started_local)", p);
export const weekly = (p: Period) => pattern("isodow(started_local)", p);

// --- tracks.go ---------------------------------------------------------------

// The frontend ships the whole distinct-track list once and filters/sorts in
// memory, so the old search/sort/cursor machinery is gone — one aggregate
// query covers the Library view and the command palette.
export async function allTracks(): Promise<TracksPage> {
	const items = await query<TrackRow>(`
		SELECT track_uri,
		       COALESCE(max(track_name), '?')  AS name,
		       COALESCE(max(artist_name), '?') AS artist,
		       COALESCE(max(album_name), '?')  AS album,
		       count(*)                        AS plays,
		       sum(ms_played) / 3600000.0      AS hours,
		       min(ts)                         AS first_play,
		       max(ts)                         AS last_play,
		       avg(CASE WHEN was_skipped THEN 1.0 ELSE 0.0 END) AS skip_ratio
		FROM listens
		GROUP BY track_uri
		ORDER BY plays DESC`);
	return { items, next_cursor: null, total: items.length };
}

// --- plays.go ----------------------------------------------------------------

const PLAYS_LIMIT = 200;

// Browses the raw stream log, newest first. Keyset pagination on
// (ts, track_uri) — never offset, never the whole log at once.
export async function plays(
	cursor: string | undefined,
	search: string,
	p: Period,
): Promise<PlaysPage> {
	const conds = ["1=1"];
	const args: unknown[] = [];
	if (search) {
		const pat = `%${escapeLike(search)}%`;
		conds.push(
			"(track_name ILIKE ? ESCAPE '\\' OR artist_name ILIKE ? ESCAPE '\\')",
		);
		args.push(pat, pat);
	}
	periodWhere(p, conds, args);
	if (cursor) {
		const c = decodeCursor(cursor);
		conds.push(
			"(ts < CAST(? AS TIMESTAMP) OR (ts = CAST(? AS TIMESTAMP) AND track_uri < ?))",
		);
		args.push(c.ts, c.ts, c.uri);
	}
	args.push(PLAYS_LIMIT);

	const items = await query<PlayRow>(
		`
		SELECT ts, ms_played,
		       COALESCE(track_name, '?')  AS name,
		       COALESCE(artist_name, '?') AS artist,
		       COALESCE(album_name, '?')  AS album,
		       track_uri,
		       was_skipped AS skipped, shuffle, platform,
		       conn_country AS country
		FROM listens
		WHERE ${conds.join(" AND ")}
		ORDER BY ts DESC, track_uri DESC
		LIMIT ?`,
		args,
	);

	const last = items.length === PLAYS_LIMIT ? items[items.length - 1] : null;
	return {
		items,
		next_cursor: last ? encodeCursor(last.ts, last.track_uri) : null,
	};
}

// --- detail.go ---------------------------------------------------------------

// monthly returns plays/hours per calendar month for any single-arg WHERE
// clause (used by both track and artist detail timelines).
function monthly(where: string, arg: string): Promise<MonthCount[]> {
	return query<MonthCount>(
		`
		SELECT strftime(date_trunc('month', started_local), '%Y-%m') AS month,
		       count(*) AS plays, sum(ms_played) / 3600000.0 AS hours
		FROM listens WHERE ${where}
		GROUP BY month ORDER BY month`,
		[arg],
	);
}

// Bucket query rows by track_uri, preserving row order within each track (so a
// query's ORDER BY carries through to the per-track array).
function groupByUri<T extends { track_uri: string }>(
	rows: T[],
): Map<string, T[]> {
	const m = new Map<string, T[]>();
	for (const r of rows) {
		const a = m.get(r.track_uri);
		if (a) a.push(r);
		else m.set(r.track_uri, [r]);
	}
	return m;
}

// --- Hoisted global passes (computed once per dataset, keyed by track_uri) ----

// §I rankYearly for every track at once: rank among all tracks within each year.
// Identical window to the old per-track query, just collected for all tracks.
function rankYearlyMap(): Promise<Map<string, RankYear[]>> {
	rankYearlyMapPromise ??= query<{ track_uri: string } & RankYear>(
		`
		WITH r AS (
			SELECT track_uri, year(started_local) AS y,
			       RANK() OVER (PARTITION BY year(started_local) ORDER BY count(*) DESC) AS "rank"
			FROM listens GROUP BY track_uri, year(started_local)
		)
		SELECT track_uri, y AS year, "rank" FROM r ORDER BY track_uri, y`,
	).then((rows) => groupByUri(rows));
	return rankYearlyMapPromise;
}

// §A Segue map for every track: the tracks most often heard immediately
// before/after each one. One global LAG/LEAD pass over the timeline; the 30-min
// start-to-start guard keeps overnight gaps from stitching unrelated sessions,
// and self-transitions (repeat-one loops) are excluded — those belong to §F.
// QUALIFY keeps the top 5 per (track, direction).
function segueMap(): Promise<Map<string, SegueEntry>> {
	segueMapPromise ??= query<
		Neighbor & { cur: string; dir: "before" | "after" }
	>(
		`
		WITH seq AS (
			SELECT track_uri AS cur, started_local AS cur_ts,
			       LAG(track_uri)      OVER w AS prev_uri,
			       LAG(track_name)     OVER w AS prev_name,
			       LAG(artist_name)    OVER w AS prev_artist,
			       LAG(started_local)  OVER w AS prev_ts,
			       LEAD(track_uri)     OVER w AS next_uri,
			       LEAD(track_name)    OVER w AS next_name,
			       LEAD(artist_name)   OVER w AS next_artist,
			       LEAD(started_local) OVER w AS next_ts
			FROM listens
			WINDOW w AS (ORDER BY started_local, track_uri)
		),
		nb AS (
			SELECT cur, 'after' AS dir, next_uri AS track_uri,
			       COALESCE(max(next_name), '?')   AS name,
			       COALESCE(max(next_artist), '?') AS artist,
			       count(*) AS plays
			FROM seq
			WHERE next_uri IS NOT NULL AND next_uri <> cur
			  AND next_ts - cur_ts < INTERVAL '30 minutes'
			GROUP BY cur, next_uri
			UNION ALL
			SELECT cur, 'before', prev_uri,
			       COALESCE(max(prev_name), '?'),
			       COALESCE(max(prev_artist), '?'),
			       count(*)
			FROM seq
			WHERE prev_uri IS NOT NULL AND prev_uri <> cur
			  AND cur_ts - prev_ts < INTERVAL '30 minutes'
			GROUP BY cur, prev_uri
		)
		SELECT cur, dir, track_uri, name, artist, plays FROM nb
		QUALIFY ROW_NUMBER() OVER (PARTITION BY cur, dir ORDER BY plays DESC) <= 5
		ORDER BY cur, dir, plays DESC`,
	).then((rows) => {
		const m = new Map<string, SegueEntry>();
		for (const r of rows) {
			let e = m.get(r.cur);
			if (!e) {
				e = { before: [], after: [] };
				m.set(r.cur, e);
			}
			const n: Neighbor = {
				track_uri: r.track_uri,
				name: r.name,
				artist: r.artist,
				plays: r.plays,
			};
			(r.dir === "before" ? e.before : e.after).push(n);
		}
		return m;
	});
	return segueMapPromise;
}

// §B Origin map for every track: each track's first play, fleshed out, plus the
// track played right before it (the gateway). Because it's the *first* play, the
// row immediately before it in the global order is necessarily a different track
// — except for the degenerate case of duplicate rows sharing the exact first
// timestamp, where prev_uri == cur and we drop the gateway (matches the old
// `track_uri <> uri` guard).
function originMap(): Promise<Map<string, TrackOrigin>> {
	originMapPromise ??= query<{
		track_uri: string;
		date: string;
		weekday: string;
		platform: string;
		reason_start: string;
		prev_uri: string | null;
		prev_name: string | null;
		prev_artist: string | null;
	}>(
		`
		WITH seq AS (
			SELECT track_uri, started_local,
			       strftime(CAST(started_local AS DATE), '%Y-%m-%d') AS date,
			       dayname(started_local)                            AS weekday,
			       COALESCE(platform, '?')                           AS platform,
			       COALESCE(reason_start, '?')                       AS reason_start,
			       LAG(track_uri)   OVER w AS prev_uri,
			       LAG(track_name)  OVER w AS prev_name,
			       LAG(artist_name) OVER w AS prev_artist,
			       ROW_NUMBER() OVER (PARTITION BY track_uri ORDER BY started_local) AS rn
			FROM listens
			WINDOW w AS (ORDER BY started_local, track_uri)
		)
		SELECT track_uri, date, weekday, platform, reason_start,
		       prev_uri, prev_name, prev_artist
		FROM seq WHERE rn = 1`,
	).then((rows) => {
		const m = new Map<string, TrackOrigin>();
		for (const r of rows) {
			const sameTrack = r.prev_uri === r.track_uri;
			m.set(r.track_uri, {
				date: r.date,
				weekday: r.weekday,
				platform: r.platform,
				reason_start: r.reason_start,
				prev_uri: sameTrack ? null : (r.prev_uri ?? null),
				prev_name: sameTrack ? "" : (r.prev_name ?? ""),
				prev_artist: sameTrack ? "" : (r.prev_artist ?? ""),
			});
		}
		return m;
	});
	return originMapPromise;
}

// §F Repeat-one loop map for every track: the longest back-to-back consecutive
// run of each track (gaps-and-islands on the global timeline, then the longest
// island per track). Runs of length < 2 are dropped, so a track absent from the
// map simply never repeated.
function loopMap(): Promise<Map<string, TrackLoop>> {
	loopMapPromise ??= query<{ track_uri: string } & TrackLoop>(
		`
		WITH flagged AS (
			SELECT track_uri, started_local,
			       CASE WHEN LAG(track_uri) OVER (ORDER BY started_local) = track_uri
			            THEN 0 ELSE 1 END AS is_new
			FROM listens
		),
		runs AS (
			SELECT *, sum(is_new) OVER (ORDER BY started_local) AS run_id FROM flagged
		),
		per AS (
			SELECT track_uri, count(*) AS longest_run,
			       strftime(min(started_local), '%Y-%m-%d') AS date
			FROM runs GROUP BY track_uri, run_id
		)
		SELECT track_uri, longest_run, date FROM per
		QUALIFY ROW_NUMBER() OVER (PARTITION BY track_uri ORDER BY longest_run DESC) = 1`,
	).then((rows) => {
		const m = new Map<string, TrackLoop>();
		for (const r of rows) {
			if (r.longest_run >= 2)
				m.set(r.track_uri, { longest_run: r.longest_run, date: r.date });
		}
		return m;
	});
	return loopMapPromise;
}

// The headline aggregates every head needs, computed straight off `listens`.
// GROUP BY track_uri so the exact same SELECT serves one track or a batch — the
// only difference is the WHERE (a single `=` vs an `IN`). Kept in one place so
// the single and batched paths can never drift.
const HEAD_AGG = `
	track_uri,
	COALESCE(max(track_name), '?')  AS name,
	COALESCE(max(artist_name), '?') AS artist,
	COALESCE(max(album_name), '?')  AS album,
	count(*)                        AS plays,
	sum(ms_played) / 3600000.0      AS hours,
	avg(CASE WHEN was_skipped THEN 1.0 ELSE 0.0 END) AS skip_ratio,
	min(ts) AS first_play, max(ts) AS last_play,
	max(ms_played) AS max_ms`;

type HeadAgg = {
	track_uri: string;
	name: string;
	artist: string;
	album: string;
	plays: number;
	hours: number | null;
	skip_ratio: number | null;
	first_play: string | null;
	last_play: string | null;
	max_ms: number | null;
};

function toHead(
	row: HeadAgg,
	skip_ratio_all: number,
	rank_plays: number,
): TrackHead {
	return {
		track_uri: row.track_uri,
		name: row.name,
		artist: row.artist,
		album: row.album,
		plays: row.plays,
		hours: row.hours ?? 0,
		skip_ratio: row.skip_ratio ?? 0,
		skip_ratio_all,
		first_play: row.first_play ?? "",
		last_play: row.last_play ?? "",
		rank_plays,
		max_ms: row.max_ms ?? 0,
	};
}

// The §D completion bands, in the fixed order the frontend renders them.
const COMPLETION_ORDER = ["finished", "most", "partial", "bailed", "unknown"];

function orderCompletion(rows: LabelCount[]): LabelCount[] {
	const got = new Map(rows.map((b) => [b.label, b.plays]));
	const out: LabelCount[] = [];
	for (const label of COMPLETION_ORDER) {
		const plays = got.get(label);
		if (plays !== undefined) out.push({ label, plays });
	}
	return out;
}

// One row per requested track, every list-valued panel rolled up into a JSON
// string with `to_json(list(struct_pack(...)))` so the whole batch comes back in
// a single statement. A `base` CTE filters `listens` to the requested uris once;
// each panel CTE aggregates off it and the final SELECT stitches them by
// track_uri. The four global-window panels (segue/origin/loop/rank-by-year) are
// NOT here — they stay in the session-memoized maps so they're computed once over
// the whole log, not per batch.
function detailSql(placeholders: string): string {
	return `
	WITH base AS (
		SELECT * FROM listens WHERE track_uri IN (${placeholders})
	),
	head AS (SELECT ${HEAD_AGG} FROM base GROUP BY track_uri),
	monthly AS (
		SELECT track_uri, to_json(list(struct_pack(month := month, plays := plays, hours := hours) ORDER BY month))::VARCHAR AS monthly
		FROM (
			SELECT track_uri, strftime(date_trunc('month', started_local), '%Y-%m') AS month,
			       count(*) AS plays, sum(ms_played) / 3600000.0 AS hours
			FROM base GROUP BY track_uri, month
		) GROUP BY track_uri
	),
	hourly AS (
		SELECT track_uri, to_json(list(struct_pack(bucket := bucket, plays := plays, hours := hours) ORDER BY bucket))::VARCHAR AS hourly
		FROM (
			SELECT track_uri, hour(started_local) AS bucket, count(*) AS plays,
			       sum(ms_played) / 3600000.0 AS hours
			FROM base GROUP BY track_uri, bucket
		) GROUP BY track_uri
	),
	weekly AS (
		SELECT track_uri, to_json(list(struct_pack(bucket := bucket, plays := plays, hours := hours) ORDER BY bucket))::VARCHAR AS weekly
		FROM (
			SELECT track_uri, isodow(started_local) AS bucket, count(*) AS plays,
			       sum(ms_played) / 3600000.0 AS hours
			FROM base GROUP BY track_uri, bucket
		) GROUP BY track_uri
	),
	platforms AS (
		SELECT track_uri, to_json(list(struct_pack(label := label, plays := plays) ORDER BY plays DESC))::VARCHAR AS platforms
		FROM (
			SELECT track_uri, platform AS label, count(*) AS plays
			FROM base GROUP BY track_uri, platform
		) GROUP BY track_uri
	),
	rstart AS (
		SELECT track_uri, to_json(list(struct_pack(label := label, plays := plays) ORDER BY plays DESC))::VARCHAR AS reason_start
		FROM (
			SELECT track_uri, COALESCE(reason_start, '?') AS label, count(*) AS plays
			FROM base GROUP BY track_uri, COALESCE(reason_start, '?')
		) GROUP BY track_uri
	),
	rend AS (
		SELECT track_uri, to_json(list(struct_pack(label := label, plays := plays) ORDER BY plays DESC))::VARCHAR AS reason_end
		FROM (
			SELECT track_uri, COALESCE(reason_end, '?') AS label, count(*) AS plays
			FROM base GROUP BY track_uri, COALESCE(reason_end, '?')
		) GROUP BY track_uri
	),
	ctry AS (
		SELECT track_uri, to_json(list(struct_pack(label := label, plays := plays) ORDER BY plays DESC))::VARCHAR AS countries
		FROM (
			SELECT track_uri, COALESCE(conn_country, '?') AS label, count(*) AS plays
			FROM base GROUP BY track_uri, COALESCE(conn_country, '?')
		) GROUP BY track_uri
	),
	comp AS (
		SELECT track_uri, to_json(list(struct_pack(label := label, plays := plays)))::VARCHAR AS completion
		FROM (
			SELECT track_uri, CASE
				WHEN maxms = 0 OR maxms IS NULL THEN 'unknown'
				WHEN ms_played >= maxms * 0.9 THEN 'finished'
				WHEN ms_played >= maxms * 0.5 THEN 'most'
				WHEN ms_played >= maxms * 0.1 THEN 'partial'
				ELSE 'bailed'
			END AS label, count(*) AS plays
			FROM (SELECT track_uri, ms_played, max(ms_played) OVER (PARTITION BY track_uri) AS maxms FROM base)
			GROUP BY track_uri, label
		) GROUP BY track_uri
	),
	compy AS (
		SELECT track_uri, to_json(list(struct_pack(year := yr, avg_completion := avg_completion) ORDER BY yr))::VARCHAR AS completion_yearly
		FROM (
			SELECT track_uri, year(started_local) AS yr,
			       avg(least(ms_played::DOUBLE / nullif(maxms, 0), 1.0)) AS avg_completion
			FROM (SELECT track_uri, started_local, ms_played, max(ms_played) OVER (PARTITION BY track_uri) AS maxms FROM base)
			GROUP BY track_uri, yr
		) GROUP BY track_uri
	),
	shuffle AS (
		SELECT track_uri,
		       avg(CASE WHEN shuffle THEN 1.0 ELSE 0.0 END) AS shuffle_ratio,
		       avg(CASE WHEN was_skipped THEN 1.0 ELSE 0.0 END) FILTER (WHERE shuffle) AS skip_shuffle,
		       avg(CASE WHEN was_skipped THEN 1.0 ELSE 0.0 END) FILTER (WHERE NOT COALESCE(shuffle, false)) AS skip_intentional
		FROM base GROUP BY track_uri
	),
	season AS (
		SELECT track_uri,
		       ((CAST(round(atan2(ss, sc) / (2 * pi()) * 12) AS INTEGER) % 12) + 12) % 12 AS season_peak_month,
		       sqrt(sc * sc + ss * ss) / plays AS season_concentration,
		       years AS season_years
		FROM (
			SELECT track_uri, count(*) AS plays, count(DISTINCT year(started_local)) AS years,
			       sum(cos(2 * pi() * (month(started_local) - 1) / 12.0)) AS sc,
			       sum(sin(2 * pi() * (month(started_local) - 1) / 12.0)) AS ss
			FROM base GROUP BY track_uri
		) WHERE plays > 0
	),
	binge AS (
		SELECT track_uri, count(*) AS binge_days
		FROM (
			SELECT track_uri, CAST(started_local AS DATE) AS d
			FROM base GROUP BY track_uri, d HAVING count(*) >= 3
		) GROUP BY track_uri
	),
	ranked AS (
		SELECT track_uri, started_local,
		       ROW_NUMBER() OVER (PARTITION BY track_uri ORDER BY started_local) AS rn
		FROM base
	),
	mtier AS (
		SELECT track_uri, list_max(list_filter([1000, 500, 250, 100, 50, 25, 10], x -> x <= plays)) AS n
		FROM (SELECT track_uri, count(*) AS plays FROM base GROUP BY track_uri)
	),
	milestone AS (
		SELECT m.track_uri, m.n AS milestone_n,
		       strftime(CAST(r.started_local AS DATE), '%Y-%m-%d') AS milestone_date
		FROM mtier m JOIN ranked r ON r.track_uri = m.track_uri AND r.rn = m.n
		WHERE m.n IS NOT NULL
	),
	comeback AS (
		SELECT track_uri,
		       strftime(ts, '%Y-%m-%d') AS comeback_date,
		       gap_days AS comeback_gap_days, plays_30d AS comeback_plays_30d
		FROM (
			SELECT track_uri, ts,
			       date_diff('day', LAG(ts) OVER (PARTITION BY track_uri ORDER BY ts), ts) AS gap_days,
			       count(*) OVER (
			           PARTITION BY track_uri ORDER BY ts
			           RANGE BETWEEN CURRENT ROW AND INTERVAL '30 days' FOLLOWING
			       ) AS plays_30d
			FROM base
		)
		WHERE gap_days >= 180 AND plays_30d >= 5
		QUALIFY ROW_NUMBER() OVER (PARTITION BY track_uri ORDER BY gap_days DESC, plays_30d DESC) = 1
	)
	SELECT head.*,
	       monthly.monthly, hourly.hourly, weekly.weekly, platforms.platforms,
	       rstart.reason_start, rend.reason_end, ctry.countries,
	       comp.completion, compy.completion_yearly,
	       shuffle.shuffle_ratio, shuffle.skip_shuffle, shuffle.skip_intentional,
	       season.season_peak_month, season.season_concentration, season.season_years,
	       binge.binge_days,
	       milestone.milestone_n, milestone.milestone_date,
	       comeback.comeback_date, comeback.comeback_gap_days, comeback.comeback_plays_30d
	FROM head
	LEFT JOIN monthly USING (track_uri)
	LEFT JOIN hourly USING (track_uri)
	LEFT JOIN weekly USING (track_uri)
	LEFT JOIN platforms USING (track_uri)
	LEFT JOIN rstart USING (track_uri)
	LEFT JOIN rend USING (track_uri)
	LEFT JOIN ctry USING (track_uri)
	LEFT JOIN comp USING (track_uri)
	LEFT JOIN compy USING (track_uri)
	LEFT JOIN shuffle USING (track_uri)
	LEFT JOIN season USING (track_uri)
	LEFT JOIN binge USING (track_uri)
	LEFT JOIN milestone USING (track_uri)
	LEFT JOIN comeback USING (track_uri)`;
}

// The flat row the mega-statement returns: head columns + JSON-string list panels
// + scalar/single-value panels spread into named columns.
type DetailRow = HeadAgg & {
	monthly: string | null;
	hourly: string | null;
	weekly: string | null;
	platforms: string | null;
	reason_start: string | null;
	reason_end: string | null;
	countries: string | null;
	completion: string | null;
	completion_yearly: string | null;
	shuffle_ratio: number | null;
	skip_shuffle: number | null;
	skip_intentional: number | null;
	season_peak_month: number | null;
	season_concentration: number | null;
	season_years: number | null;
	binge_days: number | null;
	milestone_n: number | null;
	milestone_date: string | null;
	comeback_date: string | null;
	comeback_gap_days: number | null;
	comeback_plays_30d: number | null;
};

function parseList<T>(s: string | null): T[] {
	return s ? (JSON.parse(s) as T[]) : [];
}

// Full track detail (cards + every panel) for a batch of tracks. The per-track
// panels come back from one mega-statement (`detailSql`); segue/origin/loop/
// rank-by-year are read from the session-memoized global maps. So warming a
// screenful of links is a single round-trip over one filtered scan, not N opens.
// URIs absent from `listens` are simply missing from the result.
export async function trackDetails(uris: string[]): Promise<TrackDetail[]> {
	if (uris.length === 0) return [];
	const placeholders = uris.map(() => "?").join(",");

	const [rows, skip_ratio_all, rankMap, segueM, originM, loopM, rankYearlyM] =
		await Promise.all([
			query<DetailRow>(detailSql(placeholders), uris),
			librarySkipRate(),
			trackRankMap(),
			segueMap(),
			originMap(),
			loopMap(),
			rankYearlyMap(),
		]);

	return rows.map((r) => {
		const uri = r.track_uri;
		const seg = segueM.get(uri);
		return {
			...toHead(r, skip_ratio_all, rankMap.get(uri) ?? 0),
			monthly: parseList<MonthCount>(r.monthly),
			hourly: parseList<Bucket>(r.hourly),
			weekly: parseList<Bucket>(r.weekly),
			platforms: parseList<LabelCount>(r.platforms),
			reason_start: parseList<LabelCount>(r.reason_start),
			reason_end: parseList<LabelCount>(r.reason_end),
			completion: orderCompletion(parseList<LabelCount>(r.completion)),
			completion_yearly: parseList<CompletionYear>(r.completion_yearly),
			countries: parseList<LabelCount>(r.countries),
			rank_yearly: rankYearlyM.get(uri) ?? [],
			shuffle_ratio: r.shuffle_ratio ?? 0,
			skip_shuffle: r.skip_shuffle ?? null,
			skip_intentional: r.skip_intentional ?? null,
			neighbors_before: seg?.before ?? [],
			neighbors_after: seg?.after ?? [],
			origin: originM.get(uri) ?? null,
			loop: loopM.get(uri) ?? null,
			binge_days: r.binge_days ?? 0,
			season:
				r.season_peak_month == null
					? null
					: {
							peak_month: r.season_peak_month,
							concentration: r.season_concentration ?? 0,
							years: r.season_years ?? 0,
						},
			milestone:
				r.milestone_n != null && r.milestone_date
					? { n: r.milestone_n, date: r.milestone_date }
					: null,
			comeback: r.comeback_date
				? {
						date: r.comeback_date,
						gap_days: r.comeback_gap_days ?? 0,
						plays_30d: r.comeback_plays_30d ?? 0,
					}
				: null,
		};
	});
}

// Single track detail — the cold-navigation path. Just the batch of one; the
// hoisted maps it reads are shared with any bulk warm already in flight.
export async function trackDetail(uri: string): Promise<TrackDetail> {
	const [detail] = await trackDetails([uri]);
	if (!detail) throw new Error("not found");
	return detail;
}

export async function artist(name: string): Promise<ArtistDetail> {
	const head = one(
		await query<{
			plays: number;
			hours: number | null;
			tracks: number;
			skip_ratio: number | null;
			first_play: string | null;
			last_play: string | null;
		}>(
			`
			SELECT count(*)                   AS plays,
			       sum(ms_played) / 3600000.0 AS hours,
			       count(DISTINCT track_uri)  AS tracks,
			       avg(CASE WHEN was_skipped THEN 1.0 ELSE 0.0 END) AS skip_ratio,
			       min(ts) AS first_play, max(ts) AS last_play
			FROM listens WHERE artist_name = ?`,
			[name],
		),
	);
	if (head.plays === 0) throw new Error("not found");

	const rank = await query<{ rnk: number }>(
		`
		SELECT rnk FROM (
			SELECT artist_name, RANK() OVER (ORDER BY count(*) DESC) AS rnk
			FROM listens WHERE artist_name IS NOT NULL GROUP BY artist_name
		) WHERE artist_name = ?`,
		[name],
	);

	// Library-wide skip baseline so the artist's own rate reads in context.
	const skipAll = await query<{ s: number | null }>(
		`SELECT avg(CASE WHEN was_skipped THEN 1.0 ELSE 0.0 END) AS s FROM listens`,
	);

	// Time-of-day and day-of-week histograms for this artist.
	const artistBuckets = (expr: string) =>
		query<Bucket>(
			`SELECT ${expr} AS bucket, count(*) AS plays,
			        sum(ms_played) / 3600000.0 AS hours
			 FROM listens WHERE artist_name = ?
			 GROUP BY bucket ORDER BY bucket`,
			[name],
		);

	return {
		artist: name,
		plays: head.plays,
		hours: head.hours ?? 0,
		tracks: head.tracks,
		skip_ratio: head.skip_ratio ?? 0,
		skip_ratio_all: skipAll[0]?.s ?? 0,
		first_play: head.first_play ?? "",
		last_play: head.last_play ?? "",
		rank_plays: rank[0]?.rnk ?? 0,
		monthly: await monthly("artist_name = ?", name),
		hourly: await artistBuckets("hour(started_local)"),
		weekly: await artistBuckets("isodow(started_local)"),
		albums: await query(
			`
			SELECT COALESCE(album_name, '?') AS album, count(*) AS plays,
			       sum(ms_played) / 3600000.0 AS hours
			FROM listens WHERE artist_name = ?
			GROUP BY album_name ORDER BY sum(ms_played) DESC LIMIT 10`,
			[name],
		),
	};
}

// Every track by an artist, strongest affinity first. Each row links back to
// the track detail page on the frontend.
export async function artistTracks(name: string): Promise<TrackRow[]> {
	const rows = await query<Omit<TrackRow, "artist">>(
		`
		SELECT track_uri,
		       COALESCE(max(track_name), '?') AS name,
		       COALESCE(max(album_name), '?') AS album,
		       count(*)                       AS plays,
		       sum(ms_played) / 3600000.0     AS hours,
		       min(ts)                        AS first_play,
		       max(ts)                        AS last_play,
		       avg(CASE WHEN was_skipped THEN 1.0 ELSE 0.0 END) AS skip_ratio
		FROM listens WHERE artist_name = ?
		GROUP BY track_uri ORDER BY plays DESC`,
		[name],
	);
	return rows.map((r) => ({ ...r, artist: name }));
}

// Album detail — keyed by (artist, album) since the export carries no album id.
// Mirrors the artist detail shape: head stats, library skip baseline, monthly
// timeline and the time-of-day / day-of-week histograms.
export async function album(
	artist: string,
	name: string,
): Promise<AlbumDetail> {
	const where = "artist_name = ? AND album_name = ?";
	const key = [artist, name];

	const head = one(
		await query<{
			plays: number;
			hours: number | null;
			tracks: number;
			skip_ratio: number | null;
			first_play: string | null;
			last_play: string | null;
		}>(
			`
			SELECT count(*)                   AS plays,
			       sum(ms_played) / 3600000.0 AS hours,
			       count(DISTINCT track_uri)  AS tracks,
			       avg(CASE WHEN was_skipped THEN 1.0 ELSE 0.0 END) AS skip_ratio,
			       min(ts) AS first_play, max(ts) AS last_play
			FROM listens WHERE ${where}`,
			key,
		),
	);
	if (head.plays === 0) throw new Error("not found");

	// Rank among all albums by play count.
	const rank = await query<{ rnk: number }>(
		`
		SELECT rnk FROM (
			SELECT artist_name, album_name, RANK() OVER (ORDER BY count(*) DESC) AS rnk
			FROM listens WHERE album_name IS NOT NULL AND album_name <> ''
			GROUP BY artist_name, album_name
		) WHERE artist_name = ? AND album_name = ?`,
		key,
	);

	const skipAll = await query<{ s: number | null }>(
		`SELECT avg(CASE WHEN was_skipped THEN 1.0 ELSE 0.0 END) AS s FROM listens`,
	);

	const albumBuckets = (expr: string) =>
		query<Bucket>(
			`SELECT ${expr} AS bucket, count(*) AS plays,
			        sum(ms_played) / 3600000.0 AS hours
			 FROM listens WHERE ${where}
			 GROUP BY bucket ORDER BY bucket`,
			key,
		);

	const months = await query<MonthCount>(
		`
		SELECT strftime(date_trunc('month', started_local), '%Y-%m') AS month,
		       count(*) AS plays, sum(ms_played) / 3600000.0 AS hours
		FROM listens WHERE ${where}
		GROUP BY month ORDER BY month`,
		key,
	);

	return {
		album: name,
		artist,
		plays: head.plays,
		hours: head.hours ?? 0,
		tracks: head.tracks,
		skip_ratio: head.skip_ratio ?? 0,
		skip_ratio_all: skipAll[0]?.s ?? 0,
		first_play: head.first_play ?? "",
		last_play: head.last_play ?? "",
		rank_plays: rank[0]?.rnk ?? 0,
		monthly: months,
		hourly: await albumBuckets("hour(started_local)"),
		weekly: await albumBuckets("isodow(started_local)"),
	};
}

// Every track on an album, strongest affinity first. Links back to track detail.
export async function albumTracks(
	artist: string,
	name: string,
): Promise<TrackRow[]> {
	const rows = await query<Omit<TrackRow, "artist">>(
		`
		SELECT track_uri,
		       COALESCE(max(track_name), '?') AS name,
		       COALESCE(max(album_name), '?') AS album,
		       count(*)                       AS plays,
		       sum(ms_played) / 3600000.0     AS hours,
		       min(ts)                        AS first_play,
		       max(ts)                        AS last_play,
		       avg(CASE WHEN was_skipped THEN 1.0 ELSE 0.0 END) AS skip_ratio
		FROM listens WHERE artist_name = ? AND album_name = ?
		GROUP BY track_uri ORDER BY plays DESC`,
		[artist, name],
	);
	return rows.map((r) => ({ ...r, artist }));
}

// --- calendar.go --------------------------------------------------------------

// Per-day play/hour totals for one year, on started_local so a play lands on
// the local calendar day it began.
export async function calendar(year?: number): Promise<Calendar> {
	let y = year ?? 0;
	if (!y) {
		// Default to the most recent year with data.
		y = one(
			await query<{ y: number }>(
				"SELECT COALESCE(max(year(started_local)), 0) AS y FROM listens",
			),
		).y;
	}
	const days = await query<DayCount>(
		`
		SELECT strftime(CAST(started_local AS DATE), '%Y-%m-%d') AS date,
		       count(*) AS plays, sum(ms_played) / 3600000.0 AS hours
		FROM listens WHERE year(started_local) = ?
		GROUP BY date ORDER BY date`,
		[y],
	);
	return { year: y, days };
}

// Top track from the same week (±3 days around the anniversary) of each year
// in the history — the nostalgia widget Wrapped never gives you.
export async function onThisDay(): Promise<OnThisDay[]> {
	const now = new Date();
	const month = now.getMonth() + 1;
	const day = now.getDate();

	const rows = await query<Omit<OnThisDay, "date">>(
		`
		SELECT y AS year, track_uri, name, artist, plays, hours FROM (
			SELECT year(started_local) AS y, track_uri,
			       COALESCE(max(track_name), '?')  AS name,
			       COALESCE(max(artist_name), '?') AS artist,
			       count(*)                        AS plays,
			       sum(ms_played) / 3600000.0      AS hours,
			       ROW_NUMBER() OVER (
			           PARTITION BY year(started_local) ORDER BY count(*) DESC
			       ) AS rn
			FROM listens
			WHERE abs(date_diff('day',
			          make_date(year(started_local), CAST(? AS INTEGER), CAST(? AS INTEGER)),
			          CAST(started_local AS DATE))) <= 3
			GROUP BY y, track_uri
		) WHERE rn = 1 ORDER BY y DESC`,
		[month, day],
	);
	const mm = String(month).padStart(2, "0");
	const dd = String(day).padStart(2, "0");
	return rows.map((r) => ({
		...r,
		date: `${String(r.year).padStart(4, "0")}-${mm}-${dd}`,
	}));
}

// --- year.go -------------------------------------------------------------------

function yearTopTracks(year: number): Promise<YearTrackDelta[]> {
	return query<YearTrackDelta>(
		`
		WITH yr AS (
			SELECT track_uri, count(*) AS plays,
			       RANK() OVER (ORDER BY count(*) DESC) AS rnk,
			       COALESCE(max(track_name), '?')  AS name,
			       COALESCE(max(artist_name), '?') AS artist
			FROM listens WHERE year(ts) = ? GROUP BY track_uri
		),
		prev AS (
			SELECT track_uri, RANK() OVER (ORDER BY count(*) DESC) AS rnk
			FROM listens WHERE year(ts) = ? GROUP BY track_uri
		)
		SELECT yr.track_uri, yr.name, yr.artist, yr.plays,
		       yr.rnk AS "rank", prev.rnk AS prev_rank
		FROM yr LEFT JOIN prev USING (track_uri)
		WHERE yr.rnk <= 5 ORDER BY yr.rnk`,
		[year, year - 1],
	);
}

function yearTopArtists(year: number): Promise<YearArtistDelta[]> {
	return query<YearArtistDelta>(
		`
		WITH yr AS (
			SELECT artist_name, count(*) AS plays,
			       RANK() OVER (ORDER BY count(*) DESC) AS rnk
			FROM listens WHERE year(ts) = ? AND artist_name IS NOT NULL
			GROUP BY artist_name
		),
		prev AS (
			SELECT artist_name, RANK() OVER (ORDER BY count(*) DESC) AS rnk
			FROM listens WHERE year(ts) = ? AND artist_name IS NOT NULL
			GROUP BY artist_name
		)
		SELECT yr.artist_name AS artist, yr.plays,
		       yr.rnk AS "rank", prev.rnk AS prev_rank
		FROM yr LEFT JOIN prev USING (artist_name)
		WHERE yr.rnk <= 5 ORDER BY yr.rnk`,
		[year, year - 1],
	);
}

// The per-year "Wrapped" page: totals, top 5 tracks/artists with their rank a
// year earlier, busiest day, longest streak, biggest new-artist discovery, and
// the skip champion. Year is matched on year(ts) to stay consistent with the
// from/to windows the rest of the app uses.
export async function year(y: number): Promise<YearReview> {
	const head = one(
		await query<{
			plays: number;
			streams: number;
			hours: number | null;
			tracks: number;
			artists: number;
		}>(
			`
			SELECT count(*)                              AS plays,
			       count(*) FILTER (WHERE counts_as_stream) AS streams,
			       sum(ms_played) / 3600000.0            AS hours,
			       count(DISTINCT track_uri)             AS tracks,
			       count(DISTINCT artist_name)           AS artists
			FROM listens WHERE year(ts) = ?`,
			[y],
		),
	);
	if (head.plays === 0) throw new Error("not found");

	const busiest = await query<DayCount>(
		`
		SELECT strftime(CAST(started_local AS DATE), '%Y-%m-%d') AS date,
		       count(*) AS plays, sum(ms_played) / 3600000.0 AS hours
		FROM listens WHERE year(started_local) = ?
		GROUP BY 1 ORDER BY sum(ms_played) DESC LIMIT 1`,
		[y],
	);

	// Longest run of consecutive calendar days with a stream, via
	// gaps-and-islands (consecutive days share an island because date and row
	// number advance in lockstep).
	const streak = await query<{ days: number; from: string; to: string }>(
		`
		WITH days AS (
			SELECT DISTINCT CAST(started_local AS DATE) AS d
			FROM listens WHERE counts_as_stream AND year(started_local) = ?
		),
		grp AS (
			SELECT d, d - (ROW_NUMBER() OVER (ORDER BY d))::INT AS island FROM days
		)
		SELECT count(*) AS days,
		       strftime(min(d), '%Y-%m-%d') AS "from",
		       strftime(max(d), '%Y-%m-%d') AS "to"
		FROM grp GROUP BY island ORDER BY count(*) DESC LIMIT 1`,
		[y],
	);

	// The artist first heard this year with the most hours that year.
	// (Anything first heard in the export's opening months looks like a
	// discovery — a known caveat of a history that starts mid-life.)
	const discovery = await query<{ artist: string; hours: number }>(
		`
		WITH first_heard AS (
			SELECT artist_name, min(year(ts)) AS fy
			FROM listens WHERE artist_name IS NOT NULL GROUP BY artist_name
		)
		SELECT l.artist_name AS artist, sum(l.ms_played) / 3600000.0 AS hours
		FROM listens l JOIN first_heard f ON l.artist_name = f.artist_name
		WHERE f.fy = ? AND year(l.ts) = ?
		GROUP BY l.artist_name ORDER BY hours DESC LIMIT 1`,
		[y, y],
	);

	// The most-skipped track among those played enough to count (≥10 plays) —
	// the one you kept queueing and kept skipping.
	const skipChamp = await query<{
		track_uri: string;
		name: string;
		artist: string;
		plays: number;
		skip_ratio: number;
	}>(
		`
		SELECT track_uri,
		       COALESCE(max(track_name), '?')  AS name,
		       COALESCE(max(artist_name), '?') AS artist,
		       count(*)                        AS plays,
		       avg(CASE WHEN was_skipped THEN 1.0 ELSE 0.0 END) AS skip_ratio
		FROM listens WHERE year(ts) = ? GROUP BY track_uri
		HAVING count(*) >= 10
		ORDER BY skip_ratio DESC, count(*) DESC LIMIT 1`,
		[y],
	);

	return {
		year: y,
		plays: head.plays,
		streams: head.streams,
		hours: head.hours ?? 0,
		tracks: head.tracks,
		artists: head.artists,
		top_tracks: await yearTopTracks(y),
		top_artists: await yearTopArtists(y),
		busiest_day: busiest[0] ?? null,
		streak: streak[0] ?? null,
		discovery: discovery[0] ?? null,
		skip_champion: skipChamp[0] ?? null,
	};
}

// --- insights.ts (ideas.md §15–§25) -----------------------------------------
// Every query reads the listens view and the same started_local/counts_as_stream
// conventions as the rest of the app. All accept the shared Insights period
// filter (Window) and apply it on ts, exactly like topTracks et al. Other
// parameters are baked in at sensible defaults here so the fetchers stay thin.

// Builds the ts-window predicate once: `where` is the bare condition string
// (empty when the window is all-time) and `args` are its bind values. A query
// that scans listens more than once must include `args` once per scan, in SQL
// order.
function win(p: Period): { where: string; args: unknown[] } {
	const conds: string[] = [];
	const args: unknown[] = [];
	periodWhere(p, conds, args);
	return { where: conds.join(" AND "), args };
}

const whereOf = (where: string) => (where ? `WHERE ${where}` : "");
const andOf = (where: string) => (where ? ` AND ${where}` : "");

// §15 Seasonal fingerprint. Treat month-of-year as an angle and compute the
// circular resultant length R = |mean unit vector|: R≈1 means every play lands
// in one part of the year, R≈0 means year-round. peak_month is the resultant's
// direction mapped back to a 0-based month. Requires ≥2 distinct years so a
// single binge can't masquerade as a season.
export async function seasonal(
	p: Period,
	minPlays = 25,
	limit = 24,
): Promise<SeasonalTrack[]> {
	const { where, args } = win(p);
	return query<SeasonalTrack>(
		`
		WITH m AS (
			SELECT track_uri,
			       COALESCE(max(track_name), '?')  AS name,
			       COALESCE(max(artist_name), '?') AS artist,
			       count(*)                         AS plays,
			       count(DISTINCT year(started_local)) AS years,
			       sum(cos(2 * pi() * (month(started_local) - 1) / 12.0)) AS sc,
			       sum(sin(2 * pi() * (month(started_local) - 1) / 12.0)) AS ss
			FROM listens ${whereOf(where)}
			GROUP BY track_uri
		)
		SELECT track_uri, name, artist, plays,
		       ((CAST(round(atan2(ss, sc) / (2 * pi()) * 12) AS INTEGER) % 12) + 12) % 12
		           AS peak_month,
		       sqrt(sc * sc + ss * ss) / plays AS concentration
		FROM m
		WHERE plays >= ? AND years >= 2
		ORDER BY concentration DESC
		LIMIT ?`,
		[...args, minPlays, limit],
	);
}

// §16 Attention span. Track length isn't in the export, so the longest play of
// a track stands in for its full length; completion is each play over that,
// clamped to 1. Trended per year alongside the median play length.
export async function attention(p: Period): Promise<AttentionYear[]> {
	const { where, args } = win(p);
	return query<AttentionYear>(
		`
		WITH t AS (
			SELECT year(started_local) AS y, ms_played,
			       max(ms_played) OVER (PARTITION BY track_uri) AS maxms
			FROM listens ${whereOf(where)}
		)
		SELECT y AS year,
		       CAST(median(ms_played) AS BIGINT) AS median_ms,
		       avg(least(ms_played::DOUBLE / nullif(maxms, 0), 1.0)) AS avg_completion
		FROM t
		GROUP BY y ORDER BY y`,
		args,
	);
}

// §17 Loyal companions: tracks (or artists) heard in every single year of the
// history — the constants. Needs ≥3 years of data before "every year" means
// anything.
export async function companions(
	kind: "track" | "artist",
	p: Period,
	limit = 50,
): Promise<Companion[]> {
	const { where, args } = win(p);
	if (kind === "artist") {
		return query<Companion>(
			`
			WITH span AS (
				SELECT max(year(started_local)) - min(year(started_local)) + 1 AS ty
				FROM listens ${whereOf(where)}
			)
			SELECT artist_name AS key, artist_name AS name, '' AS artist,
			       count(*)                   AS plays,
			       sum(ms_played) / 3600000.0 AS hours,
			       count(DISTINCT year(started_local)) AS years
			FROM listens WHERE artist_name IS NOT NULL${andOf(where)}
			GROUP BY artist_name
			HAVING count(DISTINCT year(started_local)) = (SELECT ty FROM span)
			   AND (SELECT ty FROM span) >= 3
			ORDER BY hours DESC LIMIT ?`,
			[...args, ...args, limit],
		);
	}
	return query<Companion>(
		`
		WITH span AS (
			SELECT max(year(started_local)) - min(year(started_local)) + 1 AS ty
			FROM listens ${whereOf(where)}
		)
		SELECT track_uri AS key,
		       COALESCE(max(track_name), '?')  AS name,
		       COALESCE(max(artist_name), '?') AS artist,
		       count(*)                   AS plays,
		       sum(ms_played) / 3600000.0 AS hours,
		       count(DISTINCT year(started_local)) AS years
		FROM listens ${whereOf(where)}
		GROUP BY track_uri
		HAVING count(DISTINCT year(started_local)) = (SELECT ty FROM span)
		   AND (SELECT ty FROM span) >= 3
		ORDER BY hours DESC LIMIT ?`,
		[...args, ...args, limit],
	);
}

// §18 Rediscovery events: a track that went quiet for gapMonths+ and then came
// roaring back with revivalPlays+ plays in the following 30 days (a real
// revival, not a one-off nostalgic replay). The 30-day forward count uses a
// RANGE window frame on the per-track timeline.
export async function rediscoveries(
	p: Period,
	gapMonths = 6,
	revivalPlays = 5,
	limit = 30,
): Promise<Rediscovery[]> {
	const { where, args } = win(p);
	return query<Rediscovery>(
		`
		WITH g AS (
			SELECT track_uri, ts,
			       COALESCE(track_name, '?')  AS name,
			       COALESCE(artist_name, '?') AS artist,
			       date_diff('day', LAG(ts) OVER (PARTITION BY track_uri ORDER BY ts), ts)
			           AS gap_days,
			       count(*) OVER (
			           PARTITION BY track_uri ORDER BY ts
			           RANGE BETWEEN CURRENT ROW AND INTERVAL '30 days' FOLLOWING
			       ) AS plays_30d
			FROM listens ${whereOf(where)}
		)
		SELECT track_uri, name, artist,
		       strftime(ts, '%Y-%m-%d') AS date,
		       gap_days, plays_30d
		FROM g
		WHERE gap_days >= CAST(? AS INTEGER) * 30
		  AND plays_30d >= CAST(? AS INTEGER)
		ORDER BY gap_days DESC, plays_30d DESC
		LIMIT ?`,
		[...args, gapMonths, revivalPlays, limit],
	);
}

// §19 Repeat-one loop detector: back-to-back consecutive plays of the same
// track. A run starts whenever the previous play was a different track; a
// running sum of that flag is the run id, and runs of minRun+ are the loops.
export async function loops(
	p: Period,
	minRun = 3,
	limit = 30,
): Promise<Loop[]> {
	const { where, args } = win(p);
	return query<Loop>(
		`
		WITH flagged AS (
			SELECT track_uri, ts,
			       COALESCE(track_name, '?')  AS name,
			       COALESCE(artist_name, '?') AS artist,
			       CASE WHEN LAG(track_uri) OVER (ORDER BY ts) = track_uri
			            THEN 0 ELSE 1 END AS is_new
			FROM listens ${whereOf(where)}
		),
		runs AS (
			SELECT *, sum(is_new) OVER (ORDER BY ts) AS run_id FROM flagged
		)
		SELECT track_uri,
		       max(name)   AS name,
		       max(artist) AS artist,
		       count(*)    AS run_len,
		       strftime(min(ts), '%Y-%m-%d') AS date
		FROM runs
		GROUP BY track_uri, run_id
		HAVING count(*) >= CAST(? AS INTEGER)
		ORDER BY run_len DESC, date DESC
		LIMIT ?`,
		[...args, minRun, limit],
	);
}

// §20 Weekend vs weekday self. Top artists for each side, plus one divergence
// number: 1 − Jaccard overlap of the two top-50 artist sets.
export async function weekendSplit(p: Period): Promise<WeekendSplit> {
	const { where, args } = win(p);
	const top = (weekend: boolean) =>
		query<SplitArtist>(
			`
			SELECT artist_name AS artist, count(*) AS plays
			FROM listens
			WHERE artist_name IS NOT NULL AND counts_as_stream
			  AND isodow(started_local) ${weekend ? "IN (6, 7)" : "NOT IN (6, 7)"}${andOf(where)}
			GROUP BY artist_name ORDER BY plays DESC LIMIT 10`,
			args,
		);

	const [weekday, weekend, div] = await Promise.all([
		top(false),
		top(true),
		query<{ inter: number; uni: number }>(
			`
			WITH agg AS (
				SELECT artist_name AS artist,
				       count(*) FILTER (WHERE isodow(started_local) IN (6, 7))     AS we,
				       count(*) FILTER (WHERE isodow(started_local) NOT IN (6, 7)) AS wd
				FROM listens
				WHERE artist_name IS NOT NULL AND counts_as_stream${andOf(where)}
				GROUP BY artist_name
			),
			we50 AS (SELECT artist FROM agg WHERE we > 0 ORDER BY we DESC LIMIT 50),
			wd50 AS (SELECT artist FROM agg WHERE wd > 0 ORDER BY wd DESC LIMIT 50)
			SELECT
			  (SELECT count(*) FROM (SELECT * FROM we50 INTERSECT SELECT * FROM wd50)) AS inter,
			  (SELECT count(*) FROM (SELECT * FROM we50 UNION SELECT * FROM wd50))     AS uni`,
			args,
		),
	]);
	const d = div[0];
	const divergence = d && d.uni > 0 ? 1 - d.inter / d.uni : 0;
	return { weekday, weekend, divergence };
}

// §21 Chronotype drift. Circular mean of the local start hour per year (the
// circular mean handles the midnight wraparound a plain avg(hour) botches),
// plus the share of plays before 06:00.
export async function chronotype(p: Period): Promise<ChronotypeYear[]> {
	const { where, args } = win(p);
	return query<ChronotypeYear>(
		`
		SELECT year(started_local) AS year,
		       count(*) AS plays,
		       ((CAST(round(atan2(
		            sum(sin(2 * pi() * hour(started_local) / 24.0)),
		            sum(cos(2 * pi() * hour(started_local) / 24.0))
		        ) / (2 * pi()) * 24) AS INTEGER) % 24) + 24) % 24 AS mean_hour,
		       avg(CASE WHEN hour(started_local) < 6 THEN 1.0 ELSE 0.0 END) AS night_share
		FROM listens WHERE counts_as_stream${andOf(where)}
		GROUP BY year ORDER BY year`,
		args,
	);
}

// §22 Device archaeology. user_agent_decrypted is PII and never ingested, so
// this is the coarse platform-family version: when each device family first and
// last appeared and how many hours it logged.
const DEVICE_FAMILY = `CASE
	WHEN platform ILIKE '%android%' THEN 'Android'
	WHEN platform ILIKE '%ios%' OR platform ILIKE '%iphone%'
	     OR platform ILIKE '%ipad%' OR platform ILIKE '%ipod%' THEN 'iOS'
	WHEN platform ILIKE '%windows%' THEN 'Windows'
	WHEN platform ILIKE '%os x%' OR platform ILIKE '%macos%'
	     OR platform ILIKE '%osx%' THEN 'macOS'
	WHEN platform ILIKE '%linux%' THEN 'Linux'
	WHEN platform ILIKE '%cast%' OR platform ILIKE '%chromecast%' THEN 'Cast'
	WHEN platform ILIKE '%web%' THEN 'Web'
	WHEN platform ILIKE '%partner%' OR platform ILIKE '%sonos%'
	     OR platform ILIKE '%speaker%' OR platform ILIKE '%_tv%' THEN 'Speaker / TV'
	ELSE 'Other'
END`;

export async function devices(p: Period): Promise<Device[]> {
	const { where, args } = win(p);
	return query<Device>(
		`
		SELECT ${DEVICE_FAMILY} AS device,
		       strftime(min(ts), '%Y-%m-%d') AS first_seen,
		       strftime(max(ts), '%Y-%m-%d') AS last_seen,
		       sum(ms_played) / 3600000.0 AS hours,
		       count(*) AS plays
		FROM listens WHERE platform IS NOT NULL${andOf(where)}
		GROUP BY device ORDER BY hours DESC`,
		args,
	);
}

// §23 Incognito & offline listening. Both are plain boolean filters; the top
// lists surface what you hid (incognito) and what you downloaded for the road
// (offline). incognito_mode may be NULL on data imported before it was ingested.
export async function privacy(p: Period): Promise<PrivacyStats> {
	const { where, args } = win(p);
	const head = one(
		await query<Omit<PrivacyStats, "topOffline" | "topIncognito">>(
			`
			SELECT count(*) AS plays,
			       count(*) FILTER (WHERE incognito_mode) AS incognito,
			       count(*) FILTER (WHERE offline)        AS offline,
			       COALESCE(sum(ms_played) FILTER (WHERE incognito_mode), 0) / 3600000.0
			           AS incognito_hours,
			       COALESCE(sum(ms_played) FILTER (WHERE offline), 0) / 3600000.0
			           AS offline_hours
			FROM listens ${whereOf(where)}`,
			args,
		),
	);
	const topWhere = (cond: string) =>
		query<TopTrack>(
			`
			SELECT track_uri,
			       COALESCE(max(track_name), '?')  AS name,
			       COALESCE(max(artist_name), '?') AS artist,
			       count(*)                        AS plays,
			       sum(ms_played) / 3600000.0      AS hours
			FROM listens WHERE ${cond}${andOf(where)}
			GROUP BY track_uri ORDER BY count(*) DESC LIMIT 10`,
			args,
		);
	const [topOffline, topIncognito] = await Promise.all([
		topWhere("offline"),
		topWhere("incognito_mode"),
	]);
	return { ...head, topOffline, topIncognito };
}

// §24 Range index. Gini over track play-counts (0 = perfectly even, →1 =
// dominated by a few) plus the share of plays from the top 1% of tracks. Run
// once per year and once over all time. Gini uses the ordered formula
// G = 2·Σ(i·plays_i)/(n·Σplays_i) − (n+1)/n with i = ascending rank.
async function rangeFor(
	bucketExpr: string,
	where: string,
	args: unknown[],
): Promise<RangeBucket[]> {
	return query<RangeBucket>(
		`
		WITH per AS (
			SELECT ${bucketExpr} AS bucket, track_uri, count(*) AS plays
			FROM listens ${whereOf(where)} GROUP BY bucket, track_uri
		),
		ranked AS (
			SELECT bucket, plays,
			       ROW_NUMBER() OVER (PARTITION BY bucket ORDER BY plays ASC)  AS i_asc,
			       ROW_NUMBER() OVER (PARTITION BY bucket ORDER BY plays DESC) AS i_desc,
			       count(*)   OVER (PARTITION BY bucket) AS n,
			       sum(plays) OVER (PARTITION BY bucket) AS total
			FROM per
		)
		SELECT CAST(bucket AS VARCHAR) AS bucket,
		       n AS tracks,
		       (2.0 * sum(i_asc * plays) / (n * total)) - (n + 1.0) / n AS gini,
		       CAST(sum(plays) FILTER (
		           WHERE i_desc <= greatest(1, CAST(ceil(n * 0.01) AS INTEGER))
		       ) AS DOUBLE) / total AS top1pct_share
		FROM ranked
		GROUP BY bucket, n, total
		ORDER BY bucket`,
		args,
	);
}

export async function rangeIndex(p: Period): Promise<RangeIndex> {
	const { where, args } = win(p);
	const [all, years] = await Promise.all([
		rangeFor("'all'", where, args),
		rangeFor("CAST(year(started_local) AS VARCHAR)", where, args),
	]);
	return { all: all[0] ?? null, years };
}

// §25 Hiatuses: the silences. On the set of distinct active days, the gap to the
// previous active day; keep gaps of minDays+. The inverse read of the streak
// query.
export async function hiatuses(
	p: Period,
	minDays = 7,
	limit = 30,
): Promise<Hiatus[]> {
	const { where, args } = win(p);
	return query<Hiatus>(
		`
		WITH days AS (
			SELECT DISTINCT CAST(started_local AS DATE) AS d
			FROM listens WHERE counts_as_stream${andOf(where)}
		),
		gaps AS (
			SELECT LAG(d) OVER (ORDER BY d) AS prev, d,
			       date_diff('day', LAG(d) OVER (ORDER BY d), d) AS gap
			FROM days
		)
		SELECT strftime(prev, '%Y-%m-%d') AS "from",
		       strftime(d, '%Y-%m-%d')    AS "to",
		       gap AS days
		FROM gaps
		WHERE gap >= CAST(? AS INTEGER)
		ORDER BY gap DESC LIMIT ?`,
		[...args, minDays, limit],
	);
}
