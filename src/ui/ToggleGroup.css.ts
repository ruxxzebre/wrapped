import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

export const group = style({
	display: "inline-flex",
	gap: vars.space.xs,
	flexWrap: "wrap",
});

export const option = style({
	background: vars.color.panelHover,
	border: "none",
	color: vars.color.text,
	padding: `${vars.space.sm} 0.9rem`,
	borderRadius: vars.radius.pill,
	cursor: "pointer",
	fontSize: "0.85rem",
	fontWeight: 600,
	fontFamily: "inherit",
	transition: "background-color 150ms",
	selectors: {
		"&:hover": { background: "rgba(255, 255, 255, 0.18)" },
	},
});

// Spotify-style selected chip: white fill, dark text.
export const active = style({
	background: vars.color.text,
	color: vars.color.bg,
	selectors: {
		"&:hover": { background: vars.color.text },
	},
});
