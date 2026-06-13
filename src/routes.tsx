import {
	createHashHistory,
	createRootRoute,
	createRoute,
	createRouter,
	redirect,
} from "@tanstack/react-router";
import App from "./App";
import Story from "./components/Story";
import type { TKey } from "./i18n";
import type { Tint } from "./ui/PageHeader.css";
import ArtistDetail from "./views/ArtistDetail";
import Calendar from "./views/Calendar";
import Compare from "./views/Compare";
import Import from "./views/Import";
import InsightsDashboard from "./views/InsightsDashboard";
import InsightsLayout from "./views/InsightsLayout";
import Library from "./views/Library";
import Patterns from "./views/Patterns";
import PlayLog from "./views/PlayLog";
import Settings from "./views/Settings";
import Summary from "./views/Summary";
import TopArtists from "./views/TopArtists";
import TopTracks from "./views/TopTracks";
import TrackDetail from "./views/TrackDetail";
import YearReview from "./views/YearReview";

// Code-based route tree over hash history. Hash URLs (#/track/...) need zero
// server fallback config and keep pre-migration bookmarks working.

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

const rootRoute = createRootRoute({ component: App });

// --- Home ----------------------------------------------------------------
const summaryRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/",
	component: Summary,
	staticData: { titleKey: "nav./", tint: "green" },
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
});

// --- Music ---------------------------------------------------------------
const tracksRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/music/tracks",
	component: TopTracks,
	staticData: { titleKey: "nav./top-tracks", tint: "neutral" },
});
const artistsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/music/artists",
	component: TopArtists,
	staticData: { titleKey: "nav./top-artists", tint: "neutral" },
});
const libraryRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/music/library",
	component: Library,
	staticData: { titleKey: "nav./library", tint: "neutral" },
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
});

// --- Timeline ------------------------------------------------------------
const calendarRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/timeline/calendar",
	component: Calendar,
	staticData: { titleKey: "nav./calendar", tint: "neutral" },
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
});
const compareRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/explore/compare",
	component: Compare,
	staticData: { titleKey: "nav./compare", tint: "neutral" },
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
const trackRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/track/$uri",
	component: function TrackRoute() {
		const { uri } = trackRoute.useParams();
		return <TrackDetail uri={uri} />;
	},
});
const artistRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/artist/$name",
	component: function ArtistRoute() {
		const { name } = artistRoute.useParams();
		return <ArtistDetail name={name} />;
	},
});
const yearRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/year/$year",
	component: function YearRoute() {
		const { year } = yearRoute.useParams();
		return <YearReview year={Number(year)} />;
	},
});

// --- Legacy slug redirects (keep old bookmarks working) ------------------
const legacyTopTracks = createRoute({
	getParentRoute: () => rootRoute,
	path: "/top-tracks",
	beforeLoad: () => {
		throw redirect({ to: "/music/tracks" });
	},
});
const legacyTopArtists = createRoute({
	getParentRoute: () => rootRoute,
	path: "/top-artists",
	beforeLoad: () => {
		throw redirect({ to: "/music/artists" });
	},
});
const legacyLibrary = createRoute({
	getParentRoute: () => rootRoute,
	path: "/library",
	beforeLoad: () => {
		throw redirect({ to: "/music/library" });
	},
});
const legacyPatterns = createRoute({
	getParentRoute: () => rootRoute,
	path: "/patterns",
	beforeLoad: () => {
		throw redirect({ to: "/insights/patterns" });
	},
});
const legacyCalendar = createRoute({
	getParentRoute: () => rootRoute,
	path: "/calendar",
	beforeLoad: () => {
		throw redirect({ to: "/timeline/calendar" });
	},
});
const legacyCompare = createRoute({
	getParentRoute: () => rootRoute,
	path: "/compare",
	beforeLoad: () => {
		throw redirect({ to: "/explore/compare" });
	},
});
// Play Log redirect preserves the date-window search params.
const legacyPlayLog = createRoute({
	getParentRoute: () => rootRoute,
	path: "/play-log",
	validateSearch: (search: Record<string, unknown>): PlayLogSearch => ({
		from: typeof search.from === "string" ? search.from : undefined,
		to: typeof search.to === "string" ? search.to : undefined,
	}),
	beforeLoad: ({ search }) => {
		throw redirect({ to: "/explore/play-log", search });
	},
});

// Unknown paths fall back to the Summary tab, like the old router did.
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
	legacyTopTracks,
	legacyTopArtists,
	legacyLibrary,
	legacyPatterns,
	legacyCalendar,
	legacyCompare,
	legacyPlayLog,
	catchAllRoute,
]);

export const router = createRouter({
	routeTree,
	history: createHashHistory(),
});
