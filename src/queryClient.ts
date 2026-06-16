import { QueryClient } from "@tanstack/react-query";

// Single shared client: main.tsx mounts it via QueryClientProvider, routes.tsx
// hands it to the router as context so loaders can prefetch into the same cache.
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// History is write-once; nothing changes under us mid-session.
			staleTime: Number.POSITIVE_INFINITY,
			// Evict results 10 min after their last observer unmounts so the JS heap
			// doesn't grow unbounded as you browse (every Arrow→JS result would
			// otherwise stay resident all session). A revisit past that window
			// re-runs the SQL, which is cheap against the in-memory DuckDB.
			gcTime: 10 * 60 * 1000,
			retry: 1,
		},
	},
});
