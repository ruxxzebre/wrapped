import {
	createGlobalTheme,
	createVar,
	globalStyle,
} from "@vanilla-extract/css";
import { palette } from "./palette";

// Horizontal page gutter. The app shell sets its value; full-bleed sections
// (PageHeader, DetailHead) negate it with margins.
export const contentPad = createVar();

export const vars = createGlobalTheme(":root", {
	color: palette,
	space: {
		xs: "0.25rem",
		sm: "0.4rem",
		md: "0.6rem",
		lg: "0.75rem",
		xl: "1rem",
	},
	radius: {
		sm: "4px",
		md: "8px",
		lg: "12px",
		pill: "9999px",
	},
	font: {
		xs: "0.72rem",
		sm: "0.78rem",
		md: "0.8rem",
		base: "0.875rem",
		lg: "0.95rem",
		xl: "1.05rem",
		display: "1.875rem",
	},
});

// App-wide baseline, previously index.css.
globalStyle(":root", {
	fontFamily:
		"'Figtree Variable', 'Segoe UI', system-ui, -apple-system, sans-serif",
	colorScheme: "dark",
});

globalStyle("*", { boxSizing: "border-box" });

globalStyle("body", {
	margin: 0,
	background: vars.color.bg,
	color: vars.color.text,
});

// The shell (App.css.ts) owns layout; body never scrolls, the main pane does.
globalStyle("#root", {
	height: "100dvh",
});

globalStyle("kbd", {
	fontFamily: "inherit",
	fontSize: "0.7rem",
	background: "rgba(255, 255, 255, 0.06)",
	border: `1px solid ${vars.color.border}`,
	borderRadius: vars.radius.sm,
	padding: "0.05rem 0.35rem",
	color: vars.color.muted,
});

globalStyle(":focus-visible", {
	outline: `2px solid ${vars.color.text}`,
	outlineOffset: "2px",
});

globalStyle("*, *::before, *::after", {
	"@media": {
		"(prefers-reduced-motion: reduce)": {
			transitionDuration: "0.01ms",
			animationDuration: "0.01ms",
		},
	},
});

// Route transition (router defaultViewTransition). Keep the browser's symmetric
// crossfade (old fades out while new fades in) — it must stay symmetric because
// the UA composites the two snapshots with mix-blend-mode: plus-lighter, so any
// asymmetry (e.g. holding the old snapshot opaque) sums past 1.0 and "glows".
// We only shorten the default ~250ms to a quick fade; snappiness comes from
// preloading the routes, not from breaking the fade. Reduced-motion users get
// the global 0.01ms override above.
globalStyle("::view-transition-old(root), ::view-transition-new(root)", {
	animationDuration: "110ms",
	animationTimingFunction: "ease",
});
