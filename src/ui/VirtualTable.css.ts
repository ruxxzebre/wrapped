import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

export const wrap = style({
	height: 600,
	overflow: "auto",
	borderRadius: vars.radius.lg,
	// Slim, theme-matched scrollbar instead of the chunky OS default. Firefox
	// uses the standard properties; Chromium/WebKit use the pseudo-elements. The
	// thumb is a faint overlay that brightens on hover; the track stays invisible
	// so the bar reads as part of the list rather than browser chrome.
	scrollbarWidth: "thin",
	scrollbarColor: "rgba(255, 255, 255, 0.18) transparent",
	selectors: {
		"&::-webkit-scrollbar": {
			width: "10px",
			height: "10px",
		},
		"&::-webkit-scrollbar-track": {
			background: "transparent",
		},
		"&::-webkit-scrollbar-thumb": {
			background: "rgba(255, 255, 255, 0.18)",
			borderRadius: vars.radius.pill,
			// Inset the thumb with a transparent border so it reads as a thin pill
			// floating in the gutter rather than filling the full track width.
			border: "2px solid transparent",
			backgroundClip: "padding-box",
		},
		"&::-webkit-scrollbar-thumb:hover": {
			background: "rgba(255, 255, 255, 0.32)",
			backgroundClip: "padding-box",
		},
		"&::-webkit-scrollbar-corner": {
			background: "transparent",
		},
	},
});

export const row = style({
	display: "grid",
	gap: vars.space.lg,
	alignItems: "center",
	padding: `0 ${vars.space.lg}`,
	fontSize: "0.85rem",
	transition: "background-color 150ms",
	selectors: {
		"&:hover": { background: "rgba(255, 255, 255, 0.08)" },
	},
});

globalStyle(`${row} > div`, {
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
});

export const head = style({
	position: "sticky",
	top: 0,
	// Opaque page-colored bar so rows scroll cleanly beneath it.
	background: vars.color.bg,
	borderBottom: `1px solid ${vars.color.hairline}`,
	zIndex: 1,
	color: vars.color.muted,
	fontSize: vars.font.xs,
	textTransform: "uppercase",
	letterSpacing: "0.04em",
	userSelect: "none",
	selectors: {
		// Shares the row class; keep it opaque rather than picking up row hover.
		"&:hover": { background: vars.color.bg },
	},
});

export const num = style({
	textAlign: "right",
	fontVariantNumeric: "tabular-nums",
});

export const muted = style({ color: vars.color.muted });

export const sortable = style({
	cursor: "pointer",
	selectors: { "&:hover": { color: vars.color.text } },
});
