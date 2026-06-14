import { style } from "@vanilla-extract/css";
import { vars } from "../ui/theme.css";

// Horizontal sub-tab bar sitting under the page header, above the active
// Insights sub-view.
export const subnav = style({
	display: "flex",
	flexWrap: "wrap",
	gap: vars.space.xs,
	marginBottom: vars.space.lg,
	paddingBottom: vars.space.md,
	borderBottom: `1px solid ${vars.color.hairline}`,
});
