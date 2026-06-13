import { keyframes, style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

// Single source of the shimmer. The global prefers-reduced-motion rule in
// theme.css collapses the animation duration, leaving a static muted block —
// the backgroundColor fallback keeps it visible when the gradient isn't moving.
const shimmer = keyframes({
	from: { backgroundPosition: "200% 0" },
	to: { backgroundPosition: "-200% 0" },
});

export const base = style({
	display: "block",
	borderRadius: vars.radius.sm,
	backgroundColor: "rgba(255, 255, 255, 0.05)",
	backgroundImage:
		"linear-gradient(90deg, rgba(255, 255, 255, 0) 25%, rgba(255, 255, 255, 0.06) 37%, rgba(255, 255, 255, 0) 63%)",
	backgroundSize: "200% 100%",
	animation: `${shimmer} 1.4s ease-in-out infinite`,
});
