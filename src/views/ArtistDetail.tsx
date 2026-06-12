import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { type AlbumRow, api, type TrackRow } from "../api";
import { fmtDate, fmtHours, fmtInt, fmtPct } from "../format";
import { BackLink, TrackLink } from "../links";
import {
	type Column,
	DataTable,
	DetailHead,
	Muted,
	Panel,
	Status,
} from "../ui";
import { Cards, MonthlyChart } from "../widgets";

const ALBUM_COLUMNS: Column<AlbumRow>[] = [
	{ key: "album", header: "album", cell: (a) => a.album },
	{
		key: "plays",
		header: "plays",
		align: "right",
		cell: (a) => fmtInt(a.plays),
	},
	{
		key: "hours",
		header: "hours",
		align: "right",
		cell: (a) => fmtHours(a.hours),
	},
];

const TRACK_COLUMNS: Column<TrackRow>[] = [
	{
		key: "rank",
		header: "#",
		width: "2rem",
		muted: true,
		cell: (_, i) => i + 1,
	},
	{
		key: "track",
		header: "track",
		cell: (t) => <TrackLink uri={t.track_uri} name={t.name} />,
	},
	{
		key: "plays",
		header: "plays",
		align: "right",
		cell: (t) => fmtInt(t.plays),
	},
	{
		key: "hours",
		header: "hours",
		align: "right",
		cell: (t) => fmtHours(t.hours),
	},
	{
		key: "skip",
		header: "skip",
		align: "right",
		muted: true,
		cell: (t) => fmtPct(t.skip_ratio),
	},
	{
		key: "last",
		header: "last",
		align: "right",
		muted: true,
		cell: (t) => fmtDate(t.last_play),
	},
];

export default function ArtistDetail({ name }: { name: string }) {
	const detail = useQuery({
		queryKey: ["artist", name],
		queryFn: () => api.artist(name),
	});
	const tracks = useQuery({
		queryKey: ["artistTracks", name],
		queryFn: () => api.artistTracks(name),
	});

	// "Deep cuts vs hits": share of plays concentrated in the top 3 tracks.
	const top3Share = useMemo(() => {
		const rows = tracks.data;
		if (!rows || rows.length === 0) return null;
		const total = rows.reduce((s, t) => s + t.plays, 0);
		if (!total) return null;
		const top3 = rows.slice(0, 3).reduce((s, t) => s + t.plays, 0);
		return top3 / total;
	}, [tracks.data]);

	if (!detail.data) return <Status error={detail.error} />;
	const d = detail.data;

	const cards = [
		{ label: "plays", value: fmtInt(d.plays) },
		{ label: "hours", value: fmtHours(d.hours) },
		{ label: "tracks", value: fmtInt(d.tracks) },
		{ label: "skip rate", value: fmtPct(d.skip_ratio) },
		{
			label: "rank",
			value: d.rank_plays ? `#${fmtInt(d.rank_plays)}` : "—",
			sub: "by plays, lifetime",
		},
		{
			label: "first heard",
			value: fmtDate(d.first_play),
			sub: `latest ${fmtDate(d.last_play)}`,
		},
	];

	return (
		<>
			<DetailHead
				back={<BackLink />}
				title={d.artist}
				sub={
					top3Share !== null && (
						<Muted>
							top 3 tracks = {fmtPct(top3Share)} of plays —{" "}
							{top3Share > 0.6
								? "you live on the hits"
								: "you work the whole catalogue"}
						</Muted>
					)
				}
			/>

			<Cards items={cards} />

			<Panel title="Hours per month">
				<MonthlyChart data={d.monthly} metric="hours" area />
			</Panel>

			{d.albums.length > 0 && (
				<Panel title="Top albums by hours">
					<DataTable
						rows={d.albums}
						columns={ALBUM_COLUMNS}
						rowKey={(a) => a.album}
					/>
				</Panel>
			)}

			<Panel
				title={
					<>All tracks {tracks.data && `(${fmtInt(tracks.data.length)})`}</>
				}
			>
				{!tracks.data ? (
					<Status error={tracks.error} />
				) : (
					<DataTable
						rows={tracks.data}
						columns={TRACK_COLUMNS}
						rowKey={(t) => t.track_uri}
					/>
				)}
			</Panel>
		</>
	);
}
