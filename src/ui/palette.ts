// Raw color values. theme.css.ts turns these into CSS custom properties;
// charts import them directly because SVG presentation attributes (fill,
// stroke) don't resolve var() references.

export const palette = {
	bg: "#121212",
	sidebarBg: "#000000",
	panel: "#181818",
	panelHover: "#282828",
	border: "rgba(255, 255, 255, 0.1)",
	hairline: "rgba(255, 255, 255, 0.08)",
	text: "#ffffff",
	muted: "#b3b3b3",
	accent: "#1db954",
	accentHover: "#1ed760",
	accentDim: "#15883e",
	danger: "#f15e6c",
	warn: "#ffa42b",
	info: "#ffffff",
} as const;

export const chartColors = {
	axis: palette.muted,
	grid: palette.hairline,
	accent: palette.accent,
	info: palette.info,
	// Categorical donut segments (platforms, start/end reasons, countries).
	series: ["#1db954", "#3b82f6", "#a855f7", "#ffa42b", "#f15e6c", "#22d3ee"],
	// Ordered good→bad ramp for the completion bands (finished…bailed…unknown).
	ramp: ["#1db954", "#a3e635", "#ffa42b", "#f15e6c", "#6b7280"],
	tooltip: {
		contentStyle: {
			background: palette.panelHover,
			border: "none",
			borderRadius: "8px",
		},
		labelStyle: { color: palette.text },
		cursor: { fill: "rgba(255, 255, 255, 0.06)" },
	},
} as const;
