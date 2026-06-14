import { keyframes, style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

// Centered green spinner shown while a lazy route chunk (and its loader)
// resolves. minHeight keeps the footer pinned down instead of riding up under
// the header while the pane is empty. Once the chunk lands, the view's own
// skeletons (or data) take over.
export const root = style({
	minHeight: "70dvh",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
});

const spin = keyframes({
	to: { transform: "rotate(360deg)" },
});

export const spinner = style({
	width: 40,
	height: 40,
	borderRadius: vars.radius.pill,
	border: "3px solid rgba(255, 255, 255, 0.12)",
	borderTopColor: vars.color.accent,
	animation: `${spin} 0.7s linear infinite`,
});
