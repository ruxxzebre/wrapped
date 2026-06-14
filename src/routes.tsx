import type { QueryClient } from "@tanstack/react-query";
import {
	createHashHistory,
	createRootRouteWithContext,
	createRoute,
	createRouter,
	lazyRouteComponent,
	redirect,
} from "@tanstack/react-router";
import App from "./App";
import type { Window } from "./api";
import type { TKey } from "./i18n";
import { q } from "./queries";
import { queryClient } from "./queryClient";
// Eager: App shell, the home/index view, the import screen (App renders it
// directly for the first-run gate) and the tiny Insights layout. Every other
// view is split into its own chunk via lazyRouteComponent so the initial bundle
// stays small; the router preloads those chunks on intent, so they never blink.
import { PendingView } from "./ui";
import type { Tint } from "./ui/PageHeader.css";
import Import from "./views/Import";
import InsightsLayout from "./views/InsightsLayout";
import Summary from "./views/Summary";

const Story = lazyRouteComponent(() => import("./components/Story"));
const TopTracks = lazyRouteComponent(() => import("./views/TopTracks"));
const TopArtists = lazyRouteComponent(() => import("./views/TopArtists"));
const Library = lazyRouteComponent(() => import("./views/Library"));
const Patterns = lazyRouteComponent(() => import("./views/Patterns"));
const Calendar = lazyRouteComponent(() => import("./views/Calendar"));
const PlayLog = lazyRouteComponent(() => import("./views/PlayLog"));
const Compare = lazyRouteComponent(() => import("./views/Compare"));
const Settings = lazyRouteComponent(() => import("./views/Settings"));
const InsightsDashboard = lazyRouteComponent(
	() => import("./views/InsightsDashboard"),
);
const TrackDetail = lazyRouteComponent(() => import("./views/TrackDetail"));
const ArtistDetail = lazyRouteComponent(() => import("./views/ArtistDetail"));
const YearReview = lazyRouteComponent(() => import("./views/YearReview"));

// Code-based route tree over hash history. Hash URLs (#/track/...) need zero
// server fallback config.

declare module "@tanstack/react-router" {
	interface StaticDataRouteOption {
		/** i18n key for the page title shown in PageHeader; absent on detail routes. */
		titleKey?: TKey;
		tint?: Tint;
		/** Bare tabs render full-bleed: no PageHeader, content wrapper, or footer. */
		bare?: boolean;
	}
	interface Register {
		router: typeof router;
	}
}

// Loaders run before App's status.ready gate, so they must not query an unready
// DuckDB. Warm the readiness flag first; bail when the library hasn't been
// imported yet (App renders the Import screen — nothing to prefetch). Once data
// exists the build step populates the same cache the view's useQuery reads, so
// navigation is a cache hit with no loading blink.
async function prefetch(
	qc: QueryClient,
	build: (qc: QueryClient) => Promise<unknown> | unknown,
) {
	const status = await qc.ensureQueryData(q.status());
	if (!status.ready) return;
	await build(qc);
}

const yearWindow = (y: number): Window => ({
	from: `${y}-01-01`,
	to: `${y}-12-31`,
});

const rootRoute = createRootRouteWithContext<{ queryClient: QueryClient }>()({
	component: App,
});

// --- Home ----------------------------------------------------------------
const summaryRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/",
	component: Summary,
	staticData: { titleKey: "nav./", tint: "green" },
	loader: ({ context: { queryClient } }) =>
		prefetch(queryClient, (qc) =>
			Promise.all([
				qc.ensureQueryData(q.summary()),
				qc.ensureQueryData(q.onThisDay()),
			]),
		),
});

export type StorySearch = { scene?: number };

// The active scene rides in the URL so back-navigation from a track/artist
// detail returns to the same beat instead of the top of the stack.
const storyRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/story",
	component: Story,
	staticData: { tint: "green", bare: true },
	validateSearch: (search: Record<string, unknown>): StorySearch => {
		const n = Number(search.scene);
		return Number.isInteger(n) && n > 0 ? { scene: n } : {};
	},
	loader: ({ context: { queryClient } }) =>
		prefetch(queryClient, (qc) =>
			Promise.all([
				qc.ensureQueryData(q.story()),
				qc.ensureQueryData(q.summary()),
			]),
		),
});

// --- Music ---------------------------------------------------------------
const tracksRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/music/tracks",
	component: TopTracks,
	staticData: { titleKey: "nav./top-tracks", tint: "neutral" },
	loader: ({ context: { queryClient } }) =>
		prefetch(queryClient, (qc) =>
			qc.ensureQueryData(q.topTracks("plays", {}, 30000, 100)),
		),
});
const artistsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/music/artists",
	component: TopArtists,
	staticData: { titleKey: "nav./top-artists", tint: "neutral" },
	loader: ({ context: { queryClient } }) =>
		prefetch(queryClient, (qc) =>
			qc.ensureQueryData(q.topArtists("plays", {}, 100)),
		),
});
const libraryRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/music/library",
	component: Library,
	staticData: { titleKey: "nav./library", tint: "neutral" },
	loader: ({ context: { queryClient } }) =>
		prefetch(queryClient, (qc) => qc.ensureQueryData(q.allTracks())),
});

// --- Insights (layout route + sub-tab children) --------------------------
// The layout carries the group title; children inherit it via App's
// nearest-titled-match lookup, so /insights and /insights/patterns both show
// the "Insights" header while the sub-tab bar marks the active sub-page.
const insightsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/insights",
	component: InsightsLayout,
	staticData: { titleKey: "nav.group.insights", tint: "neutral" },
});
const insightsIndexRoute = createRoute({
	getParentRoute: () => insightsRoute,
	path: "/",
	component: InsightsDashboard,
});
const insightsPatternsRoute = createRoute({
	getParentRoute: () => insightsRoute,
	path: "patterns",
	component: Patterns,
	loader: ({ context: { queryClient } }) =>
		prefetch(queryClient, (qc) =>
			Promise.all([
				qc.ensureQueryData(q.hourly({})),
				qc.ensureQueryData(q.weekly({})),
			]),
		),
});

// --- Timeline ------------------------------------------------------------
const calendarRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/timeline/calendar",
	component: Calendar,
	staticData: { titleKey: "nav./calendar", tint: "neutral" },
	// The default year is the latest in the library, derived from the summary —
	// match the view's selection so the warmed calendar key is the one it reads.
	loader: ({ context: { queryClient } }) =>
		prefetch(queryClient, async (qc) => {
			const summary = await qc.ensureQueryData(q.summary());
			const years = summary.years.map((y) => y.year).sort((a, b) => b - a);
			await qc.ensureQueryData(q.calendar(years[0]));
		}),
});

// --- Explore -------------------------------------------------------------
export type PlayLogSearch = { from?: string; to?: string };
const playLogRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/explore/play-log",
	component: PlayLog,
	staticData: { titleKey: "nav./play-log", tint: "neutral" },
	validateSearch: (search: Record<string, unknown>): PlayLogSearch => ({
		from: typeof search.from === "string" ? search.from : undefined,
		to: typeof search.to === "string" ? search.to : undefined,
	}),
	// Re-run when the date window changes so a Calendar day-click lands warm.
	loaderDeps: ({ search }) => ({ from: search.from, to: search.to }),
	loader: ({ context: { queryClient }, deps }) =>
		prefetch(queryClient, (qc) =>
			qc.ensureInfiniteQueryData(q.plays("", { from: deps.from, to: deps.to })),
		),
});
const compareRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/explore/compare",
	component: Compare,
	staticData: { titleKey: "nav./compare", tint: "neutral" },
	// Default columns compare the earliest vs latest full year (artists/plays) —
	// derive the same windows the view does so both prefetched keys match.
	loader: ({ context: { queryClient } }) =>
		prefetch(queryClient, async (qc) => {
			const summary = await qc.ensureQueryData(q.summary());
			const years = summary.years.map((y) => y.year).sort((a, b) => a - b);
			if (years.length < 2) return;
			const a = yearWindow(years[0]);
			const b = yearWindow(years[years.length - 1]);
			await Promise.all([
				qc.ensureQueryData(q.compareTop("artists", "plays", a)),
				qc.ensureQueryData(q.compareTop("artists", "plays", b)),
			]);
		}),
});

// --- System --------------------------------------------------------------
const importRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/import",
	component: Import,
	staticData: { titleKey: "nav./import", tint: "neutral" },
});
const settingsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/settings",
	component: Settings,
	staticData: { titleKey: "nav./settings", tint: "neutral" },
});

// --- Detail routes (no PageHeader) ---------------------------------------
// The views read their own params via getRouteApi, so the route just points at
// the lazy component.
const trackRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/track/$uri",
	component: TrackDetail,
	loader: ({ context: { queryClient }, params: { uri } }) =>
		prefetch(queryClient, (qc) => qc.ensureQueryData(q.track(uri))),
});
const artistRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/artist/$name",
	component: ArtistDetail,
	loader: ({ context: { queryClient }, params: { name } }) =>
		prefetch(queryClient, (qc) =>
			Promise.all([
				qc.ensureQueryData(q.artist(name)),
				qc.ensureQueryData(q.artistTracks(name)),
			]),
		),
});
const yearRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/year/$year",
	component: YearReview,
	loader: ({ context: { queryClient }, params: { year } }) =>
		prefetch(queryClient, (qc) =>
			Promise.all([
				qc.ensureQueryData(q.year(Number(year))),
				qc.ensureQueryData(q.summary()),
			]),
		),
});

// Unknown paths fall back to the Summary tab.
const catchAllRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "$",
	beforeLoad: () => {
		throw redirect({ to: "/" });
	},
});

const routeTree = rootRoute.addChildren([
	summaryRoute,
	storyRoute,
	tracksRoute,
	artistsRoute,
	libraryRoute,
	insightsRoute.addChildren([insightsIndexRoute, insightsPatternsRoute]),
	calendarRoute,
	playLogRoute,
	compareRoute,
	importRoute,
	settingsRoute,
	trackRoute,
	artistRoute,
	yearRoute,
	catchAllRoute,
]);

export const router = createRouter({
	routeTree,
	history: createHashHistory(),
	context: { queryClient },
	defaultPreload: "intent",
	// Defer all caching to React Query (staleTime: Infinity); the loader is then a
	// cheap cache-hit on real navigation rather than a second router-level cache.
	defaultPreloadStaleTime: 0,
	// Shown while a route's lazy chunk (and loader) resolves — without it the
	// Outlet suspends with no fallback and the boot-splash → view handoff flashes
	// a black gap. pendingMs: 0 shows it immediately so there's never a blank
	// frame; minMs: 0 lets it vanish the instant the view is ready (no forced
	// dwell that would read as slow on warm, preloaded navigations).
	defaultPendingComponent: PendingView,
	defaultPendingMs: 0,
	defaultPendingMinMs: 0,
	// Cross-fade between routes instead of a hard cut (no-op where unsupported).
	defaultViewTransition: false,
	// Remember scroll position per route. The body never scrolls — the main pane
	// does — so the window reset isn't enough; scrollToTopSelectors resets that
	// custom container to the top on forward navigation, while back/forward
	// restores the saved position. The pane carries data-scroll-restoration-id.
	scrollRestoration: true,
	scrollToTopSelectors: ['[data-scroll-restoration-id="main"]'],
});
