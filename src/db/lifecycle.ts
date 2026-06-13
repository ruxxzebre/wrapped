import { type Unzipped, unzip } from "fflate";
import { getSetting } from "../settings";
import { setBootStatus } from "./boot";
import { getDB, query } from "./duckdb";
import { deleteSnapshot, loadSnapshot, saveSnapshot } from "./opfs";
import { createListensView, rebuildPlays } from "./schema";

// Orchestration: zip import, OPFS snapshot restore, and the ready check that
// gates the whole app (mirrors backend/internal/store/import.go + EnsureReady).

// Matches the per-year audio history files inside a Spotify "my_spotify_data"
// export. Video and podcast files are ignored — the song discriminator in the
// ingest WHERE clause drops them anyway.
const HISTORY_RE = /^Streaming_History_Audio_.*\.json$/;

// Name of the parquet snapshot inside DuckDB's virtual FS (the OPFS copy has
// its own name; this one only exists transiently during save/restore).
const VFS_SNAPSHOT = "snapshot.parquet";

function basename(p: string): string {
	const i = p.lastIndexOf("/");
	return i === -1 ? p : p.slice(i + 1);
}

function currentTz(): string {
	return getSetting("timezone");
}

// True once the plays table is live in the in-memory DB this session (restored
// from OPFS or freshly ingested). We track it with a flag instead of querying
// information_schema so ensureReady can answer "not ready" for a first-time
// visitor WITHOUT booting DuckDB — the engine boot (worker + wasm + icu fetch)
// takes seconds, and a fresh load's in-memory DB is always empty, so the only
// thing that decides readiness is whether an OPFS snapshot exists. That check
// is a plain file-handle lookup, letting the upload screen paint immediately
// while the engine warms in the background (kicked off in main.tsx).
let playsLoaded = false;

/**
 * Reports whether data is available, restoring the parquet snapshot from OPFS
 * into the in-memory database when one exists. The snapshot existence check
 * runs before any DuckDB call so a visitor with no data never waits on the
 * engine boot just to reach the importer.
 */
export async function ensureReady(): Promise<{ ready: boolean }> {
	if (playsLoaded) {
		// Already loaded this session (e.g. the post-import status refetch).
		// Re-assert the view so a stale definition can't survive a code change.
		await createListensView(currentTz());
		return { ready: true };
	}
	const snap = await loadSnapshot();
	if (!snap) return { ready: false };

	setBootStatus("Restoring your library…");
	const db = await getDB();
	await db.registerFileBuffer(VFS_SNAPSHOT, snap);
	try {
		await query(
			`CREATE TABLE plays AS SELECT * FROM read_parquet('${VFS_SNAPSHOT}')`,
		);
	} finally {
		await db.dropFile(VFS_SNAPSHOT).catch(() => {});
	}
	await createListensView(currentTz());
	playsLoaded = true;
	return { ready: true };
}

/**
 * Imports a Spotify export zip: extracts the audio history JSON files,
 * registers them in DuckDB's virtual FS, drops and rebuilds the plays table
 * (so importing a new archive fully overwrites prior data), then snapshots to
 * OPFS. The determinate progress fraction covers reading + unzipping the file;
 * fraction 1 means everything after (waiting on the engine, registration, SQL
 * ingest) is running, for which the caller shows an indeterminate state.
 */
export async function ingestZip(
	file: File,
	onProgress?: (fraction: number) => void,
): Promise<void> {
	// Start the engine boot now so it overlaps the file read + unzip below
	// rather than stalling the progress bar afterwards. On a warm engine this
	// promise is already settled; on a cold one this is the long pole, so we
	// hand the user over to the indeterminate "importing" state before awaiting.
	const dbReady = getDB();

	const data = new Uint8Array(await file.arrayBuffer());
	onProgress?.(0.2);

	const extracted = await new Promise<Unzipped>((resolve, reject) => {
		unzip(
			data,
			{ filter: (f) => HISTORY_RE.test(basename(f.name)) },
			(err, out) => (err ? reject(err) : resolve(out)),
		);
	});
	const entries = Object.entries(extracted);
	if (entries.length === 0) {
		throw new Error(
			"archive contains no Streaming_History_Audio_*.json files; make sure it's the my_spotify_data.zip with the Spotify Extended Streaming History folder",
		);
	}
	// Reading + unzipping is done; everything left is gated on the engine and
	// SQL, which have no granular progress. Flip the caller to its indeterminate
	// "importing" state instead of freezing a determinate bar while we wait.
	onProgress?.(1);

	const db = await dbReady;
	const registered: string[] = [];
	for (const [name, bytes] of entries) {
		const base = basename(name);
		await db.registerFileBuffer(base, bytes);
		registered.push(base);
	}

	try {
		await rebuildPlays(registered, currentTz());
	} finally {
		for (const base of registered) {
			await db.dropFile(base).catch(() => {});
		}
	}
	playsLoaded = true;
	await snapshotToOPFS();
}

/** COPY the plays table to parquet and persist the buffer in OPFS. */
async function snapshotToOPFS(): Promise<void> {
	const db = await getDB();
	await query(
		`COPY (SELECT * FROM plays) TO '${VFS_SNAPSHOT}' (FORMAT PARQUET)`,
	);
	try {
		const buf = await db.copyFileToBuffer(VFS_SNAPSHOT);
		await saveSnapshot(buf);
	} finally {
		await db.dropFile(VFS_SNAPSHOT).catch(() => {});
	}
}

/**
 * Rebuilds the listens view for a new timezone (Settings change). The caller
 * must invalidate all queries afterwards — every time-of-day and calendar
 * aggregate depends on started_local.
 */
export async function recreateListensView(tz: string): Promise<void> {
	await createListensView(tz);
}

/**
 * Wipes the library: drops the listens view and plays table from the in-memory
 * database and removes the OPFS snapshot so it can't be restored on reload.
 * After this `ensureReady` reports not-ready, returning the app to the welcome
 * screen. The caller must invalidate all queries afterwards.
 */
export async function clearDatabase(): Promise<void> {
	await query("DROP VIEW IF EXISTS listens");
	await query("DROP TABLE IF EXISTS plays");
	await deleteSnapshot();
	playsLoaded = false;
}
