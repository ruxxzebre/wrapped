import { useQuery } from "@tanstack/react-query";
import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { AttentionYear, ChronotypeYear, SplitArtist } from "../api";
import { fmtDuration, fmtInt, fmtPct } from "../format";
import { useT } from "../i18n";
import { ArtistLink } from "../links";
import { q } from "../queries";
import { type Column, chartColors, DataTable, Status } from "../ui";
import { Cards } from "../widgets";
import { Section } from "./insightsShared";
import * as css from "./insightsShared.css";

// 24h hour → "9pm". Used for the chronotype centre-of-gravity.
function hourLabel(h: number): string {
	const period = h < 12 ? "am" : "pm";
	const h12 = h % 12 === 0 ? 12 : h % 12;
	return `${h12}${period}`;
}

// Insights › Habits — the rhythm of how you listen: when (§21 chronotype),
// weekday vs weekend self (§20), and whether you still finish songs (§16).
export default function InsightsHabits() {
	return (
		<>
			<ChronotypePanel />
			<WeekendPanel />
			<AttentionPanel />
		</>
	);
}

function ChronotypePanel() {
	const t = useT();
	const { data, error } = useQuery(q.chronotype());
	const latest = data?.at(-1);

	const columns: Column<ChronotypeYear>[] = [
		{ key: "year", header: t("controls.year"), cell: (r) => r.year },
		{
			key: "mean",
			header: t("insights.chronotype.meanHour"),
			align: "right",
			cell: (r) => hourLabel(r.mean_hour),
		},
		{
			key: "night",
			header: t("insights.chronotype.nightShare"),
			align: "right",
			cell: (r) => fmtPct(r.night_share),
		},
		{
			key: "plays",
			header: t("col.plays"),
			align: "right",
			muted: true,
			cell: (r) => fmtInt(r.plays),
		},
	];

	return (
		<Section
			title={t("insights.chronotype.title")}
			lede={t("insights.chronotype.lede")}
		>
			{!data ? (
				<Status error={error} />
			) : (
				<>
					{latest && (
						<Cards
							items={[
								{
									label: t("insights.chronotype.meanHour"),
									value: hourLabel(latest.mean_hour),
									sub: String(latest.year),
								},
								{
									label: t("insights.chronotype.nightShare"),
									value: fmtPct(latest.night_share),
									sub: String(latest.year),
								},
							]}
						/>
					)}
					{data.length > 1 && (
						<ResponsiveContainer width="100%" height={240}>
							<LineChart
								data={data.map((y) => ({ year: y.year, hour: y.mean_hour }))}
								margin={{ top: 12, right: 8, left: -8, bottom: 0 }}
							>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke={chartColors.grid}
								/>
								<XAxis dataKey="year" stroke={chartColors.axis} fontSize={11} />
								<YAxis
									stroke={chartColors.axis}
									domain={[0, 24]}
									ticks={[0, 6, 12, 18, 24]}
									tickFormatter={hourLabel}
									fontSize={11}
								/>
								<Tooltip
									{...chartColors.tooltip}
									formatter={(v) => hourLabel(Number(v))}
								/>
								<Line
									name={t("insights.chronotype.meanLine")}
									dataKey="hour"
									stroke={chartColors.accent}
									strokeWidth={2}
									dot={{ r: 3 }}
									isAnimationActive={false}
								/>
							</LineChart>
						</ResponsiveContainer>
					)}
					<DataTable
						rows={data}
						columns={columns}
						rowKey={(r) => String(r.year)}
					/>
				</>
			)}
		</Section>
	);
}

function SplitList({ title, rows }: { title: string; rows: SplitArtist[] }) {
	const t = useT();
	const columns: Column<SplitArtist>[] = [
		{
			key: "artist",
			header: t("col.artist"),
			cell: (r) => <ArtistLink name={r.artist} />,
		},
		{
			key: "plays",
			header: t("col.plays"),
			align: "right",
			cell: (r) => fmtInt(r.plays),
		},
	];
	return (
		<div>
			<h3 className={css.subhead}>{title}</h3>
			<DataTable rows={rows} columns={columns} rowKey={(r) => r.artist} />
		</div>
	);
}

function WeekendPanel() {
	const t = useT();
	const { data, error } = useQuery(q.weekendSplit());

	return (
		<Section
			title={t("insights.weekend.title")}
			lede={
				data
					? t("insights.weekend.lede", { pct: fmtPct(data.divergence) })
					: undefined
			}
		>
			{!data ? (
				<Status error={error} />
			) : (
				<div className={css.splitGrid}>
					<SplitList
						title={t("insights.weekend.weekday")}
						rows={data.weekday}
					/>
					<SplitList
						title={t("insights.weekend.weekend")}
						rows={data.weekend}
					/>
				</div>
			)}
		</Section>
	);
}

function AttentionPanel() {
	const t = useT();
	const { data, error } = useQuery(q.attention());

	const columns: Column<AttentionYear>[] = [
		{ key: "year", header: t("controls.year"), cell: (r) => r.year },
		{
			key: "completion",
			header: t("insights.attention.completion"),
			align: "right",
			cell: (r) => fmtPct(r.avg_completion),
		},
		{
			key: "median",
			header: t("insights.attention.median"),
			align: "right",
			muted: true,
			cell: (r) => fmtDuration(r.median_ms),
		},
	];

	return (
		<Section
			title={t("insights.attention.title")}
			lede={t("insights.attention.lede")}
		>
			{!data ? (
				<Status error={error} />
			) : (
				<>
					{data.length > 1 && (
						<ResponsiveContainer width="100%" height={240}>
							<LineChart
								data={data.map((y) => ({
									year: y.year,
									completion: Math.round(y.avg_completion * 100),
								}))}
								margin={{ top: 12, right: 8, left: -8, bottom: 0 }}
							>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke={chartColors.grid}
								/>
								<XAxis dataKey="year" stroke={chartColors.axis} fontSize={11} />
								<YAxis
									stroke={chartColors.axis}
									domain={[0, 100]}
									unit="%"
									fontSize={11}
								/>
								<Tooltip
									{...chartColors.tooltip}
									formatter={(v) => `${Number(v)}%`}
								/>
								<Line
									name={t("insights.attention.completionLine")}
									dataKey="completion"
									stroke={chartColors.accent}
									strokeWidth={2}
									dot={{ r: 3 }}
									isAnimationActive={false}
								/>
							</LineChart>
						</ResponsiveContainer>
					)}
					<DataTable
						rows={data}
						columns={columns}
						rowKey={(r) => String(r.year)}
					/>
				</>
			)}
		</Section>
	);
}
