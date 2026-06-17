import { useQuery } from "@tanstack/react-query";
import { fmtHours, fmtInt } from "../format";
import { useT } from "../i18n";
import { q } from "../queries";
import { Badge, Panel, Skeleton } from "../ui";
import * as css from "./summaryCards.css";

// Year-pace beat: how far into the (data-)year you are vs the same day last
// year, plus a naive year-end projection. Anchored on the export's last play —
// "this year" is the year of that play and "to date" its day-of-year, so an old
// export never reads as a slump. Projection is suppressed early in the year when
// the extrapolation would be meaningless.
const PROJECT_MIN_DOY = 14;

export default function PaceCard() {
	const t = useT();
	const { data: pace, isLoading } = useQuery(q.pace());
	const { data: summary } = useQuery(q.summary());
	if (isLoading) return <PaceSkeleton />;
	if (!pace) return null;

	const { year, doy, this_hours, prev_hours } = pace;
	const hasPrev = prev_hours > 0;
	const deltaPct = hasPrev
		? Math.round(((this_hours - prev_hours) / prev_hours) * 100)
		: 0;
	const ahead = deltaPct >= 0;

	const projected = doy >= PROJECT_MIN_DOY ? (this_hours / doy) * 365 : null;
	const bestHours = summary
		? Math.max(0, ...summary.years.map((y) => y.hours))
		: 0;
	const beatsBest = projected != null && projected > bestHours;

	return (
		<Panel title={t("pace.title", { year: String(year) })}>
			<div className={css.wrap}>
				<div className={css.headline}>
					<span className={css.big}>{fmtHours(this_hours)}</span>
					<span className={css.unit}>{t("pace.hoursThisYear")}</span>
				</div>

				{hasPrev && (
					<div className={css.note}>
						<Badge tone={ahead ? "up" : "down"}>
							{ahead ? "▲" : "▼"} {Math.abs(deltaPct)}%
						</Badge>
						<span>{t("pace.vsLastYear", { hours: fmtHours(prev_hours) })}</span>
					</div>
				)}

				{projected != null && (
					<div className={css.note}>
						{t("pace.onPace", { hours: fmtHours(projected) })}
						{beatsBest && (
							<span className={css.accent}>{t("pace.biggestYear")}</span>
						)}
					</div>
				)}

				<div className={css.meta}>
					{t("pace.plays", { n: fmtInt(pace.this_plays) })}
				</div>
			</div>
		</Panel>
	);
}

function PaceSkeleton() {
	const t = useT();
	return (
		<Panel title={t("pace.title", { year: "—" })}>
			<div className={css.wrap} aria-busy="true">
				<Skeleton width={120} height={34} />
				<Skeleton width="55%" height={14} />
				<Skeleton width="65%" height={14} />
			</div>
		</Panel>
	);
}
