import type { LabelCount } from "./api";
import { fmtInt } from "./format";
import { Card, CardGrid, Panel, Skeleton } from "./ui";
import * as css from "./widgets.css";

// Recharts-backed components (MonthlyChart, HourBars, WeekBars, YearLineChart,
// Donut, YearChart) live in ./charts so recharts stays out of this module and
// the eager bundle. This file holds only DOM/Skeleton widgets.

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
