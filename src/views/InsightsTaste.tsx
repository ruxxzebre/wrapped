import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { Companion, SeasonalTrack } from "../api";
import { fmtHours, fmtInt, fmtPct, monthLabel } from "../format";
import { useT } from "../i18n";
import { ArtistLink, TrackLink } from "../links";
import { q } from "../queries";
import {
	type Column,
	chartColors,
	DataTable,
	Muted,
	palette,
	Status,
	ToggleGroup,
} from "../ui";
import { Cards } from "../widgets";
import { Section } from "./insightsShared";

// Insights › Taste — the shape of what you listen to: how concentrated it is
// (§24 range index), what never left (§17 loyal companions), and what's tied to
// a season (§15).
export default function InsightsTaste() {
	return (
		<>
			<RangePanel />
			<CompanionsPanel />
			<SeasonalPanel />
		</>
	);
}

function RangePanel() {
	const t = useT();
	const { data, error } = useQuery(q.rangeIndex());

	return (
		<Section title={t("insights.range.title")} lede={t("insights.range.lede")}>
			{!data ? (
				<Status error={error} />
			) : (
				<>
					{data.all && (
						<Cards
							items={[
								{
									label: t("insights.range.gini"),
									value: data.all.gini.toFixed(2),
								},
								{
									label: t("insights.range.top1"),
									value: fmtPct(data.all.top1pct_share),
								},
								{ label: t("col.tracks"), value: fmtInt(data.all.tracks) },
							]}
						/>
					)}
					{data.years.length > 1 && (
						<ResponsiveContainer width="100%" height={260}>
							<LineChart
								data={data.years.map((y) => ({
									year: y.bucket,
									gini: Math.round(y.gini * 100) / 100,
									top1: Math.round(y.top1pct_share * 100) / 100,
								}))}
								margin={{ top: 12, right: 8, left: -8, bottom: 0 }}
							>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke={chartColors.grid}
								/>
								<XAxis dataKey="year" stroke={chartColors.axis} fontSize={11} />
								<YAxis
									stroke={chartColors.axis}
									domain={[0, 1]}
									fontSize={11}
								/>
								<Tooltip {...chartColors.tooltip} />
								<Legend />
								<Line
									name={t("insights.range.giniLine")}
									dataKey="gini"
									stroke={chartColors.accent}
									strokeWidth={2}
									dot={false}
									isAnimationActive={false}
								/>
								<Line
									name={t("insights.range.top1Line")}
									dataKey="top1"
									stroke={palette.warn}
									strokeWidth={2}
									dot={false}
									isAnimationActive={false}
								/>
							</LineChart>
						</ResponsiveContainer>
					)}
				</>
			)}
		</Section>
	);
}

function CompanionsPanel() {
	const t = useT();
	const [kind, setKind] = useState<"track" | "artist">("track");
	const { data, error } = useQuery(q.companions(kind));

	const columns: Column<Companion>[] = [
		{
			key: "name",
			header: kind === "track" ? t("col.track") : t("col.artist"),
			cell: (r) =>
				kind === "track" ? (
					<TrackLink uri={r.key} name={r.name} />
				) : (
					<ArtistLink name={r.key} />
				),
		},
		...(kind === "track"
			? [
					{
						key: "artist",
						header: t("col.artist"),
						cell: (r: Companion) => <ArtistLink name={r.artist} muted />,
					},
				]
			: []),
		{
			key: "plays",
			header: t("col.plays"),
			align: "right",
			cell: (r) => fmtInt(r.plays),
		},
		{
			key: "hours",
			header: t("col.hours"),
			align: "right",
			cell: (r) => fmtHours(r.hours),
		},
		{
			key: "years",
			header: t("insights.col.years"),
			align: "right",
			muted: true,
			cell: (r) => fmtInt(r.years),
		},
	];

	return (
		<Section
			title={t("insights.companions.title")}
			lede={t("insights.companions.lede")}
		>
			<div style={{ marginBottom: "0.75rem" }}>
				<ToggleGroup
					value={kind}
					onChange={setKind}
					options={[
						{ value: "track", label: t("col.track") },
						{ value: "artist", label: t("col.artist") },
					]}
				/>
			</div>
			{!data ? (
				<Status error={error} />
			) : data.length === 0 ? (
				<Muted>{t("insights.companions.empty")}</Muted>
			) : (
				<DataTable rows={data} columns={columns} rowKey={(r) => r.key} />
			)}
		</Section>
	);
}

function SeasonalPanel() {
	const t = useT();
	const { data, error } = useQuery(q.seasonal());

	const columns: Column<SeasonalTrack>[] = [
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
			key: "peak",
			header: t("insights.col.peak"),
			cell: (r) => monthLabel(r.peak_month),
		},
		{
			key: "locked",
			header: t("insights.col.locked"),
			align: "right",
			cell: (r) => fmtPct(r.concentration),
		},
		{
			key: "plays",
			header: t("col.plays"),
			align: "right",
			muted: true,
			cell: (r) => fmtInt(r.plays),
		},
	];

	return (
		<Section
			title={t("insights.seasonal.title")}
			lede={t("insights.seasonal.lede")}
		>
			{!data ? (
				<Status error={error} />
			) : data.length === 0 ? (
				<Muted>{t("insights.seasonal.empty")}</Muted>
			) : (
				<DataTable rows={data} columns={columns} rowKey={(r) => r.track_uri} />
			)}
		</Section>
	);
}
