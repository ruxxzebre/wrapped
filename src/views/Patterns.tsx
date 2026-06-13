import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { api, type Bucket, type Window } from "../api";
import { WindowPicker } from "../controls";
import { weekdayShort } from "../format";
import { useT } from "../i18n";
import { ControlsBar, chartColors, Panel, Status } from "../ui";

export default function Patterns() {
	const t = useT();
	const [window, setWindow] = useState<Window>({});

	const hourly = useQuery({
		queryKey: ["hourly", window],
		queryFn: () => api.hourly(window),
		placeholderData: (prev) => prev,
	});
	const weekly = useQuery({
		queryKey: ["weekly", window],
		queryFn: () => api.weekly(window),
		placeholderData: (prev) => prev,
	});

	return (
		<>
			<ControlsBar>
				<WindowPicker value={window} onChange={setWindow} />
			</ControlsBar>

			<PatternChart
				title={t("patterns.byHour")}
				data={hourly.data}
				error={hourly.error}
				tick={(b) => String(b)}
			/>
			<PatternChart
				title={t("patterns.byWeekday")}
				data={weekly.data}
				error={weekly.error}
				tick={(b) => weekdayShort(b)}
			/>
		</>
	);
}

function PatternChart({
	title,
	data,
	error,
	tick,
}: {
	title: string;
	data?: Bucket[];
	error: Error | null;
	tick: (bucket: number) => string;
}) {
	if (!data) return <Status error={error} />;
	const rows = data.map((b) => ({
		...b,
		label: tick(b.bucket),
		hours: Math.round(b.hours),
	}));
	return (
		<Panel title={title}>
			<ResponsiveContainer width="100%" height={260}>
				<BarChart data={rows}>
					<CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
					<XAxis
						dataKey="label"
						stroke={chartColors.axis}
						interval={0}
						fontSize={11}
					/>
					<YAxis stroke={chartColors.axis} />
					<Tooltip {...chartColors.tooltip} />
					<Bar
						dataKey="hours"
						fill={chartColors.accent}
						radius={[3, 3, 0, 0]}
					/>
				</BarChart>
			</ResponsiveContainer>
		</Panel>
	);
}
