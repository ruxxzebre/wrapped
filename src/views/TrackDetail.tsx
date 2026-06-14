import { useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import type { Neighbor, TrackDeep, TrackHead } from "../api";
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
	Skeleton,
	Stack,
	Status,
} from "../ui";
import {
	Breakdown,
	BreakdownSkeleton,
	Cards,
	CardsSkeleton,
	ChartSkeleton,
	HourBars,
	MonthlyChart,
	WeekBars,
	YearLineChart,
} from "../widgets";

const route = getRouteApi("/track/$uri");

export default function TrackDetail() {
	const t = useT();
	const { uri } = route.useParams();
	// Head paints the title + cards instantly (warmed on preload); deep carries
	// the heavy panels and loads on mount, streaming in below the cards.
	const { data: head, error } = useQuery(q.trackHead(uri));
	const { data: deep } = useQuery(q.trackDeep(uri));
	if (error) return <Status error={error} />;
	// The route loader warms head, so this rarely shows — but on a cold/direct
	// load fall back to the full skeleton rather than a bare "Loading…" line.
	if (!head)
		return (
			<>
				<DetailHead
					back={<BackLink />}
					title={<Skeleton width="40%" height={34} />}
					sub={<Skeleton width="22%" height={16} />}
				/>
				<CardsSkeleton count={6} />
				<TrackPanelsSkeleton />
			</>
		);

	// Skip rate next to the library baseline — a raw percentage means little
	// without it (§D).
	const skipMultiple =
		head.skip_ratio_all > 0
			? (head.skip_ratio / head.skip_ratio_all).toFixed(1)
			: null;

	const cards = [
		{ label: t("card.plays"), value: fmtInt(head.plays) },
		{ label: t("card.hours"), value: fmtHours(head.hours) },
		{
			label: t("detail.skipRate"),
			value: fmtPct(head.skip_ratio),
			sub: skipMultiple
				? t("detail.vsAverage", { x: skipMultiple })
				: undefined,
		},
		{
			label: t("detail.length"),
			value: head.max_ms ? fmtDuration(head.max_ms) : t("common.dash"),
			sub: t("detail.longestPlay"),
		},
		{
			label: t("detail.rank"),
			value: head.rank_plays ? `#${fmtInt(head.rank_plays)}` : t("common.dash"),
			sub: t("detail.byPlaysLifetime"),
		},
		{
			label: t("detail.firstHeard"),
			value: fmtDate(head.first_play),
			sub: t("summary.latest", { date: fmtDate(head.last_play) }),
		},
	];

	return (
		<>
			<DetailHead
				back={<BackLink />}
				title={head.name}
				sub={
					<>
						<ArtistLink name={head.artist} /> · <Muted>{head.album}</Muted>
					</>
				}
				action={<SpotifyLink uri={uri} />}
			/>

			<Cards items={cards} />

			<SpotifyEmbed uri={uri} />

			{deep ? <TrackPanels head={head} deep={deep} /> : <TrackPanelsSkeleton />}
		</>
	);
}

// Placeholder for the deep panels while `trackDeep` resolves. Mirrors only the
// always-present sections (the extras row, monthly chart, hour/weekday charts
// and the four breakdowns) at their real heights, so the page holds its shape
// and the real panels swap in without a jump. Conditional panels (origin,
// segue, yearly trends, comeback) are simply appended below when they arrive.
function TrackPanelsSkeleton() {
	const t = useT();
	return (
		<>
			<CardsSkeleton count={4} />

			<Panel title={t("track.playsPerMonth")}>
				<ChartSkeleton height={240} />
			</Panel>

			<Grid2>
				<Panel title={t("track.whenYouPlay")}>
					<ChartSkeleton height={200} />
				</Panel>
				<Panel title={t("track.byWeekday")}>
					<ChartSkeleton height={200} />
				</Panel>
			</Grid2>

			<Grid2>
				<BreakdownSkeleton title={t("track.completion")} />
				<BreakdownSkeleton title={t("track.howItStarts")} />
			</Grid2>

			<Grid2>
				<BreakdownSkeleton title={t("track.howItEnds")} />
				<BreakdownSkeleton title={t("track.platforms")} />
			</Grid2>
		</>
	);
}

// The below-the-fold panels — split out so they render only once `trackDeep`
// resolves, keeping the cards above instant on navigation. Derived "goodies"
// (§E–§K) live here because each draws on a deep field.
function TrackPanels({ head, deep }: { head: TrackHead; deep: TrackDeep }) {
	const t = useT();

	// A row of derived "goodies" — each card omitted when it has nothing to say
	// (§E, §F, §G, §J).
	const finished = deep.completion.find((c) => c.label === "finished")?.plays;
	const fullListens =
		head.max_ms > 0 ? Math.round((head.hours * 3600000) / head.max_ms) : null;
	const daysSinceLast = head.last_play
		? Math.floor((Date.now() - Date.parse(head.last_play)) / 86400000)
		: null;
	const seasonShow =
		deep.season && deep.season.years >= 2 && deep.season.concentration >= 0.55;

	const extras = [];
	if (seasonShow && deep.season) {
		extras.push({
			label: t("track.season"),
			value: monthLabel(deep.season.peak_month),
			sub: fmtPct(deep.season.concentration),
		});
	}
	extras.push({
		label: t("track.shuffleShare"),
		value: fmtPct(deep.shuffle_ratio),
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
			sub: fmtDate(head.last_play),
		});
	}
	if (deep.loop) {
		extras.push({
			label: t("track.onRepeat"),
			value: t("insights.loops.run", { n: deep.loop.longest_run }),
			sub: deep.loop.date,
		});
	}
	if (deep.binge_days > 0) {
		extras.push({
			label: t("track.bingeDays"),
			value: fmtInt(deep.binge_days),
			sub: t("track.bingeDaysSub"),
		});
	}
	if (deep.milestone) {
		extras.push({
			label: t("track.milestone"),
			value: fmtDate(deep.milestone.date),
			sub: t("count.plays", {
				count: deep.milestone.n,
				n: fmtInt(deep.milestone.n),
			}),
		});
	}

	const hasSegue =
		deep.neighbors_before.length > 0 || deep.neighbors_after.length > 0;
	const showSkipSplit =
		deep.skip_shuffle != null && deep.skip_intentional != null;

	return (
		<>
			<Cards items={extras} />

			{showSkipSplit && (
				<Muted>
					{t("track.skipSplit", {
						shuffle: fmtPct(deep.skip_shuffle ?? 0),
						intent: fmtPct(deep.skip_intentional ?? 0),
					})}
				</Muted>
			)}

			{deep.origin && (
				<Panel title={t("track.originTitle")}>
					<Stack gap="sm">
						<span>
							{t("track.originLine", {
								weekday: deep.origin.weekday,
								date: fmtDate(deep.origin.date),
							})}
							{deep.origin.prev_uri && (
								<>
									{" "}
									{fillNodes(
										t("track.originGateway", { gateway: "{gateway}" }),
										{
											gateway: (
												<TrackLink
													uri={deep.origin.prev_uri}
													name={deep.origin.prev_name}
												/>
											),
										},
									)}
								</>
							)}
						</span>
						<Muted size="sm">
							{deep.origin.platform} ·{" "}
							{tEnum(t, "reasonStart", deep.origin.reason_start)}
						</Muted>
					</Stack>
				</Panel>
			)}

			{hasSegue && (
				<Grid2>
					<SeguePanel
						title={t("track.comesBefore")}
						rows={deep.neighbors_before}
					/>
					<SeguePanel
						title={t("track.leadsInto")}
						rows={deep.neighbors_after}
					/>
				</Grid2>
			)}

			<Panel title={t("track.playsPerMonth")}>
				<MonthlyChart data={deep.monthly} metric="plays" />
			</Panel>

			<Grid2>
				<Panel title={t("track.whenYouPlay")}>
					<HourBars data={deep.hourly} />
				</Panel>
				<Panel title={t("track.byWeekday")}>
					<WeekBars data={deep.weekly} />
				</Panel>
			</Grid2>

			{deep.completion_yearly.length >= 2 && (
				<Panel title={t("track.completionTrend")}>
					<YearLineChart
						percent
						data={deep.completion_yearly.map((c) => ({
							year: c.year,
							value: c.avg_completion,
						}))}
					/>
				</Panel>
			)}

			{deep.rank_yearly.length >= 2 && (
				<Panel title={t("track.rankByYear")}>
					<YearLineChart
						reversed
						data={deep.rank_yearly.map((r) => ({
							year: r.year,
							value: r.rank,
						}))}
					/>
				</Panel>
			)}

			<Grid2>
				<Breakdown
					title={t("track.completion")}
					rows={deep.completion}
					fmtLabel={(l) => tEnum(t, "completion", l)}
				/>
				<Breakdown
					title={t("track.howItStarts")}
					rows={deep.reason_start}
					fmtLabel={(l) => tEnum(t, "reasonStart", l)}
				/>
			</Grid2>

			<Grid2>
				<Breakdown
					title={t("track.howItEnds")}
					rows={deep.reason_end}
					fmtLabel={(l) => tEnum(t, "reasonEnd", l)}
				/>
				<Breakdown title={t("track.platforms")} rows={deep.platforms} />
			</Grid2>

			{deep.countries.length > 1 && (
				<Breakdown title={t("track.countries")} rows={deep.countries} />
			)}

			{deep.comeback && (
				<Panel title={t("track.comebackTitle")}>
					<Muted>
						{t("track.comebackLine", {
							gap: t("count.days", {
								count: deep.comeback.gap_days,
								n: fmtInt(deep.comeback.gap_days),
							}),
							n: deep.comeback.plays_30d,
						})}{" "}
						· {fmtDate(deep.comeback.date)}
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
