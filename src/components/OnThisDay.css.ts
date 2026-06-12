import { style } from "@vanilla-extract/css";
import { vars } from "../ui/theme.css";

export const list = style({
	display: "flex",
	flexDirection: "column",
});

export const row = style({
	display: "grid",
	gridTemplateColumns: "70px 1fr auto",
	alignItems: "center",
	gap: vars.space.lg,
	padding: `${vars.space.sm} 0`,
	borderBottom: `1px solid ${vars.color.border}`,
	fontSize: vars.font.base,
	selectors: { "&:last-child": { borderBottom: "none" } },
});

export const when = style({
	color: vars.color.muted,
	fontSize: vars.font.sm,
});

export const track = style({
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
});

export const plays = style({
	fontSize: vars.font.sm,
	color: vars.color.muted,
	textAlign: "right",
	fontVariantNumeric: "tabular-nums",
});
