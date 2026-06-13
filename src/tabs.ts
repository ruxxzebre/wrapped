import type { ReactNode } from "react";
import Story from "./components/Story";
import type { Tint } from "./ui/PageHeader.css";
import Calendar from "./views/Calendar";
import Compare from "./views/Compare";
import Import from "./views/Import";
import Library from "./views/Library";
import Patterns from "./views/Patterns";
import PlayLog from "./views/PlayLog";
import Settings from "./views/Settings";
import Summary from "./views/Summary";
import TopArtists from "./views/TopArtists";
import TopTracks from "./views/TopTracks";

// Home tabs, each mapped to a hash route so browser back/forward steps through
// tabs and detail pages alike. Shared by the route tree (routes.tsx) and the
// sidebar nav (App.tsx) without creating an import cycle between them.
export const TABS: {
	name: string;
	slug: string;
	tint: Tint;
	C: () => ReactNode;
	// `bare` tabs own the whole pane: no PageHeader, content wrapper, or footer.
	// Used by the full-screen scroll-snap Story.
	bare?: boolean;
}[] = [
	{ name: "Summary", slug: "/", tint: "green", C: Summary },
	{ name: "Story", slug: "/story", tint: "green", C: Story, bare: true },
	{ name: "Top Tracks", slug: "/top-tracks", tint: "neutral", C: TopTracks },
	{ name: "Top Artists", slug: "/top-artists", tint: "neutral", C: TopArtists },
	{ name: "Patterns", slug: "/patterns", tint: "neutral", C: Patterns },
	{ name: "Calendar", slug: "/calendar", tint: "neutral", C: Calendar },
	{ name: "Library", slug: "/library", tint: "neutral", C: Library },
	{ name: "Play Log", slug: "/play-log", tint: "neutral", C: PlayLog },
	{ name: "Compare", slug: "/compare", tint: "neutral", C: Compare },
	{ name: "Import", slug: "/import", tint: "neutral", C: Import },
	{ name: "Settings", slug: "/settings", tint: "neutral", C: Settings },
];
