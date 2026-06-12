import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

export const wrap = style({
	height: 600,
	overflow: "auto",
	borderRadius: vars.radius.lg,
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
