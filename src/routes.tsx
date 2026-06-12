import {
	createHashHistory,
	createRootRoute,
	createRoute,
	createRouter,
	redirect,
} from "@tanstack/react-router";
import App from "./App";
import { TABS } from "./tabs";
import type { Tint } from "./ui/PageHeader.css";
import ArtistDetail from "./views/ArtistDetail";
import PlayLog from "./views/PlayLog";
import TrackDetail from "./views/TrackDetail";
import YearReview from "./views/YearReview";

// Code-based route tree over hash history. Hash URLs (#/track/...) need zero
// server fallback config and keep pre-migration bookmarks working.

declare module "@tanstack/react-router" {
	interface StaticDataRouteOption {
		/** Tab title shown in PageHeader; absent on detail routes. */
		title?: string;
		tint?: Tint;
	}
	interface Register {
		router: typeof router;
	}
}

const rootRoute = createRootRoute({ component: App });

// Home tabs map 1:1 to routes. Play Log is defined separately because it
// validates date-filter search params (Calendar day clicks deep-link into it).
const tabRoutes = TABS.filter((t) => t.slug !== "/play-log").map((t) =>
	createRoute({
		getParentRoute: () => rootRoute,
		path: t.slug,
		component: t.C,
		staticData: { title: t.name, tint: t.tint },
	}),
);

export type PlayLogSearch = { from?: string; to?: string };

const playLogRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/play-log",
	component: PlayLog,
	staticData: { title: "Play Log", tint: "neutral" },
	validateSearch: (search: Record<string, unknown>): PlayLogSearch => ({
		from: typeof search.from === "string" ? search.from : undefined,
		to: typeof search.to === "string" ? search.to : undefined,
	}),
});

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

// Unknown paths fall back to the Summary tab, like the old router did.
const catchAllRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "$",
	beforeLoad: () => {
		throw redirect({ to: "/" });
	},
});

const routeTree = rootRoute.addChildren([
	...tabRoutes,
	playLogRoute,
	trackRoute,
	artistRoute,
	yearRoute,
	catchAllRoute,
]);

export const router = createRouter({
	routeTree,
	history: createHashHistory(),
});
