import type { TKey } from "./i18n";
import type { Tint } from "./ui/PageHeader.css";

// Grouped navigation model — the single source of truth for the sidebar.
// The sidebar is an accordion of groups. "expand" groups list their leaves;
// the "link" group (Insights) is a single entry whose sub-pages live in an
// in-pane sub-tab bar (see views/InsightsLayout.tsx). Slugs here must match the
// route paths declared in routes.tsx.
export type NavLeaf = { titleKey: TKey; slug: string; tint?: Tint };

export type NavGroup =
	| { kind: "expand"; headerKey: TKey; leaves: NavLeaf[] }
	| { kind: "link"; headerKey: TKey; slug: string; tint?: Tint };

export const NAV = [
	{
		kind: "expand",
		headerKey: "nav.group.home",
		leaves: [
			{ titleKey: "nav./", slug: "/", tint: "green" },
			{ titleKey: "nav./story", slug: "/story", tint: "green" },
		],
	},
	{
		kind: "expand",
		headerKey: "nav.group.music",
		leaves: [
			{ titleKey: "nav./top-tracks", slug: "/music/tracks" },
			{ titleKey: "nav./top-artists", slug: "/music/artists" },
			{ titleKey: "nav./top-albums", slug: "/music/albums" },
			{ titleKey: "nav./library", slug: "/music/library" },
		],
	},
	{ kind: "link", headerKey: "nav.group.insights", slug: "/insights" },
	{
		kind: "expand",
		headerKey: "nav.group.timeline",
		leaves: [{ titleKey: "nav./calendar", slug: "/timeline/calendar" }],
	},
	{
		kind: "expand",
		headerKey: "nav.group.explore",
		leaves: [
			{ titleKey: "nav./play-log", slug: "/explore/play-log" },
			{ titleKey: "nav./compare", slug: "/explore/compare" },
		],
	},
	{
		kind: "expand",
		headerKey: "nav.group.system",
		leaves: [
			{ titleKey: "nav./import", slug: "/import" },
			{ titleKey: "nav./settings", slug: "/settings" },
		],
	},
] as const satisfies readonly NavGroup[];

// A sidebar leaf is highlighted only on an exact path match. "/" must match
// exactly so it isn't lit up on every nested route.
export function leafActive(slug: string, pathname: string): boolean {
	return slug === "/" ? pathname === "/" : pathname === slug;
}
