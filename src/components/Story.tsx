import { useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import {
	type CSSProperties,
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { api, type StoryPersona } from "../api";
import { fmtHours, fmtInt } from "../format";
import { artistPath, Link, trackPath } from "../router";
import { palette } from "../ui";
import * as css from "./Story.css";

// The "story stack": the summary opens with a short, second-person narrative —
// origin → the weight of all those hours → who you are → an obsession → what you
// left behind. Each beat is a full-bleed scene with an abstract motif whose
// shape encodes its meaning. Beats with no data simply don't render.

const storyApi = getRouteApi("/story");

export default function Story() {
	const { data: story } = useQuery({ queryKey: ["story"], queryFn: api.story });
	// Shares the summary cache with the cards below, so this is usually a hit.
	const { data: summary } = useQuery({
		queryKey: ["summary"],
		queryFn: api.summary,
	});

	// The active scene lives in the URL (?scene=N). We restore it on mount and
	// rewrite it (replacing, not pushing) as the reader moves, so leaving for a
	// track/artist detail and pressing back returns to this exact beat.
	const { scene = 0 } = storyApi.useSearch();
	const navigate = storyApi.useNavigate();
	const onScene = useCallback(
		(i: number) =>
			navigate({ search: i > 0 ? { scene: i } : {}, replace: true }),
		[navigate],
	);
	const stackRef = useStorySnap(!!story, scene, onScene);

	// Hold the whole stack back until the narrative is ready — a half-drawn story
	// is worse than a beat of nothing. The cards below paint their own skeletons.
	if (!story) return null;

	const now = new Date().getFullYear();

	return (
		<div className={css.stack} ref={stackRef}>
			{story.origin && (
				<Scene
					eyebrow="How it began"
					glow="rgba(29,185,84,0.16)"
					motif={<Rings />}
					line={
						<>
							It started with{" "}
							<Link
								to={trackPath(story.origin.track_uri)}
								className={css.heroLink}
							>
								{story.origin.name}
							</Link>{" "}
							on a <span className={css.hero}>{story.origin.weekday}</span>,{" "}
							{story.origin.date}.
						</>
					}
					foot={
						<>
							<ArtistFoot name={story.origin.artist} /> ·{" "}
							{now - Number(story.origin.date.slice(0, 4))} years ago
						</>
					}
				/>
			)}

			{summary && summary.hours > 0 && (
				<Scene
					eyebrow="All told"
					glow="rgba(80,140,255,0.16)"
					motif={<Marks />}
					line={
						<>
							You've pressed play for{" "}
							<span className={css.hero}>
								{fmtInt(Math.round(summary.hours / 24))} days
							</span>{" "}
							straight — about {fmtInt(Math.round(summary.hours / 40))} full
							work-weeks of music.
						</>
					}
					foot={`${fmtHours(summary.hours)} hours since ${summary.first_play.slice(0, 4)}`}
				/>
			)}

			{story.persona && (
				<Scene
					eyebrow="Who you are"
					glow="rgba(180,120,255,0.16)"
					motif={<Sigil p={story.persona} />}
					line={<PersonaLine p={story.persona} />}
					foot={personaFootnote(story.persona)}
				/>
			)}

			{story.obsession && (
				<Scene
					eyebrow="Your record"
					glow="rgba(255,164,43,0.16)"
					motif={<Spiral n={story.obsession.plays} />}
					line={
						<>
							One day you played{" "}
							<Link
								to={trackPath(story.obsession.track_uri)}
								className={css.heroLink}
							>
								{story.obsession.name}
							</Link>{" "}
							<span className={css.hero}>{story.obsession.plays} times</span>.
						</>
					}
					foot={
						<>
							{story.obsession.date} ·{" "}
							<ArtistFoot name={story.obsession.artist} />
						</>
					}
				/>
			)}

			{story.faded && (
				<Scene
					eyebrow="You moved on"
					glow="rgba(241,94,108,0.14)"
					motif={<Dissolve />}
					line={
						<>
							You haven't touched{" "}
							<Link
								to={trackPath(story.faded.track_uri)}
								className={css.heroLink}
							>
								{story.faded.name}
							</Link>{" "}
							since {story.faded.last_play.slice(0, 4)}. It was your anthem in{" "}
							<span className={css.hero}>{story.faded.peak_year}</span>.
						</>
					}
					foot={
						<>
							{fmtInt(story.faded.plays)} plays that year ·{" "}
							<ArtistFoot name={story.faded.artist} />
						</>
					}
				/>
			)}
		</div>
	);
}

// Drive the snap ourselves on wheel/keys: native scroll-snap waits for the
// gesture to settle before animating (the ~half-second lag), so instead each
// wheel notch or arrow key jumps straight to the adjacent scene. Native snap
// stays in place as the touch/mobile fallback. `enabled` flips true once the
// stack is mounted, so the listeners attach to a real element.
function useStorySnap(
	enabled: boolean,
	initialScene: number,
	onScene: (i: number) => void,
) {
	const ref = useRef<HTMLDivElement>(null);
	// Live values read inside the once-per-mount effect without re-subscribing.
	const initRef = useRef(initialScene);
	initRef.current = initialScene;
	const onSceneRef = useRef(onScene);
	onSceneRef.current = onScene;
	// Binds listeners once when the stack mounts; scene values flow through refs.
	useEffect(() => {
		const el = ref.current;
		if (!enabled || !el) return;
		const reduce = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		let locked = false;
		let raf = 0;
		// Last scene index written to the URL, so we only navigate on real change.
		let written = initRef.current;
		const writeScene = (i: number) => {
			if (i === written) return;
			written = i;
			onSceneRef.current(i);
		};
		const current = () =>
			Math.round(el.scrollTop / Math.max(1, el.clientHeight));

		// Restore the beat we left on. Jump instantly — no glide on first paint.
		if (initRef.current > 0) el.scrollTop = initRef.current * el.clientHeight;
		// easeInOutCubic — slow ends, brisk middle: reads as a deliberate glide.
		const ease = (x: number) =>
			x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
		const go = (dir: -1 | 1) => {
			const count = el.childElementCount;
			if (count < 2) return;
			const next = Math.min(Math.max(current() + dir, 0), count - 1);
			const top = next * el.clientHeight;
			if (Math.abs(top - el.scrollTop) < 2) return;
			writeScene(next);
			locked = true;
			const start = el.scrollTop;
			const dist = top - start;
			if (reduce) {
				el.scrollTop = top;
				locked = false;
				return;
			}
			// Mandatory snap would teleport over a smooth scrollTo, so suspend it
			// for the tween and restore it once we land back on a snap point.
			el.style.scrollSnapType = "none";
			const dur = 480;
			const t0 = performance.now();
			const step = (now: number) => {
				const p = Math.min(1, (now - t0) / dur);
				el.scrollTop = start + dist * ease(p);
				if (p < 1) {
					raf = requestAnimationFrame(step);
				} else {
					el.style.scrollSnapType = "";
					locked = false;
				}
			};
			raf = requestAnimationFrame(step);
		};
		const onWheel = (e: WheelEvent) => {
			if (Math.abs(e.deltaY) < 2) return;
			e.preventDefault();
			if (!locked) go(e.deltaY > 0 ? 1 : -1);
		};
		const onKey = (e: KeyboardEvent) => {
			const t = e.target as HTMLElement | null;
			if (
				t?.isContentEditable ||
				(t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))
			)
				return;
			let dir: -1 | 1 | 0 = 0;
			if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ")
				dir = 1;
			else if (e.key === "ArrowUp" || e.key === "PageUp") dir = -1;
			if (!dir) return;
			e.preventDefault();
			if (!locked) go(dir);
		};
		// Catch native touch/scrollbar snapping (which bypasses `go`): once the
		// scroll settles, record whichever beat we landed on.
		let settle: number | undefined;
		const onScroll = () => {
			window.clearTimeout(settle);
			settle = window.setTimeout(() => writeScene(current()), 140);
		};
		el.addEventListener("wheel", onWheel, { passive: false });
		el.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("keydown", onKey);
		return () => {
			el.removeEventListener("wheel", onWheel);
			el.removeEventListener("scroll", onScroll);
			window.removeEventListener("keydown", onKey);
			window.clearTimeout(settle);
			cancelAnimationFrame(raf);
			el.style.scrollSnapType = "";
		};
	}, [enabled]);
	return ref;
}

// --- scene shell ------------------------------------------------------------

// Reveals its target the first time it scrolls into view, then disconnects so
// the animation plays exactly once. Reduced-motion users get the same end state
// instantly (the keyframes are zeroed globally in theme.css).
function useReveal<T extends HTMLElement>() {
	const ref = useRef<T>(null);
	const [shown, setShown] = useState(false);
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const io = new IntersectionObserver(
			(entries) => {
				if (entries.some((e) => e.isIntersecting)) {
					setShown(true);
					io.disconnect();
				}
			},
			{ threshold: 0.2 },
		);
		io.observe(el);
		return () => io.disconnect();
	}, []);
	return { ref, shown };
}

function Scene({
	eyebrow,
	glow,
	motif,
	line,
	foot,
}: {
	eyebrow: string;
	glow: string;
	motif: ReactNode;
	line: ReactNode;
	foot: ReactNode;
}) {
	const { ref, shown } = useReveal<HTMLElement>();
	return (
		<section className={css.scene} ref={ref}>
			<div className={css.glow} style={{ "--glow": glow } as CSSProperties} />
			{motif}
			<div className={`${css.content} ${shown ? css.revealed : ""}`}>
				<div className={css.eyebrow}>{eyebrow}</div>
				<p className={css.line}>{line}</p>
				<div className={css.footnote}>{foot}</div>
			</div>
		</section>
	);
}

function ArtistFoot({ name }: { name: string }) {
	if (!name || name === "?") return <span>unknown artist</span>;
	return (
		<Link to={artistPath(name)} className={css.heroLink}>
			{name}
		</Link>
	);
}

// --- persona copy -----------------------------------------------------------

function describe(p: StoryPersona) {
	const curiosity = p.oneshot_artists / Math.max(1, p.total_artists);
	const loyalty =
		p.loyal_artists >= 20
			? "fiercely loyal"
			: curiosity > 0.6
				? "endlessly curious"
				: "open-minded";
	const clock =
		p.night_ratio >= 0.35
			? "night owl"
			: p.night_ratio <= 0.12
				? "daytime listener"
				: "all-hours listener";
	const skip =
		p.skip_ratio < 0.08
			? "almost never skips"
			: p.skip_ratio < 0.2
				? "rarely skips"
				: "skips without mercy";
	return { loyalty, clock, skip };
}

function PersonaLine({ p }: { p: StoryPersona }) {
	const { loyalty, clock, skip } = describe(p);
	return (
		<>
			You're a {loyalty} <span className={css.hero}>{clock}</span> who {skip}.
		</>
	);
}

function personaFootnote(p: StoryPersona) {
	const pct = (r: number) => `${Math.round(r * 100)}%`;
	return `${pct(p.night_ratio)} after dark · ${pct(p.skip_ratio)} skip rate · ${fmtInt(p.oneshot_artists)} artists tried just once`;
}

// --- motifs (shape encodes meaning) -----------------------------------------

const VIEWBOX = "-100 -100 200 200";

// Origin: a seed with rings breathing outward — a beginning.
function Rings() {
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

function Marks() {
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
function Sigil({ p }: { p: StoryPersona }) {
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
function Spiral({ n }: { n: number }) {
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

// Faded: a cluster thinning and drifting away — letting go.
const DUST = Array.from({ length: 44 }, (_, i) => {
	const a = i * 2.39996;
	const rad = 5 * Math.sqrt(i);
	const cx = Math.cos(a) * rad;
	const cy = Math.sin(a) * rad;
	return { cx, cy, dx: cx * 0.7 + 24, dy: cy * 0.7 - 28, delay: (i % 7) * 0.4 };
});

function Dissolve() {
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
