import type {
	ArtistDetail,
	Bucket,
	Calendar,
	DayCount,
	LabelCount,
	Metric,
	MonthCount,
	OnThisDay,
	PlayRow,
	PlaysPage,
	Summary,
	TopArtist,
	TopTrack,
	TrackDetail,
	TrackRow,
	TracksPage,
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

// --- top.go -----------------------------------------------------------------

export async function topTracks(
	metric: Metric,
	w: Window,
	minMs: number,
	limit: number,
): Promise<TopTrack[]> {
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
