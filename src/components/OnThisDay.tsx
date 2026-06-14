import { useQuery } from "@tanstack/react-query";
import { fmtInt } from "../format";
import { useT } from "../i18n";
import { ArtistLink, TrackLink } from "../links";
import { q } from "../queries";
import { Muted, Panel, Skeleton } from "../ui";
import * as css from "./OnThisDay.css";

// "This day in your history" — top track of the same week in each past year.
export default function OnThisDay() {
	const t = useT();
	const { data, isLoading } = useQuery(q.onThisDay());
	// Show the placeholder only while the query is in flight; once it resolves
	// empty there's genuinely nothing for this section, so render nothing.
	if (isLoading) return <OnThisDaySkeleton />;
	if (!data || data.length === 0) return null;

	const thisYear = new Date().getFullYear();
	return (
		<Panel title={t("onThisDay.title")}>
			<div className={css.list}>
				{data.map((o) => {
					const ago = thisYear - o.year;
					return (
						<div className={css.row} key={o.year}>
							<span className={css.when}>
								{ago <= 0
									? t("onThisDay.thisWeek")
									: t("onThisDay.yearsAgo", { count: ago })}
							</span>
							<span className={css.track}>
								<TrackLink uri={o.track_uri} name={o.name} />
								<Muted> · </Muted>
								<ArtistLink name={o.artist} muted />
							</span>
							<span className={css.plays}>
								{t("count.plays", { count: o.plays, n: fmtInt(o.plays) })}
							</span>
						</div>
					);
				})}
			</div>
		</Panel>
	);
}

// Stable keys for the placeholder rows (skeletons never reorder).
const SKELETON_ROWS = ["s1", "s2", "s3", "s4"];

// Mirrors the loaded layout (Panel + 70px / 1fr / auto grid rows) so swapping in
// real data doesn't move anything on the page.
function OnThisDaySkeleton() {
	const t = useT();
	return (
		<Panel title={t("onThisDay.title")}>
			<div className={css.list} aria-busy="true">
				{SKELETON_ROWS.map((k) => (
					<div className={css.row} key={k}>
						<Skeleton width={44} height={10} />
						<Skeleton width="55%" height={12} />
						<Skeleton width={52} height={10} style={{ marginLeft: "auto" }} />
					</div>
				))}
			</div>
		</Panel>
	);
}
