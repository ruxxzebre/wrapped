import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { fmtDate, fmtHours, fmtInt } from "../format";
import { useT } from "../i18n";
import { ArtistLink, TrackLink } from "../links";
import { q } from "../queries";
import { Card, CardGrid, Panel } from "../ui";
import { CardsSkeleton } from "../widgets";

// The hall of records: scattered superlatives gathered into one "personal bests"
// grid, each a card you can revisit and try to beat. `records()` carries the
// per-day / per-track bests; the streak record and biggest discovery year come
// free from the streak()/discovery() queries the page already runs, so each is
// shown only once its source resolves.
export default function RecordsBoard() {
	const t = useT();
	const { data: rec, isLoading } = useQuery(q.records());
	const { data: streak } = useQuery(q.streak());
	const { data: disc } = useQuery(q.discovery());
	if (isLoading) {
		return (
			<Panel title={t("records.title")}>
				<CardsSkeleton count={5} />
			</Panel>
		);
	}
	if (!rec) return null;

	const cells: { key: string; label: string; value: string; sub: ReactNode }[] =
		[
			{
				key: "day",
				label: t("records.biggestDay"),
				value: t("records.hours", { n: fmtHours(rec.day_hours) }),
				sub: fmtDate(rec.day_date),
			},
			{
				key: "obs",
				label: t("records.onRepeat"),
				value: t("records.times", { n: fmtInt(rec.obs_plays) }),
				sub: trackSub(rec.obs_uri, rec.obs_name, rec.obs_artist),
			},
			{
				key: "loop",
				label: t("records.longestLoop"),
				value: fmtInt(rec.loop_run),
				sub: trackSub(rec.loop_uri, rec.loop_name, rec.loop_artist),
			},
		];

	if (streak) {
		cells.splice(2, 0, {
			key: "streak",
			label: t("records.longestStreak"),
			value: fmtInt(streak.longest),
			sub: t("records.daysInARow"),
		});
	}
	if (disc) {
		cells.push({
			key: "disc",
			label: t("records.discoveryYear"),
			value: fmtInt(disc.best_count),
			sub: t("records.artistsIn", { year: String(disc.best_year) }),
		});
	}

	return (
		<Panel title={t("records.title")}>
			<CardGrid>
				{cells.map((c) => (
					<Card key={c.key} label={c.label} value={c.value} sub={c.sub} />
				))}
			</CardGrid>
		</Panel>
	);
}

// A track-with-artist sub-line: links when we have a uri, plain text otherwise.
function trackSub(uri: string, name: string, artist: string): ReactNode {
	return (
		<>
			{uri ? <TrackLink uri={uri} name={name} /> : name}
			{" · "}
			<ArtistLink name={artist} muted />
		</>
	);
}
