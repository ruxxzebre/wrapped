import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "./theme.css";

export const row = style({ display: "flex", flexDirection: "row" });
export const stack = style({ display: "flex", flexDirection: "column" });

export const gap = styleVariants({
	xs: { gap: vars.space.xs },
	sm: { gap: vars.space.sm },
	md: { gap: vars.space.md },
	lg: { gap: vars.space.lg },
	xl: { gap: vars.space.xl },
});

export const align = styleVariants({
	start: { alignItems: "flex-start" },
	center: { alignItems: "center" },
	end: { alignItems: "flex-end" },
});

export const wrap = style({ flexWrap: "wrap" });
