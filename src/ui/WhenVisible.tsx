import { type ReactNode, useEffect, useRef, useState } from "react";

// Defer a heavy subtree (a Recharts chart) until it scrolls near the viewport.
// On a warm/prewarmed navigation the router commits the whole detail page in one
// synchronous task, so mounting 3–5 charts — each ResponsiveContainer forcing a
// layout measure — lands inside the click/popstate handler and trips
// "handler took Nms". Wrapping each chart here renders the cheap `fallback`
// (its existing ChartSkeleton) in that commit and mounts the real chart a frame
// later, off the handler; below-the-fold charts never mount until reached.
//
// rootMargin pre-mounts a little before the chart enters view so the swap is
// already done by the time it's on screen. Once revealed it stays mounted (the
// observer disconnects) — no churn on scroll-away. Falls back to mounting
// immediately where IntersectionObserver is unavailable.
export function WhenVisible({
	children,
	fallback,
	rootMargin = "200px",
}: {
	children: ReactNode;
	fallback?: ReactNode;
	rootMargin?: string;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (visible) return;
		const el = ref.current;
		if (!el || !("IntersectionObserver" in window)) {
			setVisible(true);
			return;
		}
		const io = new IntersectionObserver(
			(entries) => {
				if (entries.some((e) => e.isIntersecting)) {
					setVisible(true);
					io.disconnect();
				}
			},
			{ rootMargin },
		);
		io.observe(el);
		return () => io.disconnect();
	}, [visible, rootMargin]);

	return <div ref={ref}>{visible ? children : fallback}</div>;
}
