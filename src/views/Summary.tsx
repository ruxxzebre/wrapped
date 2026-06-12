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
import { Cards } from "../widgets";

export default function Summary() {
	const { data, error } = useQuery({
		queryKey: ["summary"],
		queryFn: api.summary,
	});
	if (!data) return <Status error={error} />;

	const cards = [
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
	];

	return (
		<>
			<Cards items={cards} />

			<OnThisDay />

			<YearChart
				title="Hours per year"
				data={data.years}
				dataKey="hours"
				color={chartColors.accent}
			/>
			<YearChart
				title="Plays per year"
				data={data.years}
				dataKey="plays"
				color={chartColors.info}
			/>
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
