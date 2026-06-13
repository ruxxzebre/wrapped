import { style } from "@vanilla-extract/css";
import { vars } from "../ui/theme.css";

const mobile = "screen and (max-width: 768px)";

export const row = style({
	display: "flex",
	alignItems: "flex-start",
	gap: vars.space.md,
	cursor: "pointer",
});

// Select rows: keep the control and label side by side on desktop, but stack
// them on mobile so the long timezone/language controls don't get squeezed.
export const selectRow = style([
	row,
	{
		"@media": {
			[mobile]: {
				flexDirection: "column",
			},
		},
	},
]);

export const checkbox = style({
	width: "1.1rem",
	height: "1.1rem",
	marginTop: "0.15rem",
	accentColor: "#1db954",
	cursor: "pointer",
	flexShrink: 0,
});

export const label = style({
	display: "flex",
	flexDirection: "column",
	gap: vars.space.xs,
	fontSize: vars.font.base,
	color: vars.color.text,
});

export const dangerRow = style({
	display: "flex",
	alignItems: "flex-start",
	gap: vars.space.md,
});

export const modalActions = style({
	display: "flex",
	justifyContent: "flex-end",
	gap: vars.space.sm,
	marginTop: vars.space.md,
});
