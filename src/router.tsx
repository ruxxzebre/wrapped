import type { ReactNode } from "react";

// Navigation primitives over hash URLs. Route matching lives in routes.tsx
// (TanStack Router on createHashHistory); these helpers stay as plain hash
// anchors because the router observes hashchange — same SPA navigation, and
// pre-encoded paths (e.g. from CommandPalette results) pass through untouched
// instead of being re-encoded by structured Link params.

export function navigate(to: string) {
	const target = to.startsWith("#") ? to : `#${to}`;
	if (window.location.hash !== target) window.location.hash = target;
}

export const trackPath = (uri: string) => `/track/${encodeURIComponent(uri)}`;
export const artistPath = (name: string) =>
	`/artist/${encodeURIComponent(name)}`;
export const yearPath = (year: number) => `/year/${year}`;

export function Link({
	to,
	className,
	title,
	children,
}: {
	to: string;
	className?: string;
	title?: string;
	children: ReactNode;
}) {
	return (
		<a href={`#${to}`} className={className} title={title}>
			{children}
		</a>
	);
}
