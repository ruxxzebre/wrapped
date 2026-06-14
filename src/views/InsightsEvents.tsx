import { useQuery } from "@tanstack/react-query";
import type { Hiatus, Loop, Rediscovery } from "../api";
import { fmtInt } from "../format";
import { useT } from "../i18n";
import { ArtistLink, TrackLink } from "../links";
import { q } from "../queries";
import { type Column, DataTable, Muted, Status } from "../ui";
import { useInsightsPeriod } from "./insightsPeriod";
import { Section } from "./insightsShared";

// Insights › Events — datable moments in the history: the silences (§25), tracks
// that came back from the dead (§18), and what you put on actual repeat (§19).
export default function InsightsEvents() {
	return (
		<>
			<HiatusesPanel />
			<RediscoveriesPanel />
			<LoopsPanel />
		</>
	);
}

function HiatusesPanel() {
	const t = useT();
	const { period } = useInsightsPeriod();
	const { data, error } = useQuery(q.hiatuses(period));

	const columns: Column<Hiatus>[] = [
		{
			key: "days",
			header: t("insights.col.days"),
			align: "right",
			width: "5rem",
			cell: (r) => fmtInt(r.days),
		},
		{ key: "from", header: t("insights.col.from"), cell: (r) => r.from },
		{ key: "to", header: t("insights.col.to"), cell: (r) => r.to },
	];

	return (
		<Section
			title={t("insights.hiatuses.title")}
			lede={t("insights.hiatuses.lede")}
		>
			{!data ? (
				<Status error={error} />
			) : data.length === 0 ? (
				<Muted>{t("insights.notEnough")}</Muted>
			) : (
				<DataTable
					rows={data}
					columns={columns}
					rowKey={(r) => `${r.from}|${r.to}`}
				/>
			)}
		</Section>
	);
}

function RediscoveriesPanel() {
	const t = useT();
	const { period } = useInsightsPeriod();
	const { data, error } = useQuery(q.rediscoveries(period));

	const columns: Column<Rediscovery>[] = [
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
			key: "comeback",
			header: t("insights.col.comeback"),
			cell: (r) => r.date,
		},
		{
			key: "gap",
			header: t("insights.col.gap"),
			align: "right",
			cell: (r) =>
				t("count.days", { count: r.gap_days, n: fmtInt(r.gap_days) }),
		},
		{
			key: "revival",
			header: t("insights.col.revival"),
			align: "right",
			muted: true,
			cell: (r) => t("insights.rediscoveries.revival", { n: r.plays_30d }),
		},
	];

	return (
		<Section
			title={t("insights.rediscoveries.title")}
			lede={t("insights.rediscoveries.lede")}
		>
			{!data ? (
				<Status error={error} />
			) : data.length === 0 ? (
				<Muted>{t("insights.notEnough")}</Muted>
			) : (
				<DataTable
					rows={data}
					columns={columns}
					rowKey={(r) => `${r.track_uri}|${r.date}`}
				/>
			)}
		</Section>
	);
}

function LoopsPanel() {
	const t = useT();
	const { period } = useInsightsPeriod();
	const { data, error } = useQuery(q.loops(period));

	const columns: Column<Loop>[] = [
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
			key: "run",
			header: t("insights.col.run"),
			align: "right",
			cell: (r) => t("insights.loops.run", { n: r.run_len }),
		},
		{
			key: "started",
			header: t("insights.col.started"),
			align: "right",
			muted: true,
			cell: (r) => r.date,
		},
	];

	return (
		<Section title={t("insights.loops.title")} lede={t("insights.loops.lede")}>
			{!data ? (
				<Status error={error} />
			) : data.length === 0 ? (
				<Muted>{t("insights.notEnough")}</Muted>
			) : (
				<DataTable
					rows={data}
					columns={columns}
					rowKey={(r) => `${r.track_uri}|${r.date}`}
				/>
			)}
		</Section>
	);
}
