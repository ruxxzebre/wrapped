import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

export const table = style({
	width: "100%",
	borderCollapse: "collapse",
	fontSize: vars.font.base,
});

globalStyle(`${table} th, ${table} td`, {
	textAlign: "left",
	padding: `0.65rem ${vars.space.md}`,
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

export const num = style({
	textAlign: "right",
	fontVariantNumeric: "tabular-nums",
});

export const muted = style({ color: vars.color.muted });

export const sortable = style({
	cursor: "pointer",
	selectors: { "&:hover": { color: vars.color.text } },
});
