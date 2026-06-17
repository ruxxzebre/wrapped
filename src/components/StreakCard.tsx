import { useQuery } from "@tanstack/react-query";
import { fmtDate, fmtInt } from "../format";
import { useT } from "../i18n";
import { q } from "../queries";
import { Panel, Skeleton } from "../ui";
import * as css from "./StreakCard.css";

// Gamified hero: the current run of consecutive listening days against the
// all-time record. When the current run *is* the record it celebrates; otherwise
// it shows the gap to beat plus a progress bar. "Current" is anchored on the
// data's last active day (the export is static), surfaced in the meta line so the
// streak never reads as broken just because the export is old.
export default function StreakCard() {
	const t = useT();
	const { data, isLoading } = useQuery(q.streak());
	if (isLoading) return <StreakSkeleton />;
	if (!data) return null;

	const { current, longest, last_active } = data;
	const isRecord = current >= longest;
	const remaining = longest - current;
	const pct = longest > 0 ? Math.min(100, (current / longest) * 100) : 0;

	return (
		<Panel title={t("streak.title")}>
			<div className={css.wrap}>
				<div className={css.headline}>
					<span className={css.flame} aria-hidden="true">
						🔥
					</span>
					<span className={css.big}>{fmtInt(current)}</span>
					<span className={css.unit}>
						{t("streak.daysUnit", { count: current })}
					</span>
				</div>

				{isRecord ? (
					<div className={css.record}>{t("streak.recordBadge")}</div>
				) : (
					<>
						<div className={css.note}>
							{t("streak.behindRecord", {
								count: remaining,
								n: fmtInt(remaining),
								best: fmtInt(longest),
							})}
						</div>
						<div className={css.bar}>
							<span className={css.fill} style={{ width: `${pct}%` }} />
						</div>
					</>
				)}

				<div className={css.meta}>
					{t("streak.asOf", { date: fmtDate(last_active) })}
				</div>
			</div>
		</Panel>
	);
}

function StreakSkeleton() {
	const t = useT();
	return (
		<Panel title={t("streak.title")}>
			<div className={css.wrap} aria-busy="true">
				<Skeleton width={120} height={42} />
				<Skeleton width="60%" height={14} />
				<Skeleton width={140} height={10} />
			</div>
		</Panel>
	);
}
