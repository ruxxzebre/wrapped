import { useT } from "../i18n";
import { Muted, Panel } from "../ui";

// The Insights "Overview" sub-tab. Placeholder card dashboard — future
// analytics (Range index, Weekend split, Keeper-rate, …) render as cards here.
export default function InsightsDashboard() {
	const t = useT();
	return (
		<Panel title={t("insights.dashboardTitle")}>
			<Muted>{t("insights.empty")}</Muted>
		</Panel>
	);
}
