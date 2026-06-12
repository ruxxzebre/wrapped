import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { Bucket, LabelCount, MonthCount } from "./api";
import { fmtInt, fmtMonth } from "./format";
import { Card, CardGrid, chartColors, Panel } from "./ui";
import * as css from "./widgets.css";

export type CardItem = { label: string; value: string; sub?: string };

export function Cards({ items }: { items: CardItem[] }) {
	return (
		<CardGrid>
			{items.map((c) => (
				<Card key={c.label} label={c.label} value={c.value} sub={c.sub} />
			))}
		</CardGrid>
	);
}

// MonthlyChart plots a track/artist's play-history timeline. Months with no
// plays are simply absent (sparse) — fine for both bar and area shapes.
export function MonthlyChart({
	data,
	metric,
	area = false,
}: {
	data: MonthCount[];
	metric: "plays" | "hours";
	area?: boolean;
}) {
	const rows = data.map((m) => ({
		...m,
		label: fmtMonth(m.month),
		hours: Math.round(m.hours * 10) / 10,
	}));
	const color = metric === "plays" ? chartColors.info : chartColors.accent;
	// Cap label density so multi-year timelines stay readable.
	const interval = Math.max(0, Math.floor(rows.length / 14));

	return (
		<ResponsiveContainer width="100%" height={240}>
			{area ? (
				<AreaChart data={rows}>
					<CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
					<XAxis
						dataKey="label"
						stroke={chartColors.axis}
						interval={interval}
						fontSize={11}
					/>
					<YAxis stroke={chartColors.axis} />
					<Tooltip {...chartColors.tooltip} />
					<Area
						dataKey={metric}
						stroke={color}
						fill={color}
						fillOpacity={0.25}
					/>
				</AreaChart>
			) : (
				<BarChart data={rows}>
					<CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
					<XAxis
						dataKey="label"
						stroke={chartColors.axis}
						interval={interval}
						fontSize={11}
					/>
					<YAxis stroke={chartColors.axis} />
					<Tooltip {...chartColors.tooltip} />
					<Bar dataKey={metric} fill={color} radius={[3, 3, 0, 0]} />
				</BarChart>
			)}
		</ResponsiveContainer>
	);
}

export function HourBars({ data }: { data: Bucket[] }) {
	// Fill all 24 hours so empty hours read as gaps, not as compressed axes.
	const byHour = new Map(data.map((b) => [b.bucket, b.plays]));
	const rows = Array.from({ length: 24 }, (_, h) => ({
		label: String(h),
		plays: byHour.get(h) ?? 0,
	}));
	return (
		<ResponsiveContainer width="100%" height={200}>
			<BarChart data={rows}>
				<CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
				<XAxis
					dataKey="label"
					stroke={chartColors.axis}
					interval={1}
					fontSize={11}
				/>
				<YAxis stroke={chartColors.axis} />
				<Tooltip {...chartColors.tooltip} />
				<Bar dataKey="plays" fill={chartColors.accent} radius={[3, 3, 0, 0]} />
			</BarChart>
		</ResponsiveContainer>
	);
}

// Breakdown renders a labelled proportion bar list (platform split, start
// reasons, completion bands).
export function Breakdown({
	title,
	rows,
	fmtLabel = (l) => l,
}: {
	title: string;
	rows: LabelCount[];
	fmtLabel?: (label: string) => string;
}) {
	const total = rows.reduce((s, r) => s + r.plays, 0) || 1;
	return (
		<Panel title={title}>
			<div className={css.breakdown}>
				{rows.map((r) => {
					const label = fmtLabel(r.label);
					return (
						<div className={css.brow} key={r.label}>
							<span className={css.blabel} title={label}>
								{label}
							</span>
							<span className={css.bbar}>
								<span style={{ width: `${(r.plays / total) * 100}%` }} />
							</span>
							<span className={css.bval}>{fmtInt(r.plays)}</span>
						</div>
					);
				})}
			</div>
		</Panel>
	);
}
