import { useSyncExternalStore } from "react";
import type { LanguageSetting } from "./i18n";

// Client-only preferences, persisted to localStorage. No backend round-trip:
// these are presentation toggles local to this browser. A tiny external store
// lets components (e.g. the Spotify embed) react live to changes made on the
// Settings page.

export type Settings = {
	/** Render the embedded Spotify web player on track pages. */
	showPlayer: boolean;
	/**
	 * IANA timezone for time-of-day / calendar bucketing (the listens view's
	 * started_local column). Defaults to the browser's timezone.
	 */
	timezone: string;
	/** UI language, or "auto" to follow the browser/system language. */
	language: LanguageSetting;
};

const DEFAULTS: Settings = {
	showPlayer: true,
	timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
	language: "auto",
};

const KEY = "wrapped:settings";

function read(): Settings {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return DEFAULTS;
		return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) };
	} catch {
		return DEFAULTS;
	}
}

let current = read();
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
	listeners.add(cb);
	return () => listeners.delete(cb);
}

export function setSetting<K extends keyof Settings>(
	key: K,
	value: Settings[K],
) {
	current = { ...current, [key]: value };
	try {
		localStorage.setItem(KEY, JSON.stringify(current));
	} catch {
		// Ignore quota/availability errors; the in-memory value still applies.
	}
	for (const cb of listeners) cb();
}

/** Non-reactive read, for code outside React (e.g. the DB layer). */
export function getSetting<K extends keyof Settings>(key: K): Settings[K] {
	return current[key];
}

export function useSetting<K extends keyof Settings>(key: K): Settings[K] {
	return useSyncExternalStore(
		subscribe,
		() => current[key],
		() => DEFAULTS[key],
	);
}
