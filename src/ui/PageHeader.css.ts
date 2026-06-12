import { style, styleVariants } from "@vanilla-extract/css";
import { contentPad, vars } from "./theme.css";

const base = style({
	padding: "1.75rem 0 1.25rem",
	marginBottom: vars.space.xl,
});

export const header = styleVariants({
	green: [
		base,
		{
			background:
				"linear-gradient(to bottom, rgba(29, 185, 84, 0.18), transparent)",
		},
	],
	neutral: [
		base,
		{
			background:
				"linear-gradient(to bottom, rgba(255, 255, 255, 0.06), transparent)",
		},
	],
});

export type Tint = keyof typeof header;

// Mirrors the shell's content wrapper so the title aligns with page content.
export const inner = style({
	maxWidth: "1400px",
	margin: "0 auto",
	padding: `0 ${contentPad}`,
});

export const title = style({
	fontSize: vars.font.display,
	fontWeight: 800,
	letterSpacing: "-0.02em",
	margin: 0,
	color: vars.color.text,
});
