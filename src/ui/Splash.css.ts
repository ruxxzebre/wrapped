import { keyframes, style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

const spin = keyframes({
	to: { transform: "rotate(360deg)" },
});

export const root = style({
	height: "100dvh",
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	justifyContent: "center",
	gap: vars.space.xl,
	background: vars.color.bg,
	color: vars.color.text,
	padding: vars.space.xl,
	textAlign: "center",
});

// No fade-in: the React splash must be pixel-identical to the static boot splash
// inlined in index.html so the handoff from pre-React markup is seamless. Fading
// the logo/label in from opacity 0 made them blink out and re-appear at handoff.
export const logo = style({
	width: "56px",
	height: "auto",
});

export const wordmark = style({
	fontSize: vars.font.display,
	fontWeight: 800,
	letterSpacing: "-0.02em",
	lineHeight: 1.1,
	margin: 0,
});

export const spinner = style({
	width: "22px",
	height: "22px",
	borderRadius: "50%",
	border: `2px solid ${vars.color.border}`,
	borderTopColor: vars.color.accent,
	animation: `${spin} 700ms linear infinite`,
});

export const label = style({
	color: vars.color.muted,
	fontSize: vars.font.base,
	lineHeight: 1.2,
	minHeight: "1.2em",
	margin: 0,
});

export const error = style({
	color: vars.color.danger,
	maxWidth: "48ch",
	lineHeight: 1.5,
});
