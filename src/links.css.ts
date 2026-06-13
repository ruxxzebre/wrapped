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

// Back breadcrumb sitting at the top of a detail banner. Bare ghost link that
// speaks the same language as the in-app entity links rather than a heavy pill,
// so it reads as quiet navigation instead of a competing button. Negative inline
// padding keeps a comfortable tap target without rendering visible chrome.
export const backButton = style({
	display: "inline-flex",
	alignItems: "center",
	gap: "0.4rem",
	background: "none",
	border: "none",
	color: vars.color.muted,
	fontFamily: "inherit",
	fontSize: vars.font.sm,
	fontWeight: 600,
	letterSpacing: "0.04em",
	textTransform: "uppercase",
	cursor: "pointer",
	padding: "0.4rem 0.4rem",
	margin: "-0.4rem -0.4rem",
	transition: "color 150ms",
	selectors: {
		"&:hover": { color: vars.color.text },
	},
	"@media": {
		"(max-width: 640px)": {
			padding: "0.55rem",
			margin: "-0.55rem",
			fontSize: vars.font.md,
		},
	},
});

// Arrow nudges left on hover to reinforce the "go back" affordance.
export const backIcon = style({
	fontSize: "1.05em",
	lineHeight: 1,
	transition: "transform 150ms",
	selectors: {
		[`${backButton}:hover &`]: { transform: "translateX(-2px)" },
	},
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
