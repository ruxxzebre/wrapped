import { query } from "./duckdb";
import { resetTrackCaches } from "./queries";

// Schema + listens view, ported verbatim from backend/internal/store/ingest.go.
//
// Schema decisions (spec §3):
//   - spotify_track_uri IS NOT NULL is the song discriminator; episodes have
//     it null, so podcasts/video vanish.
//   - union_by_name tolerates field drift across 2018→2026 files.
//   - PII (ip_addr_decrypted, user_agent_decrypted, username) never selected.
//   - offline_timestamp excluded: integer|string|null union breaks inference.

const CREATE_PLAYS = `CREATE TABLE plays (
	ts            TIMESTAMP,
	ms_played     INTEGER,
	track_uri     VARCHAR,
	track_name    VARCHAR,
	artist_name   VARCHAR,
	album_name    VARCHAR,
	reason_start  VARCHAR,
	reason_end    VARCHAR,
	shuffle       BOOLEAN,
	skipped       BOOLEAN,
	offline       BOOLEAN,
	incognito_mode BOOLEAN,
	platform      VARCHAR,
	conn_country  VARCHAR
)`;

function sqlString(s: string): string {
	return `'${s.replaceAll("'", "''")}'`;
}

/**
 * Drops and rebuilds the plays table from JSON files registered in DuckDB's
 * virtual FS, then (re)creates the listens view. Drop/recreate makes re-import
 * idempotent — a fresh export never double-counts.
 */
export async function rebuildPlays(
	fileNames: string[],
	tz: string,
): Promise<void> {
	const files = `[${fileNames.map(sqlString).join(", ")}]`;
	await query("DROP TABLE IF EXISTS plays");
	try {
		await query(CREATE_PLAYS);
		await query(`INSERT INTO plays
			SELECT
				ts::TIMESTAMP,
				ms_played::INTEGER,
				spotify_track_uri,
				master_metadata_track_name,
				master_metadata_album_artist_name,
				master_metadata_album_album_name,
				reason_start, reason_end,
				shuffle, skipped, offline, incognito_mode,
				platform, conn_country
			FROM read_json_auto(${files}, union_by_name = true)
			WHERE spotify_track_uri IS NOT NULL`);
	} catch (err) {
		await query("DROP TABLE IF EXISTS plays").catch(() => {});
		throw err;
	}
	await createListensView(tz);
}

export function isValidTimezone(tz: string): boolean {
	try {
		new Intl.DateTimeFormat("en", { timeZone: tz });
		return true;
	} catch {
		return false;
	}
}

/**
 * Builds listens, the only surface analytics may query (spec §4):
 *   - was_skipped: early years lack real skip data — the spec expected null
 *     (→ COALESCE), but this export backfills skipped=false, which a COALESCE
 *     never catches. OR-ing the forward-button reason_end covers both export
 *     variants so skip analytics don't undercount.
 *   - started_local: ts is playback STOP time in UTC; subtract ms_played and
 *     convert to local tz so time-of-day buckets land in the right hour.
 *
 * Materialized as a TABLE, not a VIEW: as a view, every scan re-ran the per-row
 * `AT TIME ZONE` ICU conversion and the was_skipped expression across the whole
 * log. Detail pages fire ~20 aggregations over listens per open, so that cost
 * was paid thousands of times per navigation. Computing the derived columns once
 * here turns each later scan into a plain columnar read. The history is
 * write-once per session, so the table never goes stale under us; it is rebuilt
 * on import, snapshot restore, and timezone change.
 */
export async function createListensView(tz: string): Promise<void> {
	if (!isValidTimezone(tz)) throw new Error(`invalid timezone ${tz}`);
	await query(`CREATE OR REPLACE TABLE listens AS
		SELECT *,
			ms_played >= 30000                       AS counts_as_stream,
			(COALESCE(skipped, false) OR reason_end = 'fwdbtn') AS was_skipped,
			(ts - to_milliseconds(ms_played))
				AT TIME ZONE 'UTC' AT TIME ZONE ${sqlString(tz)}  AS started_local
		FROM plays`);
	await finalizeListens();
}

/**
 * Post-build steps shared by a fresh `listens` materialization and a snapshot
 * restore: the point-lookup index for the per-track `WHERE track_uri = ?`
 * filters (the track-detail prefilter and its helpers lean on it), and a reset
 * of the cached library-wide constants (skip-rate baseline, lifetime rank map)
 * that were derived from the table that just got rebuilt. Parquet carries no
 * index, so a restored `listens` needs this too.
 */
export async function finalizeListens(): Promise<void> {
	await query(
		"CREATE INDEX IF NOT EXISTS idx_listens_track ON listens (track_uri)",
	);
	resetTrackCaches();
}
