import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

export const status = style({
	color: vars.color.muted,
	padding: "2rem",
	textAlign: "center",
});

export const error = style({ color: vars.color.danger });
