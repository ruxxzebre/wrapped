import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/figtree/index.css";
import "./ui/theme.css";
import { getConn } from "./db/duckdb";
import { router } from "./routes.tsx";

// Kick off the DuckDB-WASM boot (worker + wasm instantiate + icu load) at the
// earliest point so it overlaps React mount and the first paint instead of
// starting only when App fires its status query. getConn is memoized, so the
// later query() calls await this same in-flight promise. Errors here surface
// through that query; swallow the unhandled rejection.
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
