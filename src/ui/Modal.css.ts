import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

export const backdrop = style({
	position: "fixed",
	inset: 0,
	background: "rgba(0, 0, 0, 0.7)",
	display: "flex",
	justifyContent: "center",
	alignItems: "flex-start",
	paddingTop: "12vh",
	zIndex: 100,
});

export const modal = style({
	width: "min(640px, 92vw)",
	background: vars.color.panelHover,
	border: "none",
	borderRadius: vars.radius.lg,
	overflow: "hidden",
	boxShadow: "0 16px 48px rgba(0, 0, 0, 0.6)",
});
