import { useSyncExternalStore } from "react";

// A tiny observable for the cold-start phase. DuckDB-WASM boot (worker spawn +
// wasm instantiate + icu extension fetch + snapshot restore) takes seconds on a
// cold cache; the splash subscribes here so the user sees what's happening
// rather than a single static word.

let status = "Starting up…";
const listeners = new Set<() => void>();

export function setBootStatus(next: string): void {
	if (next === status) return;
	status = next;
	for (const l of listeners) l();
}

function subscribe(l: () => void): () => void {
	listeners.add(l);
	return () => {
		listeners.delete(l);
	};
}

function getSnapshot(): string {
	return status;
}

/** Current boot phase label, re-rendering the splash as phases advance. */
export function useBootStatus(): string {
	return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
