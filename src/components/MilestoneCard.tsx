import { useQuery } from "@tanstack/react-query";
import { fmtInt } from "../format";
import type { TKey } from "../i18n";
import { useT } from "../i18n";
import { q } from "../queries";
import { Panel, Skeleton } from "../ui";
import * as css from "./summaryCards.css";

// The next "nice" round number strictly above v, stepping 1 → 2 → 5 → 10 within
// each power of ten. Gives a goalpost that's always within reach but never
// already passed.
function nextMilestone(v: number): number {
	if (v < 1) return 1;
	const base = 10 ** Math.floor(Math.log10(v));
	for (const m of [1, 2, 5]) {
		if (m * base > v) return m * base;
	}
	return 10 * base;
}

// Lifetime goalposts: how close each headline total is to its next round
// number. Pure client-side off the summary head — no extra query. Each bar fills
// toward the goal so the page reads as progress, not just a static count.
export default function MilestoneCard() {
	const t = useT();
	const { data, isLoading } = useQuery(q.summary());
	if (isLoading) return <MilestoneSkeleton />;
	if (!data) return null;

	const goals: { label: TKey; value: number }[] = [
		{ label: "card.plays", value: data.plays },
		{ label: "card.hours", value: Math.round(data.hours) },
		{ label: "card.artists", value: data.artists },
		{ label: "card.tracks", value: data.tracks },
	];

	return (
		<Panel title={t("milestone.title")}>
			<div className={css.rows}>
				{goals.map((g) => {
					const next = nextMilestone(g.value);
					const pct = Math.min(100, (g.value / next) * 100);
					return (
						<div className={css.row} key={g.label}>
							<span className={css.rowLabel}>{t(g.label)}</span>
							<span className={css.bar}>
								<span className={css.fill} style={{ width: `${pct}%` }} />
							</span>
							<span className={css.rowVal}>
								{fmtInt(g.value)} / {fmtInt(next)}
							</span>
						</div>
					);
				})}
			</div>
		</Panel>
	);
}

const SKELETON_ROWS = ["m1", "m2", "m3", "m4"];

function MilestoneSkeleton() {
	const t = useT();
	return (
		<Panel title={t("milestone.title")}>
			<div className={css.rows} aria-busy="true">
				{SKELETON_ROWS.map((k) => (
					<div className={css.row} key={k}>
						<Skeleton width={52} height={10} />
						<Skeleton height={8} radius={4} />
						<Skeleton width={64} height={10} style={{ marginLeft: "auto" }} />
					</div>
				))}
			</div>
		</Panel>
	);
}
