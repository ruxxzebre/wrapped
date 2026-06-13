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
import { api } from "../api";
import OnThisDay from "../components/OnThisDay";
import { fmtDate, fmtHours, fmtInt } from "../format";
import { chartColors, Panel, Status } from "../ui";
import { Cards, CardsSkeleton, ChartSkeleton } from "../widgets";

// Matches the ResponsiveContainer height in YearChart so the skeleton panel and
// the real panel are the same size — no reflow when data lands.
const YEAR_CHART_HEIGHT = 280;

export default function Summary() {
	const { data, error } = useQuery({
		queryKey: ["summary"],
		queryFn: api.summary,
	});
	// Errors surface as before; loading no longer blanks the page — each section
	// renders its own placeholder so the layout is stable from first paint.
	if (error) return <Status error={error} />;

	const cards = data
		? [
				{
					label: "plays",
					value: fmtInt(data.plays),
					sub: `${fmtInt(data.streams)} ≥30s streams`,
				},
				{
					label: "hours",
					value: fmtHours(data.hours),
					sub: `${(data.hours / 24).toFixed(0)} days`,
				},
				{ label: "tracks", value: fmtInt(data.tracks) },
				{ label: "artists", value: fmtInt(data.artists) },
				{
					label: "skips",
					value: fmtInt(data.skips),
					sub: fmtPctOf(data.skips, data.plays),
				},
				{
					label: "since",
					value: fmtDate(data.first_play),
					sub: `latest ${fmtDate(data.last_play)}`,
				},
			]
		: null;

	return (
		<>
			{cards ? <Cards items={cards} /> : <CardsSkeleton count={6} />}

			<OnThisDay />

			{data ? (
				<YearChart
					title="Hours per year"
					data={data.years}
					dataKey="hours"
					color={chartColors.accent}
				/>
			) : (
				<Panel title="Hours per year">
					<ChartSkeleton height={YEAR_CHART_HEIGHT} />
				</Panel>
			)}
			{data ? (
				<YearChart
					title="Plays per year"
					data={data.years}
					dataKey="plays"
					color={chartColors.info}
				/>
			) : (
				<Panel title="Plays per year">
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
					<Bar dataKey={dataKey} fill={color} radius={[3, 3, 0, 0]} />
				</BarChart>
			</ResponsiveContainer>
		</Panel>
	);
}

function fmtPctOf(part: number, whole: number) {
	return whole ? `${((part / whole) * 100).toFixed(0)}% of plays` : "";
}
