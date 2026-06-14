import type { CSSProperties } from "react";
import type { StoryPersona } from "../api";
import { palette } from "../ui";
import * as css from "./Story.css";

// --- motifs (shape encodes meaning) -----------------------------------------

const VIEWBOX = "-100 -100 200 200";

// Origin: a seed with rings breathing outward — a beginning.
export function Rings() {
	return (
		<div className={css.motif}>
			<svg className={css.svg} viewBox={VIEWBOX} aria-hidden="true">
				<circle cx="0" cy="0" r="5" fill={palette.accent} />
				{[28, 52, 78].map((r, i) => (
					<circle
						key={r}
						cx="0"
						cy="0"
						r={r}
						fill="none"
						stroke={palette.accent}
						strokeWidth="1"
						className={css.ring}
						style={{ animationDelay: `${i * 1.5}s` }}
					/>
				))}
			</svg>
		</div>
	);
}

// Time: a quiet field of marks — the pile-up of countless hours.
const MARKS = (() => {
	const out: { cx: number; cy: number; delay: number }[] = [];
	for (let r = 0; r < 8; r++) {
		for (let c = 0; c < 12; c++) {
			const i = r * 12 + c;
			out.push({
				cx: -88 + c * 16 + (((i * 37) % 11) - 5),
				cy: -56 + r * 16 + (((i * 53) % 11) - 5),
				delay: (i % 6) * 0.7,
			});
		}
	}
	return out;
})();

export function Marks() {
	return (
		<div className={css.motif}>
			<svg className={css.svg} viewBox={VIEWBOX} aria-hidden="true">
				{MARKS.map((m) => (
					<circle
						key={`${m.cx},${m.cy}`}
						cx={m.cx}
						cy={m.cy}
						r="1.6"
						fill={palette.info}
						className={css.mark}
						style={{ animationDelay: `${m.delay}s` }}
					/>
				))}
			</svg>
		</div>
	);
}

// Persona: a constellation seeded from your own habits — an identity badge.
export function Sigil({ p }: { p: StoryPersona }) {
	const seeds = [
		p.night_ratio,
		p.skip_ratio,
		p.oneshot_artists / Math.max(1, p.total_artists),
		Math.min(1, p.loyal_artists / 40),
	];
	const pts = Array.from({ length: 6 }, (_, i) => {
		const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
		const rad = 30 + (seeds[i % seeds.length] ?? 0.5) * 55;
		return { x: Math.cos(a) * rad, y: Math.sin(a) * rad };
	});
	const d = `${pts
		.map((pt, i) => `${i ? "L" : "M"}${pt.x.toFixed(1)},${pt.y.toFixed(1)}`)
		.join(" ")} Z`;
	return (
		<div className={css.motif}>
			<svg className={css.svg} viewBox={VIEWBOX} aria-hidden="true">
				<path
					d={d}
					fill="none"
					stroke={palette.accent}
					strokeWidth="1"
					opacity="0.6"
					className={css.constellationLine}
				/>
				{pts.map((pt) => (
					<circle
						key={`${pt.x.toFixed(1)},${pt.y.toFixed(1)}`}
						cx={pt.x}
						cy={pt.y}
						r="3"
						fill={palette.accent}
					/>
				))}
			</svg>
		</div>
	);
}

// Obsession: one stamp repeated along a tight spiral — pure repetition.
export function Spiral({ n }: { n: number }) {
	const count = Math.min(Math.max(n, 8), 60);
	const dots = Array.from({ length: count }, (_, i) => {
		const a = i * 0.5;
		const rad = 4 + i * 1.35;
		return {
			cx: Math.cos(a) * rad,
			cy: Math.sin(a) * rad,
			delay: i * 0.04,
		};
	});
	return (
		<div className={css.motif}>
			<svg className={css.svg} viewBox={VIEWBOX} aria-hidden="true">
				{dots.map((dt) => (
					<circle
						key={`${dt.cx.toFixed(1)},${dt.cy.toFixed(1)}`}
						cx={dt.cx}
						cy={dt.cy}
						r="2.6"
						fill={palette.warn}
						className={css.stamp}
						style={{ animationDelay: `${dt.delay}s` }}
					/>
				))}
			</svg>
		</div>
	);
}

// Companion: an unbroken line with nodes pulsing along it — a throughline that
// runs the length of your history.
const THROUGHLINE_XS = [-80, -48, -16, 16, 48, 80];

export function Throughline() {
	return (
		<div className={css.motif}>
			<svg className={css.svg} viewBox={VIEWBOX} aria-hidden="true">
				<path
					d="M-90,0 L90,0"
					fill="none"
					stroke={palette.accent}
					strokeWidth="1"
					opacity="0.6"
					className={css.constellationLine}
				/>
				{THROUGHLINE_XS.map((x, i) => (
					<circle
						key={x}
						cx={x}
						cy="0"
						r="3"
						fill={palette.accent}
						className={css.mark}
						style={{ animationDelay: `${i * 0.4}s` }}
					/>
				))}
			</svg>
		</div>
	);
}

// Devotion: a single closed ring that draws itself shut — completion, never
// broken.
export function Seal() {
	return (
		<div className={css.motif}>
			<svg className={css.svg} viewBox={VIEWBOX} aria-hidden="true">
				<circle
					cx="0"
					cy="0"
					r="60"
					fill="none"
					stroke={palette.accent}
					strokeWidth="2"
					className={css.constellationLine}
				/>
				<circle cx="0" cy="0" r="6" fill={palette.accent} />
			</svg>
		</div>
	);
}

// Faded: a cluster thinning and drifting away — letting go.
const DUST = Array.from({ length: 44 }, (_, i) => {
	const a = i * 2.39996;
	const rad = 5 * Math.sqrt(i);
	const cx = Math.cos(a) * rad;
	const cy = Math.sin(a) * rad;
	return { cx, cy, dx: cx * 0.7 + 24, dy: cy * 0.7 - 28, delay: (i % 7) * 0.4 };
});

export function Dissolve() {
	return (
		<div className={css.motif}>
			<svg className={css.svg} viewBox={VIEWBOX} aria-hidden="true">
				{DUST.map((d) => (
					<circle
						key={`${d.cx.toFixed(1)},${d.cy.toFixed(1)}`}
						cx={d.cx}
						cy={d.cy}
						r="2"
						fill={palette.muted}
						className={css.dust}
						style={
							{
								"--dx": `${d.dx.toFixed(1)}px`,
								"--dy": `${d.dy.toFixed(1)}px`,
								animationDelay: `${d.delay}s`,
							} as CSSProperties
						}
					/>
				))}
			</svg>
		</div>
	);
}
