import { style } from "@vanilla-extract/css";
import { vars } from "../ui/theme.css";

export const input = style({
	width: "100%",
	boxSizing: "border-box",
	background: "transparent",
	border: "none",
	borderBottom: `1px solid ${vars.color.hairline}`,
	color: vars.color.text,
	fontSize: "1rem",
	padding: "0.8rem 1rem",
	outline: "none",
	fontFamily: "inherit",
});

export const results = style({
	listStyle: "none",
	margin: 0,
	padding: 0,
	maxHeight: "52vh",
	overflowY: "auto",
});

export const result = style({
	display: "flex",
	alignItems: "center",
	gap: "0.7rem",
	width: "100%",
	boxSizing: "border-box",
	padding: `0.5rem ${vars.space.xl}`,
	color: "inherit",
	textDecoration: "none",
	cursor: "pointer",
});

export const resultActive = style({
	background: "rgba(255, 255, 255, 0.1)",
});

export const kind = style({
	width: 44,
	fontSize: "0.65rem",
	textTransform: "uppercase",
	letterSpacing: "0.04em",
	color: vars.color.muted,
	flexShrink: 0,
});

export const label = style({
	flex: 1,
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
});

export const sub = style({
	fontSize: vars.font.sm,
	flexShrink: 0,
	maxWidth: "45%",
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
	color: vars.color.muted,
});

export const empty = style({
	padding: vars.space.xl,
	textAlign: "center",
	color: vars.color.muted,
});
