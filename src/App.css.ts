import { keyframes, style } from "@vanilla-extract/css";
import { contentPad, vars } from "./ui/theme.css";

const mobile = "screen and (max-width: 768px)";

// Indeterminate top progress bar: a highlight sweeps left→right while a route
// loader is in flight. Shown only on cold navigations (warm ones resolve before
// the transition starts), so it reads as "working" rather than a constant chrome.
const progressSweep = keyframes({
	"0%": { backgroundPosition: "-40% 0" },
	"100%": { backgroundPosition: "140% 0" },
});

export const routeProgress = style({
	position: "absolute",
	top: 0,
	left: 0,
	right: 0,
	height: 2,
	zIndex: 1000,
	opacity: 0,
	transition: "opacity 150ms ease",
	pointerEvents: "none",
});

export const routeProgressActive = style({
	opacity: 1,
	background: `linear-gradient(90deg, transparent, ${vars.color.accent}, transparent)`,
	backgroundSize: "40% 100%",
	backgroundRepeat: "no-repeat",
	animationName: progressSweep,
	animationDuration: "0.9s",
	animationIterationCount: "infinite",
	animationTimingFunction: "ease-in-out",
});

export const shell = style({
	vars: { [contentPad]: "1.5rem" },
	display: "flex",
	height: "100dvh",
	overflow: "hidden",
	"@media": {
		[mobile]: {
			vars: { [contentPad]: "1rem" },
			flexDirection: "column",
		},
	},
});

// Slim top bar shown only on mobile, holding the drawer toggle and brand.
export const menuBar = style({
	display: "none",
	"@media": {
		[mobile]: {
			display: "flex",
			alignItems: "center",
			gap: vars.space.sm,
			flexShrink: 0,
			padding: `${vars.space.md} ${vars.space.md}`,
			background: vars.color.sidebarBg,
			borderBottom: `1px solid ${vars.color.hairline}`,
		},
	},
});

export const menuButton = style({
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
	width: "2.75rem",
	height: "2.75rem",
	border: "none",
	borderRadius: vars.radius.md,
	background: "transparent",
	color: vars.color.text,
	fontSize: "1.5rem",
	lineHeight: 1,
	cursor: "pointer",
	transition: "background-color 150ms",
	selectors: {
		"&:hover": { background: vars.color.panelHover },
	},
});

export const sidebar = style({
	width: "232px",
	flexShrink: 0,
	display: "flex",
	flexDirection: "column",
	gap: vars.space.md,
	padding: vars.space.xl,
	background: vars.color.sidebarBg,
	overflowY: "auto",
	"@media": {
		[mobile]: {
			position: "fixed",
			top: 0,
			left: 0,
			bottom: 0,
			width: "min(78vw, 300px)",
			zIndex: 100,
			transform: "translateX(-100%)",
			transition: "transform 200ms ease",
		},
	},
});

// Drawer open state — only meaningful at mobile width, where the base sidebar
// is translated off-canvas.
export const sidebarOpen = style({
	"@media": {
		[mobile]: { transform: "translateX(0)" },
	},
});

export const backdrop = style({
	display: "none",
	"@media": {
		[mobile]: {
			display: "block",
			position: "fixed",
			inset: 0,
			zIndex: 90,
			background: "rgba(0, 0, 0, 0.5)",
		},
	},
});

export const brand = style({
	color: vars.color.text,
	textDecoration: "none",
	fontSize: vars.font.xl,
	fontWeight: 800,
	letterSpacing: "-0.02em",
	whiteSpace: "nowrap",
	padding: `${vars.space.sm} ${vars.space.md}`,
	transition: "color 150ms",
	selectors: { "&:hover": { color: vars.color.accentHover } },
});

export const navList = style({
	display: "flex",
	flexDirection: "column",
	gap: vars.space.xs,
});

export const main = style({
	flex: 1,
	minWidth: 0,
	overflowY: "auto",
	background: vars.color.bg,
	containerType: "inline-size",
});

// Bare pane (Story): no inner scroll here — the view is a full-height
// scroll-snap container that scrolls itself. Hide overflow so only it moves.
export const mainBare = style({
	flex: 1,
	minWidth: 0,
	overflow: "hidden",
	background: vars.color.bg,
	containerType: "inline-size",
});

export const content = style({
	maxWidth: "1400px",
	margin: "0 auto",
	padding: `0 ${contentPad} 2rem`,
});

export const footer = style({
	maxWidth: "1400px",
	margin: "0 auto",
	padding: `1.5rem ${contentPad} 2.5rem`,
	borderTop: `1px solid ${vars.color.hairline}`,
	display: "flex",
	flexWrap: "wrap",
	gap: vars.space.md,
	justifyContent: "space-between",
	alignItems: "center",
	color: vars.color.muted,
	fontSize: vars.font.sm,
	lineHeight: 1.5,
});

export const footerAbout = style({
	maxWidth: "60ch",
});

export const footerLink = style({
	color: vars.color.muted,
	textDecoration: "none",
	fontWeight: 600,
	transition: "color 150ms",
	selectors: { "&:hover": { color: vars.color.accentHover } },
});

// --- accordion sidebar groups --------------------------------------------
export const navGroup = style({
	display: "flex",
	flexDirection: "column",
	gap: vars.space.xs,
});

// Group header row: an uppercase, muted toggle with a chevron.
export const groupHeader = style({
	display: "flex",
	alignItems: "center",
	justifyContent: "space-between",
	width: "100%",
	background: "none",
	border: "none",
	cursor: "pointer",
	fontFamily: "inherit",
	color: vars.color.muted,
	fontSize: "0.7rem",
	fontWeight: 800,
	letterSpacing: "0.08em",
	textTransform: "uppercase",
	padding: "0.5rem 0.9rem",
	transition: "color 150ms",
	selectors: { "&:hover": { color: vars.color.text } },
});

export const chevron = style({
	fontSize: "0.7rem",
});

// Leaves indent slightly under their group header.
export const groupLeaves = style({
	display: "flex",
	flexDirection: "column",
	gap: vars.space.xs,
	paddingLeft: vars.space.sm,
});
