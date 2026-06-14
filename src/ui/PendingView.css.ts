import { keyframes, style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

// Indeterminate sweep, mirroring App's RouteProgress so the pending fallback for
// a lazy route chunk reads identically to a normal cold navigation.
const sweep = keyframes({
	"0%": { backgroundPosition: "-40% 0" },
	"100%": { backgroundPosition: "140% 0" },
});

// Fixed to the very top of the viewport (not the content area) so it looks like
// a global loading bar during the boot-splash → view handoff, instead of a
// centered spinner sitting in an empty black content pane.
export const bar = style({
	position: "fixed",
	top: 0,
	left: 0,
	right: 0,
	height: 2,
	zIndex: 1000,
	pointerEvents: "none",
	background: `linear-gradient(90deg, transparent, ${vars.color.accent}, transparent)`,
	backgroundSize: "40% 100%",
	backgroundRepeat: "no-repeat",
	animation: `${sweep} 0.9s ease-in-out infinite`,
});
