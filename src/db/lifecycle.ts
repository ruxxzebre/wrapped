import { type Unzipped, unzip } from "fflate";
import { getSetting } from "../settings";
import { setBootStatus } from "./boot";
import { getDB, query } from "./duckdb";
import { loadSnapshot, saveSnapshot } from "./opfs";
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

async function hasPlaysTable(): Promise<boolean> {
	const rows = await query<{ n: number }>(
		"SELECT count(*) AS n FROM information_schema.tables WHERE table_name = 'plays'",
	);
	return (rows[0]?.n ?? 0) > 0;
}

/**
 * Reports whether data is available, restoring the parquet snapshot from OPFS
 * into the in-memory database when one exists. Recreates the listens view
 * either way so a stale view definition can't survive a code change.
 */
export async function ensureReady(): Promise<{ ready: boolean }> {
	if (await hasPlaysTable()) {
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
	return { ready: true };
}

/**
 * Imports a Spotify export zip: extracts the audio history JSON files,
 * registers them in DuckDB's virtual FS, drops and rebuilds the plays table
 * (so importing a new archive fully overwrites prior data), then snapshots to
 * OPFS. Progress covers unzip + registration; fraction 1 means SQL ingest is
 * running (the caller shows an indeterminate state).
 */
export async function ingestZip(
	file: File,
	onProgress?: (fraction: number) => void,
): Promise<void> {
	const data = new Uint8Array(await file.arrayBuffer());
	onProgress?.(0.1);

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
	onProgress?.(0.5);

	const db = await getDB();
	const registered: string[] = [];
	for (const [name, bytes] of entries) {
		const base = basename(name);
		await db.registerFileBuffer(base, bytes);
		registered.push(base);
		onProgress?.(0.5 + 0.5 * (registered.length / entries.length));
	}
	onProgress?.(1);

	try {
		await rebuildPlays(registered, currentTz());
	} finally {
		for (const base of registered) {
			await db.dropFile(base).catch(() => {});
		}
	}
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
