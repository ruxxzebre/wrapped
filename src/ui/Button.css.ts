import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "./theme.css";

const base = style({
	cursor: "pointer",
	fontFamily: "inherit",
});

export const variant = styleVariants({
	// Sidebar navigation item. Reads as a row in the vertical list, and as a
	// pill chip in the collapsed mobile top bar.
	nav: [
		base,
		{
			background: "none",
			border: "none",
			color: vars.color.muted,
			textAlign: "left",
			width: "100%",
			padding: "0.5rem 0.9rem",
			borderRadius: vars.radius.pill,
			fontSize: "0.9rem",
			fontWeight: 700,
			whiteSpace: "nowrap",
			transition: "color 150ms, background-color 150ms",
			selectors: { "&:hover": { color: vars.color.text } },
		},
	],
	// Pill chrome button (e.g. the search / palette trigger).
	chrome: [
		base,
		{
			background: vars.color.panelHover,
			border: "none",
			color: vars.color.text,
			borderRadius: vars.radius.pill,
			padding: "0.5rem 0.9rem",
			fontSize: vars.font.md,
			fontWeight: 600,
			display: "inline-flex",
			alignItems: "center",
			gap: "0.45rem",
			transition: "background-color 150ms",
			selectors: {
				"&:hover": { background: "rgba(255, 255, 255, 0.14)" },
			},
		},
	],
	// Bare textual button (e.g. "← back").
	link: [
		base,
		{
			background: "none",
			border: "none",
			color: vars.color.muted,
			fontSize: vars.font.base,
			padding: 0,
			transition: "color 150ms",
			selectors: {
				"&:hover": { color: vars.color.text, textDecoration: "underline" },
			},
		},
	],
});

export const navActive = style({
	color: vars.color.text,
	background: vars.color.panelHover,
	selectors: { "&:hover": { color: vars.color.text } },
});
