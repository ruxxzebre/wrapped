import { keyframes, style } from "@vanilla-extract/css";
import { vars } from "./ui/theme.css";

export const entity = style({
	color: vars.color.text,
	textDecoration: "none",
	cursor: "pointer",
	selectors: {
		"&:hover": { color: vars.color.accent, textDecoration: "underline" },
	},
});

export const entityMuted = style({
	color: vars.color.muted,
	selectors: { "&:hover": { color: vars.color.accent } },
});

// Pill button that deep-links out to Spotify. Carries the brand green so it
// reads as an external "open in app" action rather than in-app navigation.
export const spotifyButton = style({
	display: "inline-flex",
	alignItems: "center",
	gap: "0.45rem",
	background: "#1db954",
	color: "#fff",
	textDecoration: "none",
	fontWeight: 600,
	fontSize: vars.font.md,
	padding: "0.5rem 0.9rem",
	borderRadius: vars.radius.pill,
	whiteSpace: "nowrap",
	transition: "background-color 150ms",
	selectors: { "&:hover": { background: "#1ed760" } },
});

// Embedded Spotify web player. Compact 152px height (single-track variant) so it
// slots between the header and the stats cards without dominating the page.
export const spotifyEmbed = style({
	display: "block",
	width: "100%",
	height: "152px",
	border: "none",
	borderRadius: "12px",
	marginBottom: vars.space.xl,
});

const shimmer = keyframes({
	"0%": { backgroundPosition: "200% 0" },
	"100%": { backgroundPosition: "-200% 0" },
});

// Placeholder shown while the oembed probe is in flight. Matches the player's
// footprint (152px + bottom margin) so the page doesn't reflow when the iframe
// swaps in, and animates a subtle shimmer to read as "loading".
export const spotifyEmbedSkeleton = style({
	display: "block",
	width: "100%",
	height: "152px",
	borderRadius: "12px",
	marginBottom: vars.space.xl,
	background: `linear-gradient(90deg, ${vars.color.panel} 25%, ${vars.color.panelHover} 50%, ${vars.color.panel} 75%)`,
	backgroundSize: "200% 100%",
	animation: `${shimmer} 1.4s ease-in-out infinite`,
});
