import { useQuery } from "@tanstack/react-query";
import { fmtInt } from "../format";
import { useT } from "../i18n";
import { q } from "../queries";
import { Badge, Panel, Skeleton } from "../ui";
import * as css from "./summaryCards.css";

// Discovery beat: how many artists (and tracks) you've met for the first time
// this data-year, paced against the same point last year. Forward-looking
// motivator — it rewards exploration rather than replaying the same favourites.
export default function DiscoveryCard() {
	const t = useT();
	const { data, isLoading } = useQuery(q.discovery());
	if (isLoading) return <DiscoverySkeleton />;
	if (!data) return null;

	const { year, this_artists, this_tracks, prev_artists } = data;
	const hasPrev = prev_artists > 0;
	const delta = this_artists - prev_artists;
	const ahead = delta >= 0;

	return (
		<Panel title={t("discovery.title", { year: String(year) })}>
			<div className={css.wrap}>
				<div className={css.headline}>
					<span className={css.big}>{fmtInt(this_artists)}</span>
					<span className={css.unit}>{t("discovery.artists")}</span>
				</div>

				<div className={css.note}>
					{t("discovery.tracks", { n: fmtInt(this_tracks) })}
				</div>

				{hasPrev && (
					<div className={css.note}>
						<Badge tone={ahead ? "up" : "down"}>
							{ahead ? "▲" : "▼"} {fmtInt(Math.abs(delta))}
						</Badge>
						<span>
							{t("discovery.vsLastYear", { n: fmtInt(prev_artists) })}
						</span>
					</div>
				)}
			</div>
		</Panel>
	);
}

function DiscoverySkeleton() {
	const t = useT();
	return (
		<Panel title={t("discovery.title", { year: "—" })}>
			<div className={css.wrap} aria-busy="true">
				<Skeleton width={90} height={34} />
				<Skeleton width="50%" height={14} />
				<Skeleton width="60%" height={14} />
			</div>
		</Panel>
	);
}
