import { style } from "@vanilla-extract/css";
import { vars } from "../ui/theme.css";

export const wrap = style({
	display: "flex",
	flexDirection: "column",
	gap: vars.space.md,
});

export const headline = style({
	display: "flex",
	alignItems: "baseline",
	gap: vars.space.md,
});

export const flame = style({
	fontSize: "2rem",
	lineHeight: 1,
	// The emoji is decorative; the number + label carry the meaning.
	alignSelf: "center",
});

export const big = style({
	fontSize: "2.6rem",
	fontWeight: 800,
	lineHeight: 1,
	fontVariantNumeric: "tabular-nums",
	color: vars.color.text,
});

export const unit = style({
	fontSize: vars.font.lg,
	color: vars.color.muted,
});

export const note = style({
	fontSize: vars.font.base,
	color: vars.color.text,
});

export const record = style({
	fontSize: vars.font.base,
	fontWeight: 700,
	color: vars.color.accent,
});

export const bar = style({
	background: "rgba(255, 255, 255, 0.1)",
	borderRadius: vars.radius.pill,
	height: 8,
	overflow: "hidden",
});

export const fill = style({
	display: "block",
	height: "100%",
	background: vars.color.accent,
	borderRadius: vars.radius.pill,
});

export const meta = style({
	fontSize: vars.font.xs,
	color: vars.color.muted,
});
