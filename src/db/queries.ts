import type {
	ArtistDetail,
	AttentionYear,
	Bucket,
	Calendar,
	ChronotypeYear,
	Companion,
	DayCount,
	Device,
	Hiatus,
	LabelCount,
	Loop,
	Metric,
	MonthCount,
	OnThisDay,
	PlayRow,
	PlaysPage,
	PrivacyStats,
	RangeBucket,
	RangeIndex,
	Rediscovery,
	SeasonalTrack,
	SplitArtist,
	Story,
	StoryFaded,
	StoryObsession,
	StoryOrigin,
	StoryPersona,
	Summary,
	TopArtist,
	TopTrack,
	TrackDetail,
	TrackRow,
	TracksPage,
	WeekendSplit,
	Window,
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
function windowWhere(w: Window, conds: string[], args: unknown[]): void {
	if (w.from) {
		conds.push("ts >= CAST(? AS TIMESTAMP)");
		args.push(w.from);
	}
	if (w.to) {
		conds.push("ts < CAST(? AS TIMESTAMP)");
		args.push(plusDay(w.to));
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

export async function story(): Promise<Story> {
	const [origin, persona, obsession, faded] = await Promise.all([
		storyOrigin(),
		storyPersona(),
		storyObsession(),
		storyFaded(),
	]);
	return { origin, persona, obsession, faded };
}

// --- top.go -----------------------------------------------------------------

export async function topTracks(
	metric: Metric,
	w: Window,
	minMs: number,
	limit: number,
): Promise<TopTrack[]> {
	console.log("get top tracks");
	const conds = ["ms_played >= ?"];
	const args: unknown[] = [minMs];
	windowWhere(w, conds, args);
	args.push(limit);
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
		ORDER BY ${METRICS[metric]} DESC
		LIMIT ?`,
		args,
	);
}

export async function topArtists(
	metric: Metric,
	w: Window,
	minMs: number,
	limit: number,
): Promise<TopArtist[]> {
	const conds = ["ms_played >= ?", "artist_name IS NOT NULL"];
	const args: unknown[] = [minMs];
	windowWhere(w, conds, args);
	args.push(limit);
	return query<TopArtist>(
		`
		SELECT artist_name                AS artist,
		       count(*)                   AS plays,
		       sum(ms_played) / 3600000.0 AS hours,
		       count(DISTINCT track_uri)  AS tracks
		FROM listens
		WHERE ${conds.join(" AND ")}
		GROUP BY artist_name
		ORDER BY ${METRICS[metric]} DESC
		LIMIT ?`,
		args,
	);
}

// --- patterns.go ------------------------------------------------------------

// Patterns bucket on started_local: playback START time converted to local tz
// (ts alone is the UTC stop time and lands long tracks in the wrong hour).
async function pattern(bucketExpr: string, w: Window): Promise<Bucket[]> {
	const conds = ["ms_played >= ?"];
	const args: unknown[] = [30000];
	windowWhere(w, conds, args);
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

export const hourly = (w: Window) => pattern("hour(started_local)", w);
export const weekly = (w: Window) => pattern("isodow(started_local)", w);

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
	w: Window,
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
	windowWhere(w, conds, args);
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

// completion bins each play by how much of the track's longest observed
// length it covered — did you finish it, bail, or barely start it?
async function completion(uri: string): Promise<LabelCount[]> {
	const bands = await query<LabelCount>(
		`
		WITH t AS (
			SELECT ms_played, max(ms_played) OVER () AS maxms
			FROM listens WHERE track_uri = ?
		)
		SELECT CASE
			WHEN maxms = 0 OR maxms IS NULL THEN 'unknown'
			WHEN ms_played >= maxms * 0.9 THEN 'finished'
			WHEN ms_played >= maxms * 0.5 THEN 'most'
			WHEN ms_played >= maxms * 0.1 THEN 'partial'
			ELSE 'bailed'
		END AS label, count(*) AS plays
		FROM t GROUP BY label`,
		[uri],
	);
	const got = new Map(bands.map((b) => [b.label, b.plays]));
	// Emit in a fixed, meaningful order so the frontend renders a stable bar.
	const out: LabelCount[] = [];
	for (const label of ["finished", "most", "partial", "bailed", "unknown"]) {
		const plays = got.get(label);
		if (plays !== undefined) out.push({ label, plays });
	}
	return out;
}

export async function track(uri: string): Promise<TrackDetail> {
	const head = one(
		await query<{
			name: string;
			artist: string;
			album: string;
			plays: number;
			hours: number | null;
			skip_ratio: number | null;
			first_play: string | null;
			last_play: string | null;
			max_ms: number | null;
		}>(
			`
			SELECT COALESCE(max(track_name), '?')  AS name,
			       COALESCE(max(artist_name), '?') AS artist,
			       COALESCE(max(album_name), '?')  AS album,
			       count(*)                        AS plays,
			       sum(ms_played) / 3600000.0      AS hours,
			       avg(CASE WHEN was_skipped THEN 1.0 ELSE 0.0 END) AS skip_ratio,
			       min(ts) AS first_play, max(ts) AS last_play,
			       max(ms_played) AS max_ms
			FROM listens WHERE track_uri = ?`,
			[uri],
		),
	);
	if (head.plays === 0) throw new Error("not found");

	// Lifetime rank among all tracks by play count.
	const rank = await query<{ rnk: number }>(
		`
		SELECT rnk FROM (
			SELECT track_uri, RANK() OVER (ORDER BY count(*) DESC) AS rnk
			FROM listens GROUP BY track_uri
		) WHERE track_uri = ?`,
		[uri],
	);

	return {
		track_uri: uri,
		name: head.name,
		artist: head.artist,
		album: head.album,
		plays: head.plays,
		hours: head.hours ?? 0,
		skip_ratio: head.skip_ratio ?? 0,
		first_play: head.first_play ?? "",
		last_play: head.last_play ?? "",
		rank_plays: rank[0]?.rnk ?? 0,
		max_ms: head.max_ms ?? 0,
		monthly: await monthly("track_uri = ?", uri),
		hourly: await query<Bucket>(
			`
			SELECT hour(started_local) AS bucket, count(*) AS plays,
			       sum(ms_played) / 3600000.0 AS hours
			FROM listens WHERE track_uri = ?
			GROUP BY 1 ORDER BY 1`,
			[uri],
		),
		platforms: await query<LabelCount>(
			`
			SELECT platform AS label, count(*) AS plays
			FROM listens WHERE track_uri = ?
			GROUP BY platform ORDER BY count(*) DESC`,
			[uri],
		),
		reason_start: await query<LabelCount>(
			`
			SELECT COALESCE(reason_start, '?') AS label, count(*) AS plays
			FROM listens WHERE track_uri = ?
			GROUP BY reason_start ORDER BY count(*) DESC`,
			[uri],
		),
		completion: await completion(uri),
	};
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

	return {
		artist: name,
		plays: head.plays,
		hours: head.hours ?? 0,
		tracks: head.tracks,
		skip_ratio: head.skip_ratio ?? 0,
		first_play: head.first_play ?? "",
		last_play: head.last_play ?? "",
		rank_plays: rank[0]?.rnk ?? 0,
		monthly: await monthly("artist_name = ?", name),
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
// conventions as the rest of the app. Parameters are baked in at sensible
// defaults here (mirroring topArtists et al.) so the fetchers stay thin.

// §15 Seasonal fingerprint. Treat month-of-year as an angle and compute the
// circular resultant length R = |mean unit vector|: R≈1 means every play lands
// in one part of the year, R≈0 means year-round. peak_month is the resultant's
// direction mapped back to a 0-based month. Requires ≥2 distinct years so a
// single binge can't masquerade as a season.
export async function seasonal(
	minPlays = 25,
	limit = 24,
): Promise<SeasonalTrack[]> {
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
			FROM listens
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
		[minPlays, limit],
	);
}

// §16 Attention span. Track length isn't in the export, so the longest play of
// a track stands in for its full length; completion is each play over that,
// clamped to 1. Trended per year alongside the median play length.
export async function attention(): Promise<AttentionYear[]> {
	return query<AttentionYear>(`
		WITH t AS (
			SELECT year(started_local) AS y, ms_played,
			       max(ms_played) OVER (PARTITION BY track_uri) AS maxms
			FROM listens
		)
		SELECT y AS year,
		       CAST(median(ms_played) AS BIGINT) AS median_ms,
		       avg(least(ms_played::DOUBLE / nullif(maxms, 0), 1.0)) AS avg_completion
		FROM t
		GROUP BY y ORDER BY y`);
}

// §17 Loyal companions: tracks (or artists) heard in every single year of the
// history — the constants. Needs ≥3 years of data before "every year" means
// anything.
export async function companions(
	kind: "track" | "artist",
	limit = 50,
): Promise<Companion[]> {
	if (kind === "artist") {
		return query<Companion>(
			`
			WITH span AS (
				SELECT max(year(started_local)) - min(year(started_local)) + 1 AS ty
				FROM listens
			)
			SELECT artist_name AS key, artist_name AS name, '' AS artist,
			       count(*)                   AS plays,
			       sum(ms_played) / 3600000.0 AS hours,
			       count(DISTINCT year(started_local)) AS years
			FROM listens WHERE artist_name IS NOT NULL
			GROUP BY artist_name
			HAVING count(DISTINCT year(started_local)) = (SELECT ty FROM span)
			   AND (SELECT ty FROM span) >= 3
			ORDER BY hours DESC LIMIT ?`,
			[limit],
		);
	}
	return query<Companion>(
		`
		WITH span AS (
			SELECT max(year(started_local)) - min(year(started_local)) + 1 AS ty
			FROM listens
		)
		SELECT track_uri AS key,
		       COALESCE(max(track_name), '?')  AS name,
		       COALESCE(max(artist_name), '?') AS artist,
		       count(*)                   AS plays,
		       sum(ms_played) / 3600000.0 AS hours,
		       count(DISTINCT year(started_local)) AS years
		FROM listens
		GROUP BY track_uri
		HAVING count(DISTINCT year(started_local)) = (SELECT ty FROM span)
		   AND (SELECT ty FROM span) >= 3
		ORDER BY hours DESC LIMIT ?`,
		[limit],
	);
}

// §18 Rediscovery events: a track that went quiet for gapMonths+ and then came
// roaring back with revivalPlays+ plays in the following 30 days (a real
// revival, not a one-off nostalgic replay). The 30-day forward count uses a
// RANGE window frame on the per-track timeline.
export async function rediscoveries(
	gapMonths = 6,
	revivalPlays = 5,
	limit = 30,
): Promise<Rediscovery[]> {
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
			FROM listens
		)
		SELECT track_uri, name, artist,
		       strftime(ts, '%Y-%m-%d') AS date,
		       gap_days, plays_30d
		FROM g
		WHERE gap_days >= CAST(? AS INTEGER) * 30
		  AND plays_30d >= CAST(? AS INTEGER)
		ORDER BY gap_days DESC, plays_30d DESC
		LIMIT ?`,
		[gapMonths, revivalPlays, limit],
	);
}

// §19 Repeat-one loop detector: back-to-back consecutive plays of the same
// track. A run starts whenever the previous play was a different track; a
// running sum of that flag is the run id, and runs of minRun+ are the loops.
export async function loops(minRun = 3, limit = 30): Promise<Loop[]> {
	return query<Loop>(
		`
		WITH flagged AS (
			SELECT track_uri, ts,
			       COALESCE(track_name, '?')  AS name,
			       COALESCE(artist_name, '?') AS artist,
			       CASE WHEN LAG(track_uri) OVER (ORDER BY ts) = track_uri
			            THEN 0 ELSE 1 END AS is_new
			FROM listens
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
		[minRun, limit],
	);
}

// §20 Weekend vs weekday self. Top artists for each side, plus one divergence
// number: 1 − Jaccard overlap of the two top-50 artist sets.
export async function weekendSplit(): Promise<WeekendSplit> {
	const top = (weekend: boolean) =>
		query<SplitArtist>(`
			SELECT artist_name AS artist, count(*) AS plays
			FROM listens
			WHERE artist_name IS NOT NULL AND counts_as_stream
			  AND isodow(started_local) ${weekend ? "IN (6, 7)" : "NOT IN (6, 7)"}
			GROUP BY artist_name ORDER BY plays DESC LIMIT 10`);

	const [weekday, weekend, div] = await Promise.all([
		top(false),
		top(true),
		query<{ inter: number; uni: number }>(`
			WITH agg AS (
				SELECT artist_name AS artist,
				       count(*) FILTER (WHERE isodow(started_local) IN (6, 7))     AS we,
				       count(*) FILTER (WHERE isodow(started_local) NOT IN (6, 7)) AS wd
				FROM listens WHERE artist_name IS NOT NULL AND counts_as_stream
				GROUP BY artist_name
			),
			we50 AS (SELECT artist FROM agg WHERE we > 0 ORDER BY we DESC LIMIT 50),
			wd50 AS (SELECT artist FROM agg WHERE wd > 0 ORDER BY wd DESC LIMIT 50)
			SELECT
			  (SELECT count(*) FROM (SELECT * FROM we50 INTERSECT SELECT * FROM wd50)) AS inter,
			  (SELECT count(*) FROM (SELECT * FROM we50 UNION SELECT * FROM wd50))     AS uni`),
	]);
	const d = div[0];
	const divergence = d && d.uni > 0 ? 1 - d.inter / d.uni : 0;
	return { weekday, weekend, divergence };
}

// §21 Chronotype drift. Circular mean of the local start hour per year (the
// circular mean handles the midnight wraparound a plain avg(hour) botches),
// plus the share of plays before 06:00.
export async function chronotype(): Promise<ChronotypeYear[]> {
	return query<ChronotypeYear>(`
		SELECT year(started_local) AS year,
		       count(*) AS plays,
		       ((CAST(round(atan2(
		            sum(sin(2 * pi() * hour(started_local) / 24.0)),
		            sum(cos(2 * pi() * hour(started_local) / 24.0))
		        ) / (2 * pi()) * 24) AS INTEGER) % 24) + 24) % 24 AS mean_hour,
		       avg(CASE WHEN hour(started_local) < 6 THEN 1.0 ELSE 0.0 END) AS night_share
		FROM listens WHERE counts_as_stream
		GROUP BY year ORDER BY year`);
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

export async function devices(): Promise<Device[]> {
	return query<Device>(`
		SELECT ${DEVICE_FAMILY} AS device,
		       strftime(min(ts), '%Y-%m-%d') AS first_seen,
		       strftime(max(ts), '%Y-%m-%d') AS last_seen,
		       sum(ms_played) / 3600000.0 AS hours,
		       count(*) AS plays
		FROM listens WHERE platform IS NOT NULL
		GROUP BY device ORDER BY hours DESC`);
}

// §23 Incognito & offline listening. Both are plain boolean filters; the top
// lists surface what you hid (incognito) and what you downloaded for the road
// (offline). incognito_mode may be NULL on data imported before it was ingested.
export async function privacy(): Promise<PrivacyStats> {
	const head = one(
		await query<Omit<PrivacyStats, "topOffline" | "topIncognito">>(`
			SELECT count(*) AS plays,
			       count(*) FILTER (WHERE incognito_mode) AS incognito,
			       count(*) FILTER (WHERE offline)        AS offline,
			       COALESCE(sum(ms_played) FILTER (WHERE incognito_mode), 0) / 3600000.0
			           AS incognito_hours,
			       COALESCE(sum(ms_played) FILTER (WHERE offline), 0) / 3600000.0
			           AS offline_hours
			FROM listens`),
	);
	const topWhere = (cond: string) =>
		query<TopTrack>(`
			SELECT track_uri,
			       COALESCE(max(track_name), '?')  AS name,
			       COALESCE(max(artist_name), '?') AS artist,
			       count(*)                        AS plays,
			       sum(ms_played) / 3600000.0      AS hours
			FROM listens WHERE ${cond}
			GROUP BY track_uri ORDER BY count(*) DESC LIMIT 10`);
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
async function rangeFor(bucketExpr: string): Promise<RangeBucket[]> {
	return query<RangeBucket>(`
		WITH per AS (
			SELECT ${bucketExpr} AS bucket, track_uri, count(*) AS plays
			FROM listens GROUP BY bucket, track_uri
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
		ORDER BY bucket`);
}

export async function rangeIndex(): Promise<RangeIndex> {
	const [all, years] = await Promise.all([
		rangeFor("'all'"),
		rangeFor("CAST(year(started_local) AS VARCHAR)"),
	]);
	return { all: all[0] ?? null, years };
}

// §25 Hiatuses: the silences. On the set of distinct active days, the gap to the
// previous active day; keep gaps of minDays+. The inverse read of the streak
// query.
export async function hiatuses(minDays = 7, limit = 30): Promise<Hiatus[]> {
	return query<Hiatus>(
		`
		WITH days AS (
			SELECT DISTINCT CAST(started_local AS DATE) AS d
			FROM listens WHERE counts_as_stream
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
		[minDays, limit],
	);
}
