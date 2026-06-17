import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { Metric, Period, TopTrack } from "../api";
import { MetricToggle, NumberInput, WindowPicker } from "../controls";
import { fmtHours, fmtInt } from "../format";
import { type TFunction, useT } from "../i18n";
import { ArtistLink, TrackLink, usePrefetchTrackDetails } from "../links";
import { q } from "../queries";
import { ControlsBar, Field, Status, type VColumn, VirtualTable } from "../ui";

const columns = (t: TFunction): VColumn<TopTrack>[] => [
	{
		key: "rank",
		header: t("col.rank"),
		size: "3rem",
		muted: true,
		cell: (_, i) => i + 1,
	},
	{
		key: "track",
		header: t("col.track"),
		size: "minmax(200px,2fr)",
		cell: (track) => <TrackLink uri={track.track_uri} name={track.name} />,
	},
	{
		key: "artist",
		header: t("col.artist"),
		size: "minmax(140px,1.4fr)",
		cell: (track) => <ArtistLink name={track.artist} muted />,
	},
	{
		key: "plays",
		header: t("col.plays"),
		size: "minmax(80px,1fr)",
		align: "right",
		cell: (track) => fmtInt(track.plays),
	},
	{
		key: "hours",
		header: t("col.hours"),
		size: "minmax(80px,1fr)",
		align: "right",
		cell: (track) => fmtHours(track.hours),
	},
];

export default function TopTracks() {
	const t = useT();
	const [metric, setMetric] = useState<Metric>("plays");
	const [period, setPeriod] = useState<Period>({});
	const [minMs, setMinMs] = useState(30000);
	const COLUMNS = useMemo(() => columns(t), [t]);

	const query = useInfiniteQuery(q.topTracks(metric, period, minMs));

	const rows = useMemo(() => query.data?.pages.flat() ?? [], [query.data]);

	// Warm every loaded row's full track detail in one batched pass, so clicking
	// through paints from cache instead of opening cold.
	usePrefetchTrackDetails(rows.map((track) => track.track_uri));

	return (
		<>
			<ControlsBar>
				<MetricToggle value={metric} onChange={setMetric} />
				<WindowPicker value={period} onChange={setPeriod} />
				<Field label={t("controls.minSeconds")}>
					<NumberInput
						min={0}
						value={minMs / 1000}
						onCommit={(n) => setMinMs(n * 1000)}
						width="5.5rem"
					/>
				</Field>
			</ControlsBar>

			{!query.data ? (
				<Status error={query.error} />
			) : (
				<VirtualTable
					rows={rows}
					columns={COLUMNS}
					rowKey={(track) => track.track_uri}
					height="calc(100vh - 13rem)"
					scrollRestorationId="top-tracks"
					onEndReached={() => {
						if (query.hasNextPage && !query.isFetchingNextPage)
							query.fetchNextPage();
					}}
					footer={
						query.isFetchingNextPage ? (
							<Status label={t("playLog.loadingMore")} />
						) : null
					}
				/>
			)}
		</>
	);
}
