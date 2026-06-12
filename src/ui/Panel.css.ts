import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

export const panel = style({
	background: vars.color.panel,
	border: "none",
	borderRadius: vars.radius.lg,
	padding: vars.space.xl,
	marginBottom: vars.space.xl,
});

// Own class so the panel heading doesn't depend on the legacy global h2 rule.
export const title = style({
	fontSize: vars.font.xl,
	fontWeight: 700,
	margin: `0 0 ${vars.space.lg}`,
	color: vars.color.text,
});
