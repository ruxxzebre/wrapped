import { getLocale } from "./i18n";

// Number/date formatters. Locale comes from the active language (see i18n) so
// digits, grouping and month/weekday names follow the chosen UI language. These
// are plain functions read during render; a language change re-renders the
// views that use t(), which re-runs these with the new locale.

export const fmtInt = (n: number) => n.toLocaleString(getLocale());

export const fmtHours = (h: number) =>
	h >= 100 ? fmtInt(Math.round(h)) : h.toFixed(1);

export const fmtDate = (iso: string) => iso.slice(0, 10);

export const fmtDateTime = (iso: string) =>
	new Date(iso).toLocaleString(getLocale(), {
		year: "numeric",
		month: "short",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	});

export const fmtDuration = (ms: number) => {
	const s = Math.round(ms / 1000);
	return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export const fmtPct = (r: number) => `${Math.round(r * 100)}%`;

// Localized short month name for a 0-based month index. UTC anchor year keeps it
// independent of the runtime timezone.
export const monthLabel = (month0: number) =>
	new Date(Date.UTC(2024, month0, 1)).toLocaleDateString(getLocale(), {
		month: "short",
		timeZone: "UTC",
	});

// Localized short weekday name. 2024-01-01 is a Monday, so day = Mon..Sun maps
// to 1..7; pass that 1-based index (matching the backend's weekday bucket).
export const weekdayShort = (mondayBased: number) =>
	new Date(Date.UTC(2024, 0, mondayBased)).toLocaleDateString(getLocale(), {
		weekday: "short",
		timeZone: "UTC",
	});

// "2021-03" → "Mar '21"
export const fmtMonth = (m: string) => {
	const [y, mo] = m.split("-");
	return `${monthLabel(Number(mo) - 1)} '${y.slice(2)}`;
};
