import { createContext, type ReactNode, useContext, useState } from "react";
import type { Period } from "../api";

// Shared period/from/to filter for the whole Insights group. Lives in the
// InsightsLayout (the parent route) so it stays mounted — and so its value
// persists — as the user switches between sub-tabs. Every insight sub-view reads
// the same period and feeds it to its queries. (Named `period`, not `window`, to
// avoid shadowing the DOM global.)
type Ctx = { period: Period; setPeriod: (p: Period) => void };

const InsightsPeriodCtx = createContext<Ctx | null>(null);

export function InsightsPeriodProvider({ children }: { children: ReactNode }) {
	const [period, setPeriod] = useState<Period>({});
	return (
		<InsightsPeriodCtx.Provider value={{ period, setPeriod }}>
			{children}
		</InsightsPeriodCtx.Provider>
	);
}

export function useInsightsPeriod(): Ctx {
	const ctx = useContext(InsightsPeriodCtx);
	if (!ctx)
		throw new Error("useInsightsPeriod must be used within InsightsLayout");
	return ctx;
}
