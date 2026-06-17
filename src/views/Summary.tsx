import { useQuery } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import DiscoveryCard from "../components/DiscoveryCard";
import MilestoneCard from "../components/MilestoneCard";
import OnThisDay from "../components/OnThisDay";
import PaceCard from "../components/PaceCard";
import RecordsBoard from "../components/RecordsBoard";
import StreakCard from "../components/StreakCard";
import { fmtDate, fmtHours, fmtInt } from "../format";
import { useT } from "../i18n";
import { q } from "../queries";
import { chartColors, Grid2, Panel, Status } from "../ui";
import { Cards, CardsSkeleton, ChartSkeleton } from "../widgets";

// recharts is heavy and the home view is eager, so the year charts (below the
// fold) load on demand: the chunk only downloads when data lands, and the same
// ChartSkeleton panel covers both the data-loading and chunk-loading waits.
const YearChart = lazy(() =>
	import("../charts").then((m) => ({ default: m.YearChart })),
);

// Matches the ResponsiveContainer height in YearChart so the skeleton panel and
// the real panel are the same size — no reflow when data lands.
const YEAR_CHART_HEIGHT = 280;

export default function Summary() {
	const t = useT();
	const { data, error } = useQuery(q.summary());
	// Errors surface as before; loading no longer blanks the page — each section
	// renders its own placeholder so the layout is stable from first paint.
	if (error) return <Status error={error} />;

	const cards = data
		? [
				{
					label: t("card.plays"),
					value: fmtInt(data.plays),
					sub: t("summary.streamsSub", { count: fmtInt(data.streams) }),
				},
				{
					label: t("card.hours"),
					value: fmtHours(data.hours),
					sub: t("count.days", {
						count: Math.round(data.hours / 24),
						n: fmtInt(Math.round(data.hours / 24)),
					}),
				},
				{ label: t("card.tracks"), value: fmtInt(data.tracks) },
				{ label: t("card.artists"), value: fmtInt(data.artists) },
				{
					label: t("card.skips"),
					value: fmtInt(data.skips),
					sub: data.plays
						? t("summary.pctOfPlays", { pct: fmtPctOf(data.skips, data.plays) })
						: "",
				},
				{
					label: t("card.since"),
					value: fmtDate(data.first_play),
					sub: t("summary.latest", { date: fmtDate(data.last_play) }),
				},
			]
		: null;

	return (
		<>
			{cards ? <Cards items={cards} /> : <CardsSkeleton count={6} />}

			<Grid2>
				<StreakCard />
				<PaceCard />
			</Grid2>

			<MilestoneCard />

			<RecordsBoard />

			<DiscoveryCard />

			<OnThisDay />

			{data ? (
				<Suspense fallback={yearChartSkeleton(t("summary.hoursPerYear"))}>
					<YearChart
						title={t("summary.hoursPerYear")}
						data={data.years}
						dataKey="hours"
						color={chartColors.accent}
					/>
				</Suspense>
			) : (
				yearChartSkeleton(t("summary.hoursPerYear"))
			)}
			{data ? (
				<Suspense fallback={yearChartSkeleton(t("summary.playsPerYear"))}>
					<YearChart
						title={t("summary.playsPerYear")}
						data={data.years}
						dataKey="plays"
						color={chartColors.info}
					/>
				</Suspense>
			) : (
				yearChartSkeleton(t("summary.playsPerYear"))
			)}
		</>
	);
}

function yearChartSkeleton(title: string) {
	return (
		<Panel title={title}>
			<ChartSkeleton height={YEAR_CHART_HEIGHT} />
		</Panel>
	);
}

function fmtPctOf(part: number, whole: number) {
	return `${((part / whole) * 100).toFixed(0)}%`;
}
