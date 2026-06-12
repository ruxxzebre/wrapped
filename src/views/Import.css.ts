import { keyframes, style } from "@vanilla-extract/css";
import { vars } from "../ui/theme.css";

// Full-viewport centered host used by the welcome gate (no sidebar yet).
export const welcome = style({
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	justifyContent: "center",
	gap: vars.space.xl,
	minHeight: "100dvh",
	padding: vars.space.xl,
	textAlign: "center",
});

export const card = style({
	width: "100%",
	maxWidth: "560px",
	margin: "0 auto",
	display: "flex",
	flexDirection: "column",
	gap: vars.space.lg,
	textAlign: "center",
});

export const heading = style({
	margin: 0,
	fontSize: vars.font.display,
	fontWeight: 800,
	letterSpacing: "-0.02em",
});

export const lede = style({
	margin: 0,
	color: vars.color.muted,
	fontSize: vars.font.lg,
	lineHeight: 1.5,
});

export const dropzone = style({
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	justifyContent: "center",
	gap: vars.space.md,
	padding: "2.5rem 1.5rem",
	border: `2px dashed ${vars.color.border}`,
	borderRadius: vars.radius.lg,
	background: vars.color.panel,
	color: vars.color.muted,
	cursor: "pointer",
	transition: "border-color 150ms, background-color 150ms, color 150ms",
	selectors: {
		"&:hover": { borderColor: vars.color.accent, color: vars.color.text },
	},
});

export const dropzoneActive = style({
	borderColor: vars.color.accent,
	background: vars.color.panelHover,
	color: vars.color.text,
});

export const dropzoneBusy = style({
	cursor: "progress",
	pointerEvents: "none",
	opacity: 0.85,
});

export const dropIcon = style({
	fontSize: "2rem",
	lineHeight: 1,
});

export const hint = style({
	margin: 0,
	fontSize: vars.font.sm,
	color: vars.color.muted,
});

export const track = style({
	width: "100%",
	height: "6px",
	borderRadius: vars.radius.pill,
	background: vars.color.border,
	overflow: "hidden",
});

export const bar = style({
	height: "100%",
	background: vars.color.accent,
	borderRadius: vars.radius.pill,
	transition: "width 150ms ease",
});

const pulse = keyframes({
	"0%": { opacity: 0.4 },
	"50%": { opacity: 1 },
	"100%": { opacity: 0.4 },
});

export const working = style({
	color: vars.color.text,
	fontSize: vars.font.base,
	animation: `${pulse} 1.4s ease-in-out infinite`,
});

export const errorText = style({
	margin: 0,
	color: vars.color.danger,
	fontSize: vars.font.base,
});

export const warnText = style({
	margin: 0,
	color: vars.color.warn,
	fontSize: vars.font.sm,
});
