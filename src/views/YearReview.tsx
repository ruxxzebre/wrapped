import { useQuery } from "@tanstack/react-query";
import { getRouteApi, Link } from "@tanstack/react-router";
import type { YearArtistDelta, YearTrackDelta } from "../api";
import { fmtDate, fmtHours, fmtInt, fmtPct } from "../format";
import { type TFunction, useT } from "../i18n";
import { ArtistLink, BackLink, TrackLink } from "../links";
import * as linkCss from "../links.css";
import { q } from "../queries";
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

const trackColumns = (t: TFunction): Column<YearTrackDelta>[] => [
	{
		key: "rank",
		header: t("col.rank"),
		width: "2rem",
		muted: true,
		cell: (row) => row.rank,
	},
	{
		key: "track",
		header: t("col.track"),
		cell: (row) => (
			<>
				<TrackLink uri={row.track_uri} name={row.name} />
				<div>
					<Muted size="md">
						<ArtistLink name={row.artist} muted />
					</Muted>
				</div>
			</>
		),
	},
	{
		key: "plays",
		header: t("col.plays"),
		align: "right",
		cell: (row) => fmtInt(row.plays),
	},
	{
		key: "delta",
		header: t("col.move"),
		align: "right",
		cell: (row) => <Delta rank={row.rank} prevRank={row.prev_rank} />,
	},
];

const artistColumns = (t: TFunction): Column<YearArtistDelta>[] => [
	{
		key: "rank",
		header: t("col.rank"),
		width: "2rem",
		muted: true,
		cell: (a) => a.rank,
	},
	{
		key: "artist",
		header: t("col.artist"),
		cell: (a) => <ArtistLink name={a.artist} />,
	},
	{
		key: "plays",
		header: t("col.plays"),
		align: "right",
		cell: (a) => fmtInt(a.plays),
	},
	{
		key: "delta",
		header: t("col.move"),
		align: "right",
		cell: (a) => <Delta rank={a.rank} prevRank={a.prev_rank} />,
	},
];

const route = getRouteApi("/year/$year");

export default function YearReview() {
	const t = useT();
	const year = Number(route.useParams().year);
	const { data: summary } = useQuery(q.summary());
	const years = (summary?.years ?? []).map((y) => y.year).sort((a, b) => a - b);
	const prev = years.filter((y) => y < year).at(-1);
	const next = years.find((y) => y > year);

	const { data, error } = useQuery(q.year(year));
	if (!data) return <Status error={error} />;

	const cards = [
		{
			label: t("card.hours"),
			value: fmtHours(data.hours),
			sub: t("count.days", {
				count: Math.round(data.hours / 24),
				n: fmtInt(Math.round(data.hours / 24)),
			}),
		},
		{
			label: t("card.plays"),
			value: fmtInt(data.plays),
			sub: t("year.streamsSub", { count: fmtInt(data.streams) }),
		},
		{ label: t("card.tracks"), value: fmtInt(data.tracks) },
		{ label: t("card.artists"), value: fmtInt(data.artists) },
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
					<DetailTitle>{t("year.inReview", { year })}</DetailTitle>
					{next ? <YearLink year={next} dir="next" /> : <span />}
				</Row>
			</div>

			<Cards items={cards} />

			<Grid2>
				<Panel title={t("year.topTracks")}>
					<DataTable
						rows={data.top_tracks}
						columns={trackColumns(t)}
						rowKey={(row) => row.track_uri}
						showHeader={false}
					/>
				</Panel>

				<Panel title={t("year.topArtists")}>
					<DataTable
						rows={data.top_artists}
						columns={artistColumns(t)}
						rowKey={(a) => a.artist}
						showHeader={false}
					/>
				</Panel>
			</Grid2>

			<CardGrid>
				{data.busiest_day && (
					<Card
						valueSize="md"
						label={t("year.busiestDay")}
						value={fmtDate(data.busiest_day.date)}
						sub={t("year.busiestSub", {
							hours: fmtHours(data.busiest_day.hours),
							plays: fmtInt(data.busiest_day.plays),
						})}
					/>
				)}
				{data.streak && (
					<Card
						valueSize="md"
						label={t("year.longestStreak")}
						value={t("count.days", {
							count: data.streak.days,
							n: fmtInt(data.streak.days),
						})}
						sub={t("year.streakSub", {
							from: fmtDate(data.streak.from),
							to: fmtDate(data.streak.to),
						})}
					/>
				)}
				{data.discovery && (
					<Card
						valueSize="md"
						label={t("year.biggestDiscovery")}
						value={data.discovery.artist}
						sub={t("year.discoverySub", {
							hours: fmtHours(data.discovery.hours),
						})}
					/>
				)}
				{data.skip_champion && (
					<Card
						valueSize="md"
						label={t("year.skipChampion")}
						value={data.skip_champion.name}
						sub={t("year.skipChampionSub", {
							pct: fmtPct(data.skip_champion.skip_ratio),
							plays: fmtInt(data.skip_champion.plays),
						})}
					/>
				)}
			</CardGrid>
		</>
	);
}

function YearLink({ year, dir }: { year: number; dir: "prev" | "next" }) {
	return (
		<Link
			to="/year/$year"
			params={{ year: String(year) }}
			preload="viewport"
			className={linkCss.entity}
		>
			{dir === "prev" ? `← ${year}` : `${year} →`}
		</Link>
	);
}
