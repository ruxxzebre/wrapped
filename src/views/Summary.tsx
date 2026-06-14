import { useQuery } from "@tanstack/react-query";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import OnThisDay from "../components/OnThisDay";
import { fmtDate, fmtHours, fmtInt } from "../format";
import { useT } from "../i18n";
import { q } from "../queries";
import { chartColors, Panel, Status } from "../ui";
import { Cards, CardsSkeleton, ChartSkeleton } from "../widgets";

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

			<OnThisDay />

			{data ? (
				<YearChart
					title={t("summary.hoursPerYear")}
					data={data.years}
					dataKey="hours"
					color={chartColors.accent}
				/>
			) : (
				<Panel title={t("summary.hoursPerYear")}>
					<ChartSkeleton height={YEAR_CHART_HEIGHT} />
				</Panel>
			)}
			{data ? (
				<YearChart
					title={t("summary.playsPerYear")}
					data={data.years}
					dataKey="plays"
					color={chartColors.info}
				/>
			) : (
				<Panel title={t("summary.playsPerYear")}>
					<ChartSkeleton height={YEAR_CHART_HEIGHT} />
				</Panel>
			)}
		</>
	);
}

function YearChart({
	title,
	data,
	dataKey,
	color,
}: {
	title: string;
	data: unknown[];
	dataKey: string;
	color: string;
}) {
	return (
		<Panel title={title}>
			<ResponsiveContainer width="100%" height={280}>
				<BarChart data={data}>
					<CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
					<XAxis dataKey="year" stroke={chartColors.axis} />
					<YAxis stroke={chartColors.axis} />
					<Tooltip {...chartColors.tooltip} />
					<Bar
						dataKey={dataKey}
						fill={color}
						radius={[3, 3, 0, 0]}
						isAnimationActive={false}
					/>
				</BarChart>
			</ResponsiveContainer>
		</Panel>
	);
}

function fmtPctOf(part: number, whole: number) {
	return `${((part / whole) * 100).toFixed(0)}%`;
}
