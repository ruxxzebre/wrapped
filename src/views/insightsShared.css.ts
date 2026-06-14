import { style } from "@vanilla-extract/css";
import { vars } from "../ui/theme.css";

// Lede line under a Section title: tightens the gap to the heading and gives the
// body a little breathing room below.
export const lede = style({
	margin: 0,
	marginTop: `calc(-1 * ${vars.space.xs})`,
	marginBottom: vars.space.lg,
	maxWidth: "62ch",
	lineHeight: 1.45,
});

// Two-up grid for paired top-lists (weekday/weekend, offline/incognito). Stacks
// on narrow panes.
export const splitGrid = style({
	display: "grid",
	gridTemplateColumns: "repeat(auto-fit, minmax(15rem, 1fr))",
	gap: vars.space.xl,
});

export const subhead = style({
	margin: 0,
	marginBottom: vars.space.sm,
	fontSize: vars.font.sm,
	fontWeight: 600,
	color: vars.color.muted,
	textTransform: "uppercase",
	letterSpacing: "0.04em",
});
