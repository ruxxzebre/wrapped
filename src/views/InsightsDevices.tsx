import { useQuery } from "@tanstack/react-query";
import type { Device, TopTrack } from "../api";
import { fmtHours, fmtInt, fmtPct } from "../format";
import { useT } from "../i18n";
import { ArtistLink, TrackLink } from "../links";
import { q } from "../queries";
import { type Column, DataTable, Muted, Status } from "../ui";
import { Cards } from "../widgets";
import { useInsightsPeriod } from "./insightsPeriod";
import { Section } from "./insightsShared";
import * as css from "./insightsShared.css";

// Insights › Devices — the hardware story in the platform field (§22) and the
// two flags nobody surfaces: incognito and offline listening (§23).
export default function InsightsDevices() {
	return (
		<>
			<DevicesPanel />
			<PrivacyPanel />
		</>
	);
}

function DevicesPanel() {
	const t = useT();
	const { period } = useInsightsPeriod();
	const { data, error } = useQuery(q.devices(period));
	const total = data?.reduce((s, d) => s + d.hours, 0) || 1;

	const columns: Column<Device>[] = [
		{
			key: "device",
			header: t("insights.col.device"),
			cell: (r) => r.device,
		},
		{
			key: "first",
			header: t("insights.col.first"),
			cell: (r) => r.first_seen,
		},
		{ key: "last", header: t("insights.col.last"), cell: (r) => r.last_seen },
		{
			key: "hours",
			header: t("col.hours"),
			align: "right",
			cell: (r) => fmtHours(r.hours),
		},
		{
			key: "share",
			header: t("insights.devices.share"),
			align: "right",
			muted: true,
			cell: (r) => fmtPct(r.hours / total),
		},
	];

	return (
		<Section
			title={t("insights.devices.title")}
			lede={t("insights.devices.lede")}
		>
			{!data ? (
				<Status error={error} />
			) : data.length === 0 ? (
				<Muted>{t("insights.notEnough")}</Muted>
			) : (
				<DataTable rows={data} columns={columns} rowKey={(r) => r.device} />
			)}
		</Section>
	);
}

function TrackTop({ title, rows }: { title: string; rows: TopTrack[] }) {
	const t = useT();
	const columns: Column<TopTrack>[] = [
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
			header: t("col.plays"),
			align: "right",
			cell: (r) => fmtInt(r.plays),
		},
	];
	return (
		<div>
			<h3 className={css.subhead}>{title}</h3>
			<DataTable rows={rows} columns={columns} rowKey={(r) => r.track_uri} />
		</div>
	);
}

function PrivacyPanel() {
	const t = useT();
	const { period } = useInsightsPeriod();
	const { data, error } = useQuery(q.privacy(period));

	if (!data) {
		return (
			<Section
				title={t("insights.privacy.title")}
				lede={t("insights.privacy.lede")}
			>
				<Status error={error} />
			</Section>
		);
	}

	const nothing =
		data.incognito === 0 &&
		data.offline === 0 &&
		data.topOffline.length === 0 &&
		data.topIncognito.length === 0;

	return (
		<Section
			title={t("insights.privacy.title")}
			lede={t("insights.privacy.lede")}
		>
			<Cards
				items={[
					{
						label: t("insights.privacy.incognito"),
						value: fmtInt(data.incognito),
						sub: t("summary.pctOfPlays", {
							pct: fmtPct(data.plays ? data.incognito / data.plays : 0),
						}),
					},
					{
						label: t("insights.privacy.offline"),
						value: fmtInt(data.offline),
						sub: t("summary.pctOfPlays", {
							pct: fmtPct(data.plays ? data.offline / data.plays : 0),
						}),
					},
				]}
			/>
			{nothing ? (
				<Muted>{t("insights.privacy.none")}</Muted>
			) : (
				<div className={css.splitGrid}>
					{data.topOffline.length > 0 && (
						<TrackTop
							title={t("insights.privacy.topOffline")}
							rows={data.topOffline}
						/>
					)}
					{data.topIncognito.length > 0 && (
						<TrackTop
							title={t("insights.privacy.topIncognito")}
							rows={data.topIncognito}
						/>
					)}
				</div>
			)}
		</Section>
	);
}
