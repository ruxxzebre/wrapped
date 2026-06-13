import { Outlet, useRouterState } from "@tanstack/react-router";
import { useT } from "../i18n";
import { navigate } from "../router";
import { Button } from "../ui";
import * as css from "./InsightsLayout.css";

// Sub-tabs for the Insights group. "Overview" is the card dashboard (index
// route); "Patterns" is the relocated time-of-day view. Future analytics add
// entries here.
const SUBTABS = [
	{ titleKey: "nav.insights.overview", slug: "/insights" },
	{ titleKey: "nav./patterns", slug: "/insights/patterns" },
] as const;

export default function InsightsLayout() {
	const t = useT();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return (
		<>
			<div className={css.subnav}>
				{SUBTABS.map((tab) => (
					<Button
						key={tab.slug}
						variant="nav"
						active={pathname === tab.slug}
						onClick={() => navigate(tab.slug)}
					>
						{t(tab.titleKey)}
					</Button>
				))}
			</div>
			<Outlet />
		</>
	);
}
