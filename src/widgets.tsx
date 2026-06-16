import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Line,
	LineChart,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { Bucket, LabelCount, MonthCount } from "./api";
import { fmtInt, fmtMonth, fmtPct, weekdayShort } from "./format";
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
						isAnimationActive={false}
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
					<Bar
						dataKey={metric}
						fill={color}
						radius={[3, 3, 0, 0]}
						isAnimationActive={false}
					/>
				</BarChart>
			)}
		</ResponsiveContainer>
	);
}

export function HourBars({ data = [] }: { data?: Bucket[] }) {
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
				<Bar
					dataKey="plays"
					fill={chartColors.accent}
					radius={[3, 3, 0, 0]}
					isAnimationActive={false}
				/>
			</BarChart>
		</ResponsiveContainer>
	);
}

// WeekBars mirrors HourBars for day-of-week: isodow buckets 1..7 (Mon..Sun),
// every weekday filled so empty days read as gaps.
export function WeekBars({ data = [] }: { data?: Bucket[] }) {
	const byDow = new Map(data.map((b) => [b.bucket, b.plays]));
	const rows = Array.from({ length: 7 }, (_, i) => ({
		label: weekdayShort(i + 1),
		plays: byDow.get(i + 1) ?? 0,
	}));
	return (
		<ResponsiveContainer width="100%" height={200}>
			<BarChart data={rows}>
				<CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
				<XAxis dataKey="label" stroke={chartColors.axis} fontSize={11} />
				<YAxis stroke={chartColors.axis} />
				<Tooltip {...chartColors.tooltip} />
				<Bar
					dataKey="plays"
					fill={chartColors.accent}
					radius={[3, 3, 0, 0]}
					isAnimationActive={false}
				/>
			</BarChart>
		</ResponsiveContainer>
	);
}

// YearLineChart plots one value per year — used for the completion trend (a
// 0..1 fraction, percent=true) and the per-year chart position (rank, where
// reversed=true puts #1 at the top). Sparse years are simply absent.
export function YearLineChart({
	data,
	percent = false,
	reversed = false,
}: {
	data: { year: number; value: number }[];
	percent?: boolean;
	reversed?: boolean;
}) {
	const rows = data.map((d) => ({
		label: String(d.year),
		value: percent ? Math.round(d.value * 1000) / 10 : d.value,
	}));
	return (
		<ResponsiveContainer width="100%" height={200}>
			<LineChart data={rows}>
				<CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
				<XAxis dataKey="label" stroke={chartColors.axis} fontSize={11} />
				<YAxis
					stroke={chartColors.axis}
					reversed={reversed}
					domain={reversed ? [1, "dataMax"] : undefined}
					allowDecimals={!reversed}
					tickFormatter={percent ? (v) => `${v}%` : undefined}
				/>
				<Tooltip
					{...chartColors.tooltip}
					formatter={(value) => {
						const v = Number(value);
						return percent ? `${v}%` : reversed ? `#${v}` : `${v}`;
					}}
				/>
				<Line
					dataKey="value"
					stroke={chartColors.info}
					strokeWidth={2}
					dot={{ r: 3 }}
					isAnimationActive={false}
				/>
			</LineChart>
		</ResponsiveContainer>
	);
}

// Stable keys for the placeholder breakdown rows (see CARD_KEYS note).
const BROW_KEYS = ["r1", "r2", "r3", "r4", "r5", "r6"];

// Placeholder for a Breakdown panel. Reuses the same Panel + grid row layout so
// the labels, bar and value columns line up exactly with the real content,
// keeping the panel height stable when it swaps in.
export function BreakdownSkeleton({
	title,
	rows = 4,
}: {
	title: string;
	rows?: number;
}) {
	return (
		<Panel title={title}>
			<div className={css.breakdown} aria-busy="true">
				{BROW_KEYS.slice(0, rows).map((k) => (
					<div className={css.brow} key={k}>
						<Skeleton width="70%" height={11} />
						<Skeleton height={14} radius={4} />
						<Skeleton width={32} height={11} style={{ marginLeft: "auto" }} />
					</div>
				))}
			</div>
		</Panel>
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

// Donut renders a categorical split as a ring with a centred total and a
// dotted legend — the approachable replacement for the proportion bar list.
// `ordered` switches to the good→bad ramp for the completion bands.
export function Donut({
	title,
	rows,
	fmtLabel = (l) => l,
	ordered = false,
}: {
	title: string;
	rows: LabelCount[];
	fmtLabel?: (label: string) => string;
	ordered?: boolean;
}) {
	const total = rows.reduce((s, r) => s + r.plays, 0) || 1;
	const palette = ordered ? chartColors.ramp : chartColors.series;
	const data = rows.map((r, i) => ({
		label: fmtLabel(r.label),
		plays: r.plays,
		color: palette[i % palette.length],
	}));
	return (
		<Panel title={title}>
			<div className={css.donut}>
				<div className={css.donutChart}>
					<ResponsiveContainer width="100%" height={180}>
						<PieChart>
							<Pie
								data={data}
								dataKey="plays"
								nameKey="label"
								innerRadius={55}
								outerRadius={80}
								paddingAngle={data.length > 1 ? 2 : 0}
								stroke="none"
								isAnimationActive={false}
							>
								{data.map((d) => (
									<Cell key={d.label} fill={d.color} />
								))}
							</Pie>
							<Tooltip
								{...chartColors.tooltip}
								formatter={(v) => {
									const n = Number(v);
									return [`${fmtInt(n)} · ${fmtPct(n / total)}`, ""];
								}}
							/>
						</PieChart>
					</ResponsiveContainer>
					<span className={css.donutTotal}>{fmtInt(total)}</span>
				</div>
				<ul className={css.legend}>
					{data.map((d) => (
						<li className={css.legendItem} key={d.label}>
							<span className={css.legendDot} style={{ background: d.color }} />
							<span className={css.legendLabel} title={d.label}>
								{d.label}
							</span>
							<span className={css.legendVal}>{fmtPct(d.plays / total)}</span>
						</li>
					))}
				</ul>
			</div>
		</Panel>
	);
}
