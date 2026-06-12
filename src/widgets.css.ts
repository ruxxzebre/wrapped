import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "./ui/theme.css";

// Proportion breakdown lists (platform split, start reasons, completion).
export const breakdown = style({
	display: "flex",
	flexDirection: "column",
	gap: vars.space.sm,
});

export const brow = style({
	display: "grid",
	gridTemplateColumns: "80px 1fr 56px",
	alignItems: "center",
	gap: vars.space.md,
	fontSize: "0.82rem",
});

export const blabel = style({
	color: vars.color.muted,
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
});

export const bbar = style({
	background: "rgba(255, 255, 255, 0.1)",
	borderRadius: vars.radius.sm,
	height: 14,
	overflow: "hidden",
});

globalStyle(`${bbar} > span`, {
	display: "block",
	height: "100%",
	background: vars.color.accent,
	borderRadius: vars.radius.sm,
});

export const bval = style({
	textAlign: "right",
	color: vars.color.text,
	fontVariantNumeric: "tabular-nums",
});
