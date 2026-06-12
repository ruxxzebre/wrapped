import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

export const grid2 = style({
	display: "grid",
	gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
	gap: vars.space.xl,
});

export const cardGrid = style({
	display: "grid",
	gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
	gap: vars.space.lg,
	marginBottom: vars.space.xl,
});
