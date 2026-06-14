import { useQuery } from "@tanstack/react-query";
import { fmtPct } from "../format";
import { useT } from "../i18n";
import { q } from "../queries";
import { Muted } from "../ui";
import { Cards } from "../widgets";
import { Section } from "./insightsShared";
import * as css from "./insightsShared.css";

// The Insights "Overview" sub-tab: a framing lede plus a few headline numbers
// pulled from the deeper sub-tabs (Taste / Habits / Events / Devices).
export default function InsightsDashboard() {
	const t = useT();
	const range = useQuery(q.rangeIndex());
	const hiatuses = useQuery(q.hiatuses());
	const chronotype = useQuery(q.chronotype());

	const gini = range.data?.all?.gini;
	const longestHiatus = hiatuses.data?.[0]?.days;
	const night = chronotype.data?.at(-1)?.night_share;

	return (
		<Section title={t("insights.dashboardTitle")}>
			<p className={css.lede}>
				<Muted size="sm">{t("insights.overview.lede")}</Muted>
			</p>
			<Cards
				items={[
					{
						label: t("insights.overview.gini"),
						value: gini != null ? gini.toFixed(2) : t("common.dash"),
					},
					{
						label: t("insights.overview.longestHiatus"),
						value:
							longestHiatus != null
								? t("count.days", {
										count: longestHiatus,
										n: String(longestHiatus),
									})
								: t("common.dash"),
					},
					{
						label: t("insights.overview.nightShare"),
						value: night != null ? fmtPct(night) : t("common.dash"),
					},
				]}
			/>
		</Section>
	);
}
