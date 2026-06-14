import { Link, Outlet } from "@tanstack/react-router";
import { WindowPicker } from "../controls";
import { useT } from "../i18n";
import { ControlsBar } from "../ui";
import * as buttonCss from "../ui/Button.css";
import * as css from "./InsightsLayout.css";
import { InsightsPeriodProvider, useInsightsPeriod } from "./insightsPeriod";

// Sub-tabs for the Insights group. "Overview" is the card dashboard (index
// route); the rest are the deeper analytics. The period/from/to filter below the
// tabs is shared by every sub-view (see insightsWindow).
const SUBTABS = [
	{ titleKey: "nav.insights.overview", slug: "/insights" },
	{ titleKey: "nav./patterns", slug: "/insights/patterns" },
	{ titleKey: "nav.insights.taste", slug: "/insights/taste" },
	{ titleKey: "nav.insights.habits", slug: "/insights/habits" },
	{ titleKey: "nav.insights.events", slug: "/insights/events" },
	{ titleKey: "nav.insights.devices", slug: "/insights/devices" },
] as const;

function Shell() {
	const t = useT();
	const { period, setPeriod } = useInsightsPeriod();
	return (
		<>
			<div className={css.subnav}>
				{SUBTABS.map((tab) => (
					<Link
						key={tab.slug}
						to={tab.slug}
						preload="viewport"
						className={buttonCss.variant.nav}
						activeProps={{ className: buttonCss.navActive }}
						activeOptions={{ exact: true, includeSearch: false }}
					>
						{t(tab.titleKey)}
					</Link>
				))}
			</div>
			<ControlsBar>
				<WindowPicker value={period} onChange={setPeriod} />
			</ControlsBar>
			<Outlet />
		</>
	);
}

export default function InsightsLayout() {
	return (
		<InsightsPeriodProvider>
			<Shell />
		</InsightsPeriodProvider>
	);
}
