import { useEffect, useRef, useState } from "react";

// Drive the snap ourselves on wheel/keys: native scroll-snap waits for the
// gesture to settle before animating (the ~half-second lag), so instead each
// wheel notch or arrow key jumps straight to the adjacent scene. Native snap
// stays in place as the touch/mobile fallback. `enabled` flips true once the
// stack is mounted, so the listeners attach to a real element.
export function useStorySnap(
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

// Reveals its target the first time it scrolls into view, then disconnects so
// the animation plays exactly once. Reduced-motion users get the same end state
// instantly (the keyframes are zeroed globally in theme.css).
export function useReveal<T extends HTMLElement>() {
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
