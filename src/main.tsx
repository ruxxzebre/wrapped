import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/figtree/index.css";
import "./ui/theme.css";
import { getConn } from "./db/duckdb";
import { router } from "./routes.tsx";

// Warm the DuckDB-WASM engine (worker + wasm instantiate + icu load) in the
// background. This no longer gates the UI: ensureReady decides readiness from
// the OPFS snapshot alone, so a first-time visitor reaches the upload screen
// without waiting on the engine. Warming here means the engine is usually ready
// by the time they drop a zip; if it isn't, ingestZip awaits this same memoized
// promise. Errors surface through the status query; swallow the rejection.
void getConn().catch(() => {});

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// History is write-once; nothing changes under us mid-session.
			staleTime: Infinity,
			retry: 1,
		},
	},
});

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("#root element missing from index.html");
createRoot(rootEl).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
		</QueryClientProvider>
	</StrictMode>,
);
