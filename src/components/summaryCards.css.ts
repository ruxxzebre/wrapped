import { style } from "@vanilla-extract/css";
import { vars } from "../ui/theme.css";

// Shared styling for the gamified summary cards (pace, milestones, discovery).
// StreakCard keeps its own larger hero styling; these are the supporting beats.

export const wrap = style({
	display: "flex",
	flexDirection: "column",
	gap: vars.space.md,
});

export const headline = style({
	display: "flex",
	alignItems: "baseline",
	gap: vars.space.sm,
	flexWrap: "wrap",
});

export const big = style({
	fontSize: "2rem",
	fontWeight: 800,
	lineHeight: 1,
	fontVariantNumeric: "tabular-nums",
	color: vars.color.text,
});

export const unit = style({
	fontSize: vars.font.base,
	color: vars.color.muted,
});

export const note = style({
	fontSize: vars.font.base,
	color: vars.color.text,
	display: "flex",
	alignItems: "center",
	gap: vars.space.sm,
	flexWrap: "wrap",
});

export const meta = style({
	fontSize: vars.font.xs,
	color: vars.color.muted,
});

export const accent = style({
	color: vars.color.accent,
	fontWeight: 700,
});

// Milestone progress rows: label, track, value — mirrors the Breakdown layout.
export const rows = style({
	display: "flex",
	flexDirection: "column",
	gap: vars.space.md,
});

export const row = style({
	display: "grid",
	gridTemplateColumns: "72px 1fr auto",
	alignItems: "center",
	gap: vars.space.md,
	fontSize: vars.font.sm,
});

export const rowLabel = style({
	color: vars.color.muted,
	textTransform: "uppercase",
	letterSpacing: "0.04em",
	fontSize: vars.font.xs,
	fontWeight: 600,
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

export const rowVal = style({
	textAlign: "right",
	color: vars.color.text,
	fontVariantNumeric: "tabular-nums",
	whiteSpace: "nowrap",
});
