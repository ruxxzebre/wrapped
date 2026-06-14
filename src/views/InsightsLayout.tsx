import { Link, Outlet } from "@tanstack/react-router";
import { useT } from "../i18n";
import * as buttonCss from "../ui/Button.css";
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
	return (
		<>
			<div className={css.subnav}>
				{SUBTABS.map((tab) => (
					<Link
						key={tab.slug}
						to={tab.slug}
						className={buttonCss.variant.nav}
						activeProps={{ className: buttonCss.navActive }}
						activeOptions={{ exact: true, includeSearch: false }}
					>
						{t(tab.titleKey)}
					</Link>
				))}
			</div>
			<Outlet />
		</>
	);
}
