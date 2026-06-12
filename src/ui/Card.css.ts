import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "./theme.css";

export const card = style({
	background: vars.color.panel,
	border: "none",
	borderRadius: vars.radius.lg,
	padding: `0.9rem ${vars.space.xl}`,
	transition: "background-color 200ms",
	selectors: {
		"&:hover": { background: vars.color.panelHover },
	},
});

export const label = style({
	color: vars.color.muted,
	fontSize: "0.75rem",
	fontWeight: 600,
	textTransform: "uppercase",
	letterSpacing: "0.05em",
});

export const value = styleVariants({
	lg: { fontSize: "1.45rem", fontWeight: 700, marginTop: "0.2rem" },
	md: { fontSize: vars.font.xl, fontWeight: 700, marginTop: "0.2rem" },
});

export const sub = style({
	color: vars.color.muted,
	fontSize: "0.75rem",
	marginTop: "0.15rem",
});
