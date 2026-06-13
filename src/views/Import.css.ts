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

// Reassurance banner: the whole import runs in-browser, nothing is uploaded.
export const privacy = style({
	display: "flex",
	alignItems: "flex-start",
	gap: vars.space.md,
	margin: 0,
	padding: `${vars.space.lg} ${vars.space.xl}`,
	textAlign: "left",
	border: `1px solid ${vars.color.accentDim}`,
	borderRadius: vars.radius.md,
	background: "rgba(29, 185, 84, 0.08)",
	color: vars.color.muted,
	fontSize: vars.font.sm,
	lineHeight: 1.5,
});

export const privacyIcon = style({
	flexShrink: 0,
	fontSize: vars.font.lg,
	lineHeight: 1.4,
});

// Inline text button that swaps the welcome card for the export walkthrough.
export const tutorialLink = style({
	margin: 0,
	padding: 0,
	border: "none",
	background: "none",
	color: vars.color.accent,
	fontSize: vars.font.sm,
	fontWeight: 600,
	cursor: "pointer",
	textDecoration: "underline",
	textUnderlineOffset: "3px",
	selectors: {
		"&:hover": { color: vars.color.text },
	},
});

export const steps = style({
	listStyle: "none",
	margin: 0,
	padding: 0,
	display: "flex",
	flexDirection: "column",
	gap: vars.space.lg,
	textAlign: "left",
});

export const step = style({
	display: "flex",
	flexDirection: "column",
	gap: vars.space.md,
	padding: vars.space.lg,
	border: `1px solid ${vars.color.border}`,
	borderRadius: vars.radius.lg,
	background: vars.color.panel,
});

export const stepImg = style({
	width: "100%",
	height: "auto",
	borderRadius: vars.radius.md,
	border: `1px solid ${vars.color.border}`,
	background: vars.color.panelHover,
});

export const stepBody = style({
	display: "flex",
	flexDirection: "column",
	gap: vars.space.xs,
});

export const stepTitle = style({
	margin: 0,
	display: "flex",
	alignItems: "center",
	gap: vars.space.sm,
	fontSize: vars.font.lg,
	fontWeight: 700,
});

export const stepNum = style({
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
	width: "1.75rem",
	height: "1.75rem",
	flexShrink: 0,
	borderRadius: vars.radius.pill,
	background: vars.color.accent,
	color: vars.color.bg,
	fontSize: vars.font.sm,
	fontWeight: 800,
});

export const stepText = style({
	margin: 0,
	color: vars.color.muted,
	fontSize: vars.font.base,
	lineHeight: 1.5,
});

export const backLink = style({
	alignSelf: "center",
	margin: 0,
	padding: `${vars.space.sm} ${vars.space.lg}`,
	border: `1px solid ${vars.color.border}`,
	borderRadius: vars.radius.pill,
	background: vars.color.panel,
	color: vars.color.text,
	fontSize: vars.font.base,
	fontWeight: 600,
	cursor: "pointer",
	transition: "border-color 150ms, background-color 150ms",
	selectors: {
		"&:hover": {
			borderColor: vars.color.accent,
			background: vars.color.panelHover,
		},
	},
});
