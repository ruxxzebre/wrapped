import { keyframes, style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

const spin = keyframes({
	to: { transform: "rotate(360deg)" },
});

const fadeIn = keyframes({
	from: { opacity: 0 },
	to: { opacity: 1 },
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

export const logo = style({
	width: "56px",
	height: "auto",
	animation: `${fadeIn} 300ms ease both`,
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
	animation: `${fadeIn} 300ms ease both`,
});

export const error = style({
	color: vars.color.danger,
	maxWidth: "48ch",
	lineHeight: 1.5,
});
