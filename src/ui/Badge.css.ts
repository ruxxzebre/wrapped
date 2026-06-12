import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "./theme.css";

const base = style({
	fontSize: vars.font.sm,
	fontVariantNumeric: "tabular-nums",
});

export const tone = styleVariants({
	up: [base, { color: vars.color.accent }],
	down: [base, { color: vars.color.danger }],
	flat: [base, { color: vars.color.muted }],
	new: [base, { color: vars.color.warn, fontWeight: 600 }],
});
