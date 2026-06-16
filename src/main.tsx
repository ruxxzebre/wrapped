import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/figtree/index.css";
import "./ui/theme.css";
import { getConn } from "./db/duckdb";
import { mark } from "./perf";
import { queryClient } from "./queryClient";
import { router } from "./routes.tsx";

// Devtools are dev-only: gated on import.meta.env.DEV, which Vite statically
// replaces with `false` in production. The lazy import keeps the devtools chunk
// out of the prod bundle entirely (the branch is dead-code-eliminated).
const ReactQueryDevtools = import.meta.env.DEV
	? lazy(() =>
			import("@tanstack/react-query-devtools").then((m) => ({
				default: m.ReactQueryDevtools,
			})),
		)
	: null;

// Dev-only decision benchmark: `await window.__bench()` in the console once a
// library is loaded. Lazy import keeps bench.ts out of the prod bundle.
if (import.meta.env.DEV) {
	(window as unknown as { __bench: () => Promise<void> }).__bench = () =>
		import("./db/bench").then((m) => m.bench());
}

// Warm the DuckDB-WASM engine (worker + wasm instantiate + icu load) in the
// background. This no longer gates the UI: ensureReady decides readiness from
// the OPFS snapshot alone, so a first-time visitor reaches the upload screen
// without waiting on the engine. Warming here means the engine is usually ready
// by the time they drop a zip; if it isn't, ingestZip awaits this same memoized
// promise. Errors surface through the status query; swallow the rejection.
void getConn().catch(() => {});

// Once the initial route has settled, warm the fixed (non-parameterised) routes
// during idle time so a first click-through feels instant. Deliberately not
// eager-all: each query is a real SQL scan, so staggering on idle keeps boot
// cheap and the single DuckDB worker free for the page actually open.
const idle =
	window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1));
router.load().then(() => {
	idle(() => {
		for (const to of [
			"/music/tracks",
			"/music/artists",
			"/music/library",
			"/insights/patterns",
			"/timeline/calendar",
			"/explore/play-log",
			"/explore/compare",
		] as const) {
			void router.preloadRoute({ to });
		}
	});
});

// Mark the end of the cold-load path: the first route to resolve — Summary on a
// normal open, or whatever view a deep link lands on — has its loader settled
// and is about to paint. The double-rAF defers the mark past the commit so the
// logged offset reflects pixels on screen, not just data-ready. Dev-only: the
// whole block is behind import.meta.env.DEV, so Vite strips it from prod.
if (import.meta.env.DEV) {
	const unsub = router.subscribe("onResolved", () => {
		unsub();
		requestAnimationFrame(() =>
			requestAnimationFrame(() => mark("first route painted")),
		);
	});
}

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("#root element missing from index.html");
createRoot(rootEl).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
			{ReactQueryDevtools ? (
				<Suspense>
					<ReactQueryDevtools initialIsOpen={false} />
				</Suspense>
			) : null}
		</QueryClientProvider>
	</StrictMode>,
);
