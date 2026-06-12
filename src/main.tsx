import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/figtree/index.css";
import "./ui/theme.css";
import { router } from "./routes.tsx";

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
