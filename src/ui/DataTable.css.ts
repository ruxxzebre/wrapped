import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

// Horizontal-scroll fallback: on very narrow screens a dense table can still
// exceed the viewport even after tightening padding; let it scroll sideways
// instead of crushing or wrapping cells. `-webkit-overflow-scrolling` keeps
// momentum scrolling smooth on iOS.
export const scroll = style({
	overflowX: "auto",
	WebkitOverflowScrolling: "touch",
});

export const table = style({
	width: "100%",
	borderCollapse: "collapse",
	fontSize: vars.font.base,
});

globalStyle(`${table} th, ${table} td`, {
	textAlign: "left",
	padding: `0.65rem ${vars.space.md}`,
	"@media": {
		// Tighten the gutters on phones so all columns fit on one line rather
		// than the date column wrapping and leaving ragged row heights.
		"(max-width: 640px)": {
			padding: "0.55rem 0.4rem",
			fontSize: vars.font.sm,
		},
	},
});

globalStyle(`${table} th`, {
	color: vars.color.muted,
	fontWeight: 500,
	fontSize: "0.75rem",
	textTransform: "uppercase",
	letterSpacing: "0.04em",
	userSelect: "none",
	borderBottom: `1px solid ${vars.color.hairline}`,
});

globalStyle(`${table} tbody tr:hover td`, {
	background: "rgba(255, 255, 255, 0.08)",
});

// Right-aligned numeric / date cells. Keep them on a single line so values
// like "2024-12-26" don't wrap into two rows; the track name column (left
// aligned, no nowrap) absorbs the flexible width instead.
export const num = style({
	textAlign: "right",
	fontVariantNumeric: "tabular-nums",
	whiteSpace: "nowrap",
});

export const muted = style({ color: vars.color.muted });

export const sortable = style({
	cursor: "pointer",
	selectors: { "&:hover": { color: vars.color.text } },
});
