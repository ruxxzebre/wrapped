import { keyframes, style } from "@vanilla-extract/css";
import { vars } from "../ui/theme.css";

// The story stack: a sequence of full-bleed "scenes" that read top-to-bottom
// like a short letter about the listener. Quiet-editorial palette; the motifs
// (rings, marks, sigil, spiral, dissolve) carry the visual interest. All motion
// is neutralised under prefers-reduced-motion by the global rule in theme.css.

// Full-height scroll-snap container: it scrolls itself (the surrounding pane is
// overflow:hidden) and each scene snaps to fill the viewport, so a small swipe
// or scroll glides to the next beat and centers it.
export const stack = style({
	height: "100%",
	overflowY: "auto",
	overflowX: "hidden",
	scrollSnapType: "y mandatory",
	// No `scroll-behavior: smooth` here — the snap engine animates to each point
	// natively; layering smooth scrolling on top makes the snap trail the input.
	WebkitOverflowScrolling: "touch",
	// Hide the scrollbar — the snap motion is the affordance, not a track.
	scrollbarWidth: "none",
	selectors: { "&::-webkit-scrollbar": { display: "none" } },
});

export const scene = style({
	position: "relative",
	overflow: "hidden",
	boxSizing: "border-box",
	// Each scene fills the scroll pane exactly (which is itself sized to the
	// viewport minus any mobile menu bar), so snapping lands one beat per screen.
	minHeight: "100%",
	display: "grid",
	placeItems: "center",
	textAlign: "center",
	padding: "clamp(2rem, 7vh, 5rem) clamp(1.5rem, 6vw, 4rem)",
	scrollSnapAlign: "center",
	scrollSnapStop: "always",
});

// Soft radial glow seated behind each scene's text. Color is set per-scene via
// the `--glow` custom property so beats differ without extra classes.
export const glow = style({
	position: "absolute",
	inset: 0,
	background:
		"radial-gradient(60% 55% at 50% 42%, var(--glow, rgba(29,185,84,0.16)), transparent 70%)",
	pointerEvents: "none",
});

const rise = keyframes({
	from: { opacity: 0, transform: "translateY(18px)" },
	to: { opacity: 1, transform: "translateY(0)" },
});

// Content starts hidden; `revealed` (set by IntersectionObserver) plays it in.
export const content = style({
	position: "relative",
	zIndex: 1,
	maxWidth: "44rem",
	opacity: 0,
});

export const revealed = style({
	animation: `${rise} 0.7s cubic-bezier(0.22, 1, 0.36, 1) both`,
});

export const eyebrow = style({
	textTransform: "uppercase",
	letterSpacing: "0.22em",
	fontSize: vars.font.xs,
	color: vars.color.muted,
	marginBottom: vars.space.lg,
});

// The narrative sentence. Large, light display type with a touch of negative
// tracking — the editorial voice of the page.
export const line = style({
	fontSize: "clamp(1.5rem, 4.2vw, 2.6rem)",
	lineHeight: 1.18,
	fontWeight: 600,
	letterSpacing: "-0.02em",
	margin: 0,
	textWrap: "balance",
});

// The one number/name woven into each line gets the accent and a heavier weight.
export const hero = style({
	color: vars.color.accent,
	fontWeight: 700,
});

// A linked track/artist name inside a line — inherits the hero accent but stays
// a real link.
export const heroLink = style({
	color: vars.color.accent,
	fontWeight: 700,
	textDecoration: "none",
	selectors: { "&:hover": { textDecoration: "underline" } },
});

export const footnote = style({
	marginTop: vars.space.xl,
	fontSize: vars.font.base,
	color: vars.color.muted,
});

// Closing call-to-action: a pill button that leaves the story for the Summary.
export const cta = style({
	display: "inline-flex",
	alignItems: "center",
	gap: vars.space.sm,
	marginTop: vars.space.xl,
	padding: "0.7rem 1.4rem",
	borderRadius: vars.radius.pill,
	background: vars.color.accent,
	color: "#06130b",
	fontSize: vars.font.md,
	fontWeight: 700,
	textDecoration: "none",
	transition: "background-color 150ms, transform 150ms",
	selectors: {
		"&:hover": {
			background: vars.color.accentHover,
			transform: "translateY(-1px)",
		},
	},
});

// --- motif scaffolding ------------------------------------------------------

export const motif = style({
	position: "absolute",
	inset: 0,
	display: "grid",
	placeItems: "center",
	pointerEvents: "none",
	zIndex: 0,
	opacity: 0.55,
});

const svgBox = style({
	width: "min(80vw, 30rem)",
	height: "min(80vw, 30rem)",
	overflow: "visible",
});
export const svg = svgBox;

// Origin: concentric rings breathing outward from a seed.
const ripple = keyframes({
	"0%": { transform: "scale(0.6)", opacity: 0.9 },
	"70%": { opacity: 0.15 },
	"100%": { transform: "scale(1.15)", opacity: 0 },
});
export const ring = style({
	transformOrigin: "center",
	animation: `${ripple} 4.5s ease-out infinite`,
});

// Time: a faint field of accumulated marks with a slow shimmer.
const twinkle = keyframes({
	"0%, 100%": { opacity: 0.25 },
	"50%": { opacity: 0.7 },
});
export const mark = style({
	animation: `${twinkle} 5s ease-in-out infinite`,
});

// Persona: a constellation that draws itself in.
const draw = keyframes({
	from: { strokeDashoffset: 600 },
	to: { strokeDashoffset: 0 },
});
export const constellationLine = style({
	strokeDasharray: 600,
	animation: `${draw} 2.4s ease-out forwards`,
});

// Obsession: a tight spiral of repeated stamps, drawn outward.
const pop = keyframes({
	from: { opacity: 0, transform: "scale(0)" },
	to: { opacity: 1, transform: "scale(1)" },
});
export const stamp = style({
	transformBox: "fill-box",
	transformOrigin: "center",
	animation: `${pop} 0.5s ease-out both`,
});

// Faded: a cluster that thins and drifts away.
const dissolve = keyframes({
	"0%": { opacity: 0.7, transform: "translate(0, 0)" },
	"100%": { opacity: 0, transform: "translate(var(--dx), var(--dy))" },
});
export const dust = style({
	animation: `${dissolve} 6s ease-in-out infinite alternate`,
});
