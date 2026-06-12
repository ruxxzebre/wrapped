import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "./theme.css";

export const muted = style({ color: vars.color.muted });

export const mutedSize = styleVariants({
	sm: { fontSize: vars.font.sm },
	md: { fontSize: vars.font.md },
	base: { fontSize: vars.font.base },
});
