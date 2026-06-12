export const fmtInt = (n: number) => n.toLocaleString("en-US");

export const fmtHours = (h: number) =>
	h >= 100 ? fmtInt(Math.round(h)) : h.toFixed(1);

export const fmtDate = (iso: string) => iso.slice(0, 10);

export const fmtDateTime = (iso: string) =>
	new Date(iso).toLocaleString("en-GB", {
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

const MONTHS = [
	"",
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];

// "2021-03" → "Mar '21"
export const fmtMonth = (m: string) => {
	const [y, mo] = m.split("-");
	return `${MONTHS[Number(mo)] ?? mo} '${y.slice(2)}`;
};

// Completion bands emitted by the backend (finished/most/partial/bailed/unknown).
const COMPLETION_LABELS: Record<string, string> = {
	finished: "Finished",
	most: "Most of it",
	partial: "Partway",
	bailed: "Bailed early",
	unknown: "Unknown",
};

// Spotify reason_start codes — why playback began. Vocabulary drifts across
// client versions, so unknown codes fall through to the raw value.
const REASON_START_LABELS: Record<string, string> = {
	trackdone: "Previous track ended",
	fwdbtn: "Skipped forward into it",
	backbtn: "Skipped back to it",
	clickrow: "Picked from a list",
	playbtn: "Pressed play",
	appload: "App opened",
	remote: "Remote / cast device",
	trackerror: "After a track error",
	"?": "Unknown",
};

export const fmtCompletion = (label: string) =>
	COMPLETION_LABELS[label] ?? label;

export const fmtReasonStart = (label: string) =>
	REASON_START_LABELS[label] ?? label;
