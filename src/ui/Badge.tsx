import type { ReactNode } from "react";
import * as css from "./Badge.css";

export type Tone = "up" | "down" | "flat" | "new";

export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
	return <span className={css.tone[tone]}>{children}</span>;
}

// Rank movement between two periods. A missing previous rank reads as a new
// entry; a missing current rank means it dropped out of the window.
export function Delta({
	rank,
	prevRank,
}: {
	rank: number | null;
	prevRank: number | null;
}) {
	if (prevRank == null) return <Badge tone="new">NEW</Badge>;
	if (rank == null) return <Badge tone="down">DROP</Badge>;
	const change = prevRank - rank;
	if (change === 0) return <Badge tone="flat">–</Badge>;
	if (change > 0) return <Badge tone="up">▲{change}</Badge>;
	return <Badge tone="down">▼{-change}</Badge>;
}
