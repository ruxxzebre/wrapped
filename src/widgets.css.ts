import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "./ui/theme.css";

// Faux bar chart: bars sit on a shared baseline like the real BarChart, so the
// panel keeps its height and nothing shifts when the chart mounts.
export const chartSkeleton = style({
	display: "flex",
	alignItems: "flex-end",
	gap: vars.space.md,
	paddingTop: vars.space.lg,
});

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

// Donut: ring chart with a centred total, dotted legend below.
export const donut = style({
	display: "flex",
	flexDirection: "column",
	gap: vars.space.md,
});

export const donutChart = style({
	position: "relative",
});

export const donutTotal = style({
	position: "absolute",
	inset: 0,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	fontSize: "1.4rem",
	fontWeight: 700,
	color: vars.color.text,
	fontVariantNumeric: "tabular-nums",
	pointerEvents: "none",
});

export const legend = style({
	display: "flex",
	flexWrap: "wrap",
	gap: `${vars.space.xs} ${vars.space.lg}`,
	margin: 0,
	padding: 0,
	listStyle: "none",
});

export const legendItem = style({
	display: "flex",
	alignItems: "center",
	gap: vars.space.sm,
	fontSize: "0.82rem",
	minWidth: 0,
});

export const legendDot = style({
	width: 10,
	height: 10,
	borderRadius: "50%",
	flexShrink: 0,
});

export const legendLabel = style({
	color: vars.color.muted,
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
	maxWidth: "9rem",
});

export const legendVal = style({
	color: vars.color.text,
	fontVariantNumeric: "tabular-nums",
});
