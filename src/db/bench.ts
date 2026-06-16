import { api } from "../api";
import { time } from "../perf";
import { getDB, query } from "./duckdb";
import { resetTrackCaches } from "./queries";

// Dev-only decision benchmark for the "precompute track detail / normalize"
// question. Run `await window.__bench()` in the console once data is loaded.
//
// It collects the numbers that aren't logged anywhere else:
//   1. scale      — how big is this library (rows, distinct tracks/artists/albums)
//   2. open cost  — cold first open (builds all global maps) vs warm open (maps
//                   cached, just the per-track scan). The per-map breakdown for
//                   the cold open prints separately via the existing timeSql logs.
//   3. precompute — cost + parquet size of materializing every track's panels at
//                   once (the "precompute everything up front" option), so the
//                   storage blow-up and compute time are real numbers, not guesses.
//
// Nothing here ships: the whole module is imported only behind import.meta.env.DEV
// in main.tsx, so Vite drops it from the prod bundle.

type Row = Record<string, unknown>;

async function scaleFast(): Promise<Row> {
	const [head] = await query<Row>(`
		SELECT count(*)                                  AS plays,
		       count(DISTINCT track_uri)                 AS tracks,
		       count(DISTINCT artist_name)               AS artists,
		       count(DISTINCT (artist_name, album_name)) AS albums,
		       max(year(started_local)) - min(year(started_local)) + 1 AS year_span
		FROM listens`);
	const [tail] = await query<Row>(`
		SELECT max(cnt) AS heaviest_track_plays, CAST(avg(cnt) AS DOUBLE) AS avg_plays_per_track
		FROM (SELECT count(*) AS cnt FROM listens GROUP BY track_uri)`);
	return { ...head, ...tail };
}

async function snapshotBytes(): Promise<number | null> {
	try {
		const dir = await navigator.storage.getDirectory();
		const handle = await dir.getFileHandle("listens.parquet");
		return (await handle.getFile()).size;
	} catch {
		return null;
	}
}

// Two heaviest tracks: one to open cold (worst case), one to open warm.
async function heaviestUris(): Promise<string[]> {
	const rows = await query<{ track_uri: string }>(`
		SELECT track_uri FROM listens GROUP BY track_uri
		ORDER BY count(*) DESC LIMIT 2`);
	return rows.map((r) => r.track_uri);
}

// Materialize every track's panels in one grouped pass (no track_uri filter) —
// the per-track half of "precompute everything". Times the build and the parquet
// COPY, and reports the on-disk size so the snapshot blow-up is a real number.
// (The global maps — segue/origin/loop/rank-yearly — are the OTHER half and are
// already priced by the cold-open console logs, so they're not repeated here.)
async function precomputeAllPanels(): Promise<Row> {
	const db = await getDB();
	await query("DROP TABLE IF EXISTS bench_detail");
	const build = () =>
		query(`CREATE TABLE bench_detail AS
			WITH monthly AS (
				SELECT track_uri, to_json(list(struct_pack(month := month, plays := plays, hours := hours) ORDER BY month))::VARCHAR AS monthly
				FROM (SELECT track_uri, strftime(date_trunc('month', started_local), '%Y-%m') AS month,
				             count(*) AS plays, sum(ms_played)/3600000.0 AS hours
				      FROM listens GROUP BY track_uri, month) GROUP BY track_uri
			),
			hourly AS (
				SELECT track_uri, to_json(list(struct_pack(bucket := bucket, plays := plays) ORDER BY bucket))::VARCHAR AS hourly
				FROM (SELECT track_uri, hour(started_local) AS bucket, count(*) AS plays
				      FROM listens GROUP BY track_uri, bucket) GROUP BY track_uri
			),
			weekly AS (
				SELECT track_uri, to_json(list(struct_pack(bucket := bucket, plays := plays) ORDER BY bucket))::VARCHAR AS weekly
				FROM (SELECT track_uri, isodow(started_local) AS bucket, count(*) AS plays
				      FROM listens GROUP BY track_uri, bucket) GROUP BY track_uri
			),
			head AS (
				SELECT track_uri, count(*) AS plays, sum(ms_played)/3600000.0 AS hours,
				       avg(CASE WHEN was_skipped THEN 1.0 ELSE 0.0 END) AS skip_ratio
				FROM listens GROUP BY track_uri
			)
			SELECT head.*, monthly.monthly, hourly.hourly, weekly.weekly
			FROM head
			LEFT JOIN monthly USING (track_uri)
			LEFT JOIN hourly  USING (track_uri)
			LEFT JOIN weekly  USING (track_uri)`);
	await time("bench: build all-track panels", build);

	const [{ rows }] = await query<{ rows: number }>(
		"SELECT count(*) AS rows FROM bench_detail",
	);

	let bytes: number | null = null;
	try {
		await query(
			"COPY (SELECT * FROM bench_detail) TO 'bench_detail.parquet' (FORMAT PARQUET)",
		);
		bytes = (await db.copyFileToBuffer("bench_detail.parquet")).byteLength;
		await db.dropFile("bench_detail.parquet").catch(() => {});
	} catch {}
	await query("DROP TABLE IF EXISTS bench_detail").catch(() => {});
	return { precomputed_rows: rows, parquet_bytes: bytes };
}

export async function bench(): Promise<void> {
	console.log("⏱ bench: collecting scale…");
	const size = await scaleFast();
	const snap = await snapshotBytes();
	const [coldUri, warmUri] = await heaviestUris();

	// Cold open: clear the memoized global maps so trackDetails rebuilds all of
	// them (segue/origin/loop/rank-yearly/skip/rank). Each inner query logs its
	// own time via timeSql — read those for the per-map breakdown.
	resetTrackCaches();
	console.log("⏱ bench: COLD open (watch the per-sql logs below) …");
	const t0 = performance.now();
	if (coldUri) await api.trackDetails([coldUri]);
	const coldMs = performance.now() - t0;

	// Warm open: maps now cached, so this isolates the per-track detail scan.
	console.log("⏱ bench: WARM open …");
	const t1 = performance.now();
	if (warmUri) await api.trackDetails([warmUri]);
	const warmMs = performance.now() - t1;

	console.log("⏱ bench: precompute-all panels …");
	const pre = await precomputeAllPanels();

	const summary = {
		...size,
		snapshot_parquet_bytes: snap,
		cold_open_ms: Math.round(coldMs),
		warm_open_ms: Math.round(warmMs),
		maps_cost_ms_per_session: Math.round(coldMs - warmMs),
		...pre,
	};
	console.table(summary);
	console.log(
		"maps_cost_ms_per_session ≈ what persisting the global maps would save once per session.\n" +
			"parquet_bytes ≈ how much the OPFS snapshot grows if you materialize every track's panels.",
	);
}
