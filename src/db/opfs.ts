// Parquet snapshot persistence in the Origin Private File System. The runtime
// database is in-memory; after an import we snapshot the plays table to
// parquet here, and on startup reload it — no experimental opfs:// DB paths.
// Known gap: older Safari lacks createWritable (would need a sync-access-
// handle worker); accepted limitation for now.

const SNAPSHOT_NAME = "plays.parquet";

export async function saveSnapshot(buf: Uint8Array): Promise<void> {
	const dir = await navigator.storage.getDirectory();
	const handle = await dir.getFileHandle(SNAPSHOT_NAME, { create: true });
	const writable = await handle.createWritable();
	try {
		// Copy into a fresh ArrayBuffer-backed view: the stream API rejects
		// ArrayBufferLike-typed views (the buffer may come from the WASM heap).
		await writable.write(new Uint8Array(buf));
	} finally {
		await writable.close();
	}
}

export async function loadSnapshot(): Promise<Uint8Array | null> {
	try {
		const dir = await navigator.storage.getDirectory();
		const handle = await dir.getFileHandle(SNAPSHOT_NAME);
		const file = await handle.getFile();
		return new Uint8Array(await file.arrayBuffer());
	} catch (err) {
		if (err instanceof DOMException && err.name === "NotFoundError")
			return null;
		throw err;
	}
}
