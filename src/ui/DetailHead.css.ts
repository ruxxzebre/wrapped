import { style } from "@vanilla-extract/css";
import { contentPad, vars } from "./theme.css";

// Full-bleed gradient banner: negate the shell's content gutter, then
// restore it as padding so text stays aligned with page content.
export const head = style({
	width: "100cqw",
	margin: `0 calc((100cqw - 100%) / -2) ${vars.space.xl}`,
	padding: `1.75rem calc((100cqw - 100%) / 2 + ${contentPad}) 1.25rem`,
	background:
		"linear-gradient(to bottom, rgba(255, 255, 255, 0.06), transparent)",
});

// Back breadcrumb sitting at the top of the gradient banner.
export const back = style({ marginBottom: vars.space.sm });

// Title block and optional action button share a row; action hugs the right.
export const row = style({
	display: "flex",
	alignItems: "flex-start",
	justifyContent: "space-between",
	gap: vars.space.md,
	flexWrap: "wrap",
});

export const action = style({ flexShrink: 0 });

export const title = style({
	fontSize: vars.font.display,
	fontWeight: 800,
	letterSpacing: "-0.02em",
	margin: "0 0 0.25rem",
	color: vars.color.text,
});

export const sub = style({ fontSize: vars.font.lg });

// One line in a multi-line subtitle (album/artist headers stack several). Block
// so the inline Muted spans don't run together; track header keeps its single
// inline line untouched.
export const subLine = style({
	display: "block",
	marginTop: vars.space.xs,
	selectors: { "&:first-child": { marginTop: 0 } },
});
