import { QueryClient } from "@tanstack/react-query";

// Single shared client: main.tsx mounts it via QueryClientProvider, routes.tsx
// hands it to the router as context so loaders can prefetch into the same cache.
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// History is write-once; nothing changes under us mid-session.
			staleTime: Number.POSITIVE_INFINITY,
			// Keep warmed queries resident for the whole session so revisiting a
			// page (or restoring a scrolled list) never refetches.
			gcTime: Number.POSITIVE_INFINITY,
			retry: 1,
		},
	},
});
