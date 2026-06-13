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
import { Card, CardGrid, chartColors, Panel, Skeleton } from "./ui";
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

// Stable keys for the fixed-size placeholder collections below. Skeletons never
// reorder, so a constant key list keeps React happy without an array index.
const CARD_KEYS = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"];

// Placeholder for a Cards row. Reuses the real Card so padding, radius and grid
// sizing match exactly — only the text is swapped for shimmer blocks.
export function CardsSkeleton({ count = 6 }: { count?: number }) {
	return (
		<CardGrid>
			{CARD_KEYS.slice(0, count).map((k) => (
				<Card
					key={k}
					label={<Skeleton width={52} height={9} />}
					value={<Skeleton width="70%" height={20} />}
				/>
			))}
		</CardGrid>
	);
}

// Relative bar heights for the faux chart; the keys double as React keys.
const CHART_BARS = [
	{ key: "g1", h: "55%" },
	{ key: "g2", h: "78%" },
	{ key: "g3", h: "40%" },
	{ key: "g4", h: "92%" },
	{ key: "g5", h: "63%" },
	{ key: "g6", h: "82%" },
	{ key: "g7", h: "48%" },
];

// Drop-in placeholder for any bar chart. Pass the same height the real
// ResponsiveContainer uses so the panel doesn't resize on load.
export function ChartSkeleton({ height = 240 }: { height?: number }) {
	return (
		<div className={css.chartSkeleton} style={{ height }} aria-busy="true">
			{CHART_BARS.map((b) => (
				<Skeleton key={b.key} height={b.h} radius={3} style={{ flex: 1 }} />
			))}
		</div>
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
