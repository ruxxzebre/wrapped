import { useQuery } from "@tanstack/react-query";
import { api, type YearArtistDelta, type YearTrackDelta } from "../api";
import { fmtDate, fmtHours, fmtInt, fmtPct } from "../format";
import { ArtistLink, BackLink, TrackLink } from "../links";
import * as linkCss from "../links.css";
import { Link, yearPath } from "../router";
import {
	Card,
	CardGrid,
	type Column,
	DataTable,
	Delta,
	DetailTitle,
	Grid2,
	Muted,
	Panel,
	Row,
	Status,
} from "../ui";
import * as headCss from "../ui/DetailHead.css";
import { Cards } from "../widgets";

const TRACK_COLUMNS: Column<YearTrackDelta>[] = [
	{ key: "rank", header: "#", width: "2rem", muted: true, cell: (t) => t.rank },
	{
		key: "track",
		header: "track",
		cell: (t) => (
			<>
				<TrackLink uri={t.track_uri} name={t.name} />
				<div>
					<Muted size="md">
						<ArtistLink name={t.artist} muted />
					</Muted>
				</div>
			</>
		),
	},
	{
		key: "plays",
		header: "plays",
		align: "right",
		cell: (t) => fmtInt(t.plays),
	},
	{
		key: "delta",
		header: "move",
		align: "right",
		cell: (t) => <Delta rank={t.rank} prevRank={t.prev_rank} />,
	},
];

const ARTIST_COLUMNS: Column<YearArtistDelta>[] = [
	{ key: "rank", header: "#", width: "2rem", muted: true, cell: (a) => a.rank },
	{
		key: "artist",
		header: "artist",
		cell: (a) => <ArtistLink name={a.artist} />,
	},
	{
		key: "plays",
		header: "plays",
		align: "right",
		cell: (a) => fmtInt(a.plays),
	},
	{
		key: "delta",
		header: "move",
		align: "right",
		cell: (a) => <Delta rank={a.rank} prevRank={a.prev_rank} />,
	},
];

export default function YearReview({ year }: { year: number }) {
	const { data: summary } = useQuery({
		queryKey: ["summary"],
		queryFn: api.summary,
	});
	const years = (summary?.years ?? []).map((y) => y.year).sort((a, b) => a - b);
	const prev = years.filter((y) => y < year).at(-1);
	const next = years.find((y) => y > year);

	const { data, error } = useQuery({
		queryKey: ["year", year],
		queryFn: () => api.year(year),
	});
	if (!data) return <Status error={error} />;

	const cards = [
		{
			label: "hours",
			value: fmtHours(data.hours),
			sub: `${(data.hours / 24).toFixed(0)} days`,
		},
		{
			label: "plays",
			value: fmtInt(data.plays),
			sub: `${fmtInt(data.streams)} ≥30s`,
		},
		{ label: "tracks", value: fmtInt(data.tracks) },
		{ label: "artists", value: fmtInt(data.artists) },
	];

	return (
		<>
			<div className={headCss.head}>
				<div className={headCss.back}>
					<BackLink />
				</div>
				<Row
					align="center"
					gap="xl"
					style={{ justifyContent: "space-between" }}
				>
					{prev ? <YearLink year={prev} dir="prev" /> : <span />}
					<DetailTitle>{year} in review</DetailTitle>
					{next ? <YearLink year={next} dir="next" /> : <span />}
				</Row>
			</div>

			<Cards items={cards} />

			<Grid2>
				<Panel title="Top tracks">
					<DataTable
						rows={data.top_tracks}
						columns={TRACK_COLUMNS}
						rowKey={(t) => t.track_uri}
						showHeader={false}
					/>
				</Panel>

				<Panel title="Top artists">
					<DataTable
						rows={data.top_artists}
						columns={ARTIST_COLUMNS}
						rowKey={(a) => a.artist}
						showHeader={false}
					/>
				</Panel>
			</Grid2>

			<CardGrid>
				{data.busiest_day && (
					<Card
						valueSize="md"
						label="busiest day"
						value={fmtDate(data.busiest_day.date)}
						sub={`${fmtHours(data.busiest_day.hours)} h · ${fmtInt(data.busiest_day.plays)} plays`}
					/>
				)}
				{data.streak && (
					<Card
						valueSize="md"
						label="longest streak"
						value={`${data.streak.days} days`}
						sub={`${fmtDate(data.streak.from)} → ${fmtDate(data.streak.to)}`}
					/>
				)}
				{data.discovery && (
					<Card
						valueSize="md"
						label="biggest discovery"
						value={data.discovery.artist}
						sub={`${fmtHours(data.discovery.hours)} h, first heard this year`}
					/>
				)}
				{data.skip_champion && (
					<Card
						valueSize="md"
						label="skip champion"
						value={data.skip_champion.name}
						sub={`${fmtPct(data.skip_champion.skip_ratio)} skipped over ${fmtInt(data.skip_champion.plays)} plays`}
					/>
				)}
			</CardGrid>
		</>
	);
}

function YearLink({ year, dir }: { year: number; dir: "prev" | "next" }) {
	return (
		<Link to={yearPath(year)} className={linkCss.entity}>
			{dir === "prev" ? `← ${year}` : `${year} →`}
		</Link>
	);
}
