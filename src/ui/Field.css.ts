import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

export const bar = style({
	display: "flex",
	gap: vars.space.md,
	alignItems: "end",
	flexWrap: "wrap",
	marginBottom: vars.space.xl,
});

export const field = style({
	display: "flex",
	flexDirection: "column",
	gap: vars.space.xs,
	fontSize: "0.75rem",
	color: vars.color.muted,
});

const control = {
	background: vars.color.panelHover,
	border: "none",
	color: vars.color.text,
	borderRadius: vars.radius.md,
	padding: `${vars.space.sm} ${vars.space.md}`,
	fontSize: "0.85rem",
	fontFamily: "inherit",
} as const;

export const input = style(control);
export const select = style(control);
