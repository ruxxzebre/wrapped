import { useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { useMemo } from "react";
import type { AlbumRow, TrackRow } from "../api";
import { HourBars, MonthlyChart, WeekBars } from "../charts";
import { fmtDate, fmtHours, fmtInt, fmtMonth, fmtPct } from "../format";
import { type TFunction, useT } from "../i18n";
import {
	AlbumLink,
	BackLink,
	TrackLink,
	usePrefetchTrackDetails,
} from "../links";
import { q } from "../queries";
import {
	type Column,
	DataTable,
	DetailHead,
	Grid2,
	Muted,
	Panel,
	Status,
	SubLine,
	WhenVisible,
} from "../ui";
import { Cards, ChartSkeleton } from "../widgets";

const albumColumns = (t: TFunction, artist: string): Column<AlbumRow>[] => [
	{
		key: "album",
		header: t("col.album"),
		cell: (a) => <AlbumLink album={a.album} artist={artist} />,
	},
	{
		key: "plays",
		header: t("col.plays"),
		align: "right",
		cell: (a) => fmtInt(a.plays),
	},
	{
		key: "hours",
		header: t("col.hours"),
		align: "right",
		cell: (a) => fmtHours(a.hours),
	},
];

const trackColumns = (t: TFunction): Column<TrackRow>[] => [
	{
		key: "rank",
		header: t("col.rank"),
		width: "2rem",
		muted: true,
		cell: (_, i) => i + 1,
	},
	{
		key: "track",
		header: t("col.track"),
		cell: (row) => <TrackLink uri={row.track_uri} name={row.name} />,
	},
	{
		key: "plays",
		header: t("col.plays"),
		align: "right",
		cell: (row) => fmtInt(row.plays),
	},
	{
		key: "hours",
		header: t("col.hours"),
		align: "right",
		cell: (row) => fmtHours(row.hours),
	},
	{
		key: "skip",
		header: t("col.skip"),
		align: "right",
		muted: true,
		cell: (row) => fmtPct(row.skip_ratio),
	},
	{
		key: "last",
		header: t("col.last"),
		align: "right",
		muted: true,
		cell: (row) => fmtDate(row.last_play),
	},
];

const route = getRouteApi("/artist/$name");

export default function ArtistDetail() {
	const t = useT();
	const { name } = route.useParams();
	const detail = useQuery(q.artist(name));
	const tracks = useQuery(q.artistTracks(name));

	// Batch-warm the full detail for this artist's track list (all linkable below).
	usePrefetchTrackDetails(tracks.data?.map((row) => row.track_uri) ?? []);

	// "Deep cuts vs hits": share of plays concentrated in the top 3 tracks.
	const top3Share = useMemo(() => {
		const rows = tracks.data;
		if (!rows || rows.length === 0) return null;
		const total = rows.reduce((s, t) => s + t.plays, 0);
		if (!total) return null;
		const top3 = rows.slice(0, 3).reduce((s, t) => s + t.plays, 0);
		return top3 / total;
	}, [tracks.data]);

	// Peak obsession month + loyalty span, derived from the monthly timeline.
	const stats = useMemo(() => {
		const rows = detail.data?.monthly;
		if (!rows || rows.length === 0) return null;
		const peak = rows.reduce((a, b) => (b.plays > a.plays ? b : a));
		const years = new Set(rows.map((m) => m.month.slice(0, 4)));
		return { peak, activeMonths: rows.length, years: years.size };
	}, [detail.data]);

	// Gateway: the very first track of theirs you ever played.
	const gateway = useMemo(() => {
		const rows = tracks.data;
		if (!rows || rows.length === 0) return null;
		return rows.reduce((a, b) => (b.first_play < a.first_play ? b : a));
	}, [tracks.data]);

	if (!detail.data) return <Status error={detail.error} />;
	const d = detail.data;

	const cards = [
		{ label: t("card.plays"), value: fmtInt(d.plays) },
		{ label: t("card.hours"), value: fmtHours(d.hours) },
		{ label: t("card.tracks"), value: fmtInt(d.tracks) },
		{
			label: t("detail.skipRate"),
			value: fmtPct(d.skip_ratio),
			sub: t("artist.skipVsBaseline", { pct: fmtPct(d.skip_ratio_all) }),
		},
		{
			label: t("detail.rank"),
			value: d.rank_plays ? `#${fmtInt(d.rank_plays)}` : t("common.dash"),
			sub: t("detail.byPlaysLifetime"),
		},
		{
			label: t("detail.firstHeard"),
			value: fmtDate(d.first_play),
			sub: t("summary.latest", { date: fmtDate(d.last_play) }),
		},
		...(stats
			? [
					{
						label: t("artist.peak"),
						value: fmtMonth(stats.peak.month),
						sub: t("artist.peakSub", { plays: fmtInt(stats.peak.plays) }),
					},
					{
						label: t("artist.loyalty"),
						value: t("artist.loyaltyYears", { years: stats.years }),
						sub: t("artist.loyaltySub", { months: stats.activeMonths }),
					},
				]
			: []),
	];

	return (
		<>
			<DetailHead
				back={<BackLink />}
				title={d.artist}
				sub={
					<>
						{top3Share !== null && (
							<SubLine>
								<Muted>
									{t("artist.top3", {
										pct: fmtPct(top3Share),
										verdict:
											top3Share > 0.6
												? t("artist.liveOnHits")
												: t("artist.wholeCatalogue"),
									})}
								</Muted>
							</SubLine>
						)}
						{gateway && (
							<SubLine>
								<Muted>
									{t("artist.gateway")}{" "}
									<TrackLink uri={gateway.track_uri} name={gateway.name} /> ·{" "}
									{fmtDate(gateway.first_play)}
								</Muted>
							</SubLine>
						)}
					</>
				}
			/>

			<Cards items={cards} />

			<Panel title={t("artist.hoursPerMonth")}>
				<WhenVisible fallback={<ChartSkeleton height={240} />}>
					<MonthlyChart data={d.monthly} metric="hours" area />
				</WhenVisible>
			</Panel>

			<Grid2>
				<Panel title={t("artist.whenYouPlay")}>
					<WhenVisible fallback={<ChartSkeleton height={200} />}>
						<HourBars data={d.hourly} />
					</WhenVisible>
				</Panel>
				<Panel title={t("artist.byWeekday")}>
					<WhenVisible fallback={<ChartSkeleton height={200} />}>
						<WeekBars data={d.weekly} />
					</WhenVisible>
				</Panel>
			</Grid2>

			{d.albums.length > 0 && (
				<Panel title={t("artist.topAlbums")}>
					<DataTable
						rows={d.albums}
						columns={albumColumns(t, d.artist)}
						rowKey={(a) => a.album}
					/>
				</Panel>
			)}

			<Panel
				title={
					tracks.data
						? t("artist.allTracksCount", { count: fmtInt(tracks.data.length) })
						: t("artist.allTracks")
				}
			>
				{!tracks.data ? (
					<Status error={tracks.error} />
				) : (
					<DataTable
						rows={tracks.data}
						columns={trackColumns(t)}
						rowKey={(row) => row.track_uri}
					/>
				)}
			</Panel>
		</>
	);
}
