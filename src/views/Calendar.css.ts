import { style } from "@vanilla-extract/css";
import { vars } from "../ui/theme.css";

export const summary = style({
	display: "flex",
	alignItems: "center",
	justifyContent: "space-between",
	gap: vars.space.xl,
	marginBottom: vars.space.lg,
	flexWrap: "wrap",
	fontSize: "0.85rem",
});

export const legend = style({
	display: "inline-flex",
	alignItems: "center",
	gap: vars.space.xs,
	color: vars.color.muted,
});

export const swatch = style({
	width: 11,
	height: 11,
	borderRadius: "2px",
	display: "inline-block",
});

export const scroll = style({ overflowX: "auto" });

export const svg = style({ display: "block" });

export const monthLabel = style({
	fill: vars.color.muted,
	fontSize: 9,
});

export const cell = style({
	stroke: "rgba(255, 255, 255, 0.04)",
});

export const cellActive = style({
	cursor: "pointer",
	selectors: { "&:hover": { stroke: vars.color.accent } },
});
