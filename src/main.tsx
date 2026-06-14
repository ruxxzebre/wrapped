import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/figtree/index.css";
import "./ui/theme.css";
import { getConn } from "./db/duckdb";
import { queryClient } from "./queryClient";
import { router } from "./routes.tsx";

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

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("#root element missing from index.html");
createRoot(rootEl).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
			<ReactQueryDevtools initialIsOpen={true} />
		</QueryClientProvider>
	</StrictMode>,
);
