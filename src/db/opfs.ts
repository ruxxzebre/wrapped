// Parquet snapshot persistence in the Origin Private File System. The runtime
// database is in-memory; after an import we snapshot the (timezone-baked)
// listens table to parquet here, and on startup reload it — no experimental
// opfs:// DB paths.
// Known gap: older Safari lacks createWritable (would need a sync-access-
// handle worker); accepted limitation for now.

// The snapshot is the materialized `listens` table, so restore skips the
// per-row ICU `AT TIME ZONE` rebuild. The sidecar records the timezone the
// snapshot was baked with, so restore can detect a since-changed timezone and
// only then pay for a rebuild.
const SNAPSHOT_NAME = "listens.parquet";
const META_NAME = "snapshot.meta.json";

export type Snapshot = { buf: Uint8Array; tz: string | null };

async function writeFile(name: string, data: Uint8Array): Promise<void> {
	const dir = await navigator.storage.getDirectory();
	const handle = await dir.getFileHandle(name, { create: true });
	const writable = await handle.createWritable();
	try {
		// Copy into a fresh ArrayBuffer-backed view: the stream API rejects
		// ArrayBufferLike-typed views (the snapshot buffer comes from the WASM
		// heap, which may be a SharedArrayBuffer).
		const copy = new Uint8Array(data.byteLength);
		copy.set(data);
		await writable.write(copy);
	} finally {
		await writable.close();
	}
}

async function readFile(name: string): Promise<Uint8Array | null> {
	try {
		const dir = await navigator.storage.getDirectory();
		const handle = await dir.getFileHandle(name);
		const file = await handle.getFile();
		return new Uint8Array(await file.arrayBuffer());
	} catch (err) {
		if (err instanceof DOMException && err.name === "NotFoundError")
			return null;
		throw err;
	}
}

async function removeFile(name: string): Promise<void> {
	const dir = await navigator.storage.getDirectory();
	try {
		await dir.removeEntry(name);
	} catch (err) {
		if (err instanceof DOMException && err.name === "NotFoundError") return;
		throw err;
	}
}

export async function saveSnapshot(buf: Uint8Array, tz: string): Promise<void> {
	await writeFile(SNAPSHOT_NAME, buf);
	await writeFile(META_NAME, new TextEncoder().encode(JSON.stringify({ tz })));
}

export async function loadSnapshot(): Promise<Snapshot | null> {
	const buf = await readFile(SNAPSHOT_NAME);
	if (!buf) return null;
	let tz: string | null = null;
	const metaBytes = await readFile(META_NAME);
	if (metaBytes) {
		try {
			const meta = JSON.parse(new TextDecoder().decode(metaBytes)) as {
				tz?: string;
			};
			tz = meta.tz ?? null;
		} catch {
			// Corrupt sidecar: treat as unknown tz so restore rebuilds defensively.
		}
	}
	return { buf, tz };
}

/** Removes the persisted snapshot files; a no-op when none exist. */
export async function deleteSnapshot(): Promise<void> {
	await removeFile(SNAPSHOT_NAME);
	await removeFile(META_NAME);
}
