import { useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import type { Neighbor } from "../api";
import {
	fmtDate,
	fmtDuration,
	fmtHours,
	fmtInt,
	fmtPct,
	monthLabel,
} from "../format";
import { fillNodes, tEnum, useT } from "../i18n";
import {
	ArtistLink,
	BackLink,
	SpotifyEmbed,
	SpotifyLink,
	TrackLink,
} from "../links";
import { q } from "../queries";
import {
	type Column,
	DataTable,
	DetailHead,
	Grid2,
	Muted,
	Panel,
	Stack,
	Status,
} from "../ui";
import {
	Breakdown,
	Cards,
	HourBars,
	MonthlyChart,
	WeekBars,
	YearLineChart,
} from "../widgets";

const route = getRouteApi("/track/$uri");

export default function TrackDetail() {
	const t = useT();
	const { uri } = route.useParams();
	const { data, error } = useQuery(q.track(uri));
	if (!data) return <Status error={error} />;

	// Skip rate next to the library baseline — a raw percentage means little
	// without it (§D).
	const skipMultiple =
		data.skip_ratio_all > 0
			? (data.skip_ratio / data.skip_ratio_all).toFixed(1)
			: null;

	const cards = [
		{ label: t("card.plays"), value: fmtInt(data.plays) },
		{ label: t("card.hours"), value: fmtHours(data.hours) },
		{
			label: t("detail.skipRate"),
			value: fmtPct(data.skip_ratio),
			sub: skipMultiple
				? t("detail.vsAverage", { x: skipMultiple })
				: undefined,
		},
		{
			label: t("detail.length"),
			value: data.max_ms ? fmtDuration(data.max_ms) : t("common.dash"),
			sub: t("detail.longestPlay"),
		},
		{
			label: t("detail.rank"),
			value: data.rank_plays ? `#${fmtInt(data.rank_plays)}` : t("common.dash"),
			sub: t("detail.byPlaysLifetime"),
		},
		{
			label: t("detail.firstHeard"),
			value: fmtDate(data.first_play),
			sub: t("summary.latest", { date: fmtDate(data.last_play) }),
		},
	];

	// A second row of derived "goodies" — each card omitted when it has nothing
	// to say (§E, §F, §G, §J).
	const finished = data.completion.find((c) => c.label === "finished")?.plays;
	const fullListens =
		data.max_ms > 0 ? Math.round((data.hours * 3600000) / data.max_ms) : null;
	const daysSinceLast = data.last_play
		? Math.floor((Date.now() - Date.parse(data.last_play)) / 86400000)
		: null;
	const seasonShow =
		data.season && data.season.years >= 2 && data.season.concentration >= 0.55;

	const extras = [];
	if (seasonShow && data.season) {
		extras.push({
			label: t("track.season"),
			value: monthLabel(data.season.peak_month),
			sub: fmtPct(data.season.concentration),
		});
	}
	extras.push({
		label: t("track.shuffleShare"),
		value: fmtPct(data.shuffle_ratio),
		sub: t("track.shuffleSub"),
	});
	if (fullListens != null) {
		extras.push({
			label: t("track.fullListens"),
			value: fmtInt(fullListens),
			sub: t("track.fullListensSub"),
		});
	}
	if (finished != null) {
		extras.push({
			label: t("track.timesFinished"),
			value: fmtInt(finished),
			sub: t("track.timesFinishedSub"),
		});
	}
	if (daysSinceLast != null) {
		extras.push({
			label: t("track.lastPlayed"),
			value: t("track.daysAgo", { n: fmtInt(daysSinceLast) }),
			sub: fmtDate(data.last_play),
		});
	}
	if (data.loop) {
		extras.push({
			label: t("track.onRepeat"),
			value: t("insights.loops.run", { n: data.loop.longest_run }),
			sub: data.loop.date,
		});
	}
	if (data.binge_days > 0) {
		extras.push({
			label: t("track.bingeDays"),
			value: fmtInt(data.binge_days),
			sub: t("track.bingeDaysSub"),
		});
	}
	if (data.milestone) {
		extras.push({
			label: t("track.milestone"),
			value: fmtDate(data.milestone.date),
			sub: t("count.plays", {
				count: data.milestone.n,
				n: fmtInt(data.milestone.n),
			}),
		});
	}

	const hasSegue =
		data.neighbors_before.length > 0 || data.neighbors_after.length > 0;
	const showSkipSplit =
		data.skip_shuffle != null && data.skip_intentional != null;

	return (
		<>
			<DetailHead
				back={<BackLink />}
				title={data.name}
				sub={
					<>
						<ArtistLink name={data.artist} /> · <Muted>{data.album}</Muted>
					</>
				}
				action={<SpotifyLink uri={uri} />}
			/>

			<Cards items={cards} />
			<Cards items={extras} />

			{showSkipSplit && (
				<Muted>
					{t("track.skipSplit", {
						shuffle: fmtPct(data.skip_shuffle ?? 0),
						intent: fmtPct(data.skip_intentional ?? 0),
					})}
				</Muted>
			)}

			<SpotifyEmbed uri={uri} />

			{data.origin && (
				<Panel title={t("track.originTitle")}>
					<Stack gap="sm">
						<span>
							{t("track.originLine", {
								weekday: data.origin.weekday,
								date: fmtDate(data.origin.date),
							})}
							{data.origin.prev_uri && (
								<>
									{" "}
									{fillNodes(
										t("track.originGateway", { gateway: "{gateway}" }),
										{
											gateway: (
												<TrackLink
													uri={data.origin.prev_uri}
													name={data.origin.prev_name}
												/>
											),
										},
									)}
								</>
							)}
						</span>
						<Muted size="sm">
							{data.origin.platform} ·{" "}
							{tEnum(t, "reasonStart", data.origin.reason_start)}
						</Muted>
					</Stack>
				</Panel>
			)}

			{hasSegue && (
				<Grid2>
					<SeguePanel
						title={t("track.comesBefore")}
						rows={data.neighbors_before}
					/>
					<SeguePanel
						title={t("track.leadsInto")}
						rows={data.neighbors_after}
					/>
				</Grid2>
			)}

			<Panel title={t("track.playsPerMonth")}>
				<MonthlyChart data={data.monthly} metric="plays" />
			</Panel>

			<Grid2>
				<Panel title={t("track.whenYouPlay")}>
					<HourBars data={data.hourly} />
				</Panel>
				<Panel title={t("track.byWeekday")}>
					<WeekBars data={data.weekly} />
				</Panel>
			</Grid2>

			{data.completion_yearly.length >= 2 && (
				<Panel title={t("track.completionTrend")}>
					<YearLineChart
						percent
						data={data.completion_yearly.map((c) => ({
							year: c.year,
							value: c.avg_completion,
						}))}
					/>
				</Panel>
			)}

			{data.rank_yearly.length >= 2 && (
				<Panel title={t("track.rankByYear")}>
					<YearLineChart
						reversed
						data={data.rank_yearly.map((r) => ({
							year: r.year,
							value: r.rank,
						}))}
					/>
				</Panel>
			)}

			<Grid2>
				<Breakdown
					title={t("track.completion")}
					rows={data.completion}
					fmtLabel={(l) => tEnum(t, "completion", l)}
				/>
				<Breakdown
					title={t("track.howItStarts")}
					rows={data.reason_start}
					fmtLabel={(l) => tEnum(t, "reasonStart", l)}
				/>
			</Grid2>

			<Grid2>
				<Breakdown
					title={t("track.howItEnds")}
					rows={data.reason_end}
					fmtLabel={(l) => tEnum(t, "reasonEnd", l)}
				/>
				<Breakdown title={t("track.platforms")} rows={data.platforms} />
			</Grid2>

			{data.countries.length > 1 && (
				<Breakdown title={t("track.countries")} rows={data.countries} />
			)}

			{data.comeback && (
				<Panel title={t("track.comebackTitle")}>
					<Muted>
						{t("track.comebackLine", {
							gap: t("count.days", {
								count: data.comeback.gap_days,
								n: fmtInt(data.comeback.gap_days),
							}),
							n: data.comeback.plays_30d,
						})}{" "}
						· {fmtDate(data.comeback.date)}
					</Muted>
				</Panel>
			)}
		</>
	);
}

// One side of the segue map: a track's most frequent neighbours, linking back
// to their own detail pages.
function SeguePanel({ title, rows }: { title: string; rows: Neighbor[] }) {
	const t = useT();
	const columns: Column<Neighbor>[] = [
		{
			key: "name",
			header: t("col.track"),
			cell: (r) => <TrackLink uri={r.track_uri} name={r.name} />,
		},
		{
			key: "artist",
			header: t("col.artist"),
			cell: (r) => <ArtistLink name={r.artist} muted />,
		},
		{
			key: "plays",
			header: t("track.segueCount"),
			align: "right",
			width: "4rem",
			cell: (r) => fmtInt(r.plays),
		},
	];
	return (
		<Panel title={title}>
			{rows.length === 0 ? (
				<Muted>{t("insights.notEnough")}</Muted>
			) : (
				<DataTable rows={rows} columns={columns} rowKey={(r) => r.track_uri} />
			)}
		</Panel>
	);
}
