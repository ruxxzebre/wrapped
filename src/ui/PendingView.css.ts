import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

// Generic content skeleton shown while a lazy route chunk (and its loader)
// resolves. Shaped like a typical view — a stat-card row over a tall panel of
// list rows — so the boot/nav → view handoff reads as the app filling in rather
// than a spinner in a blank pane. minHeight keeps the footer pinned down instead
// of riding up under the header. Once the chunk lands, the view's own skeletons
// (or data) take over seamlessly.
export const root = style({
	minHeight: "70dvh",
	display: "flex",
	flexDirection: "column",
});

// Mirrors ui/Grid cardGrid so the placeholder cards line up with the real row.
export const cards = style({
	display: "grid",
	gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
	gap: vars.space.lg,
	marginBottom: vars.space.xl,
});

// Mirrors ui/Card card padding/radius/background.
export const card = style({
	background: vars.color.panel,
	borderRadius: vars.radius.lg,
	padding: `0.9rem ${vars.space.xl}`,
	display: "flex",
	flexDirection: "column",
	gap: "0.5rem",
});

// Mirrors ui/Panel, grows to fill the remaining height.
export const panel = style({
	background: vars.color.panel,
	borderRadius: vars.radius.lg,
	padding: vars.space.xl,
	flex: 1,
	display: "flex",
	flexDirection: "column",
	gap: vars.space.lg,
});

export const row = style({
	display: "flex",
	alignItems: "center",
	gap: vars.space.lg,
});
