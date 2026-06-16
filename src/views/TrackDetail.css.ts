import { style } from "@vanilla-extract/css";
import { vars } from "../ui/theme.css";

// The skip-split line is a standalone sentence between the cards grid and the
// first panel. Block it out with the same bottom rhythm the panels use so it
// doesn't sit flush against the panel below.
export const skipSplit = style({
	display: "block",
	marginBottom: vars.space.xl,
	lineHeight: 1.5,
});
