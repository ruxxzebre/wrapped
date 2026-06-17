import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { Metric, Period, TopArtist } from "../api";
import { MetricToggle, WindowPicker } from "../controls";
import { fmtHours, fmtInt } from "../format";
import { type TFunction, useT } from "../i18n";
import { ArtistLink } from "../links";
import { q } from "../queries";
import { ControlsBar, Status, type VColumn, VirtualTable } from "../ui";

const columns = (t: TFunction): VColumn<TopArtist>[] => [
	{
		key: "rank",
		header: t("col.rank"),
		size: "3rem",
		muted: true,
		cell: (_, i) => i + 1,
	},
	{
		key: "artist",
		header: t("col.artist"),
		size: "minmax(200px,2fr)",
		cell: (a) => <ArtistLink name={a.artist} />,
	},
	{
		key: "plays",
		header: t("col.plays"),
		size: "minmax(80px,1fr)",
		align: "right",
		cell: (a) => fmtInt(a.plays),
	},
	{
		key: "hours",
		header: t("col.hours"),
		size: "minmax(80px,1fr)",
		align: "right",
		cell: (a) => fmtHours(a.hours),
	},
	{
		key: "tracks",
		header: t("col.tracks"),
		size: "minmax(80px,1fr)",
		align: "right",
		cell: (a) => fmtInt(a.tracks),
	},
];

export default function TopArtists() {
	const t = useT();
	const [metric, setMetric] = useState<Metric>("plays");
	const [period, setPeriod] = useState<Period>({});
	const COLUMNS = useMemo(() => columns(t), [t]);

	const query = useInfiniteQuery(q.topArtists(metric, period));

	const rows = useMemo(() => query.data?.pages.flat() ?? [], [query.data]);

	return (
		<>
			<ControlsBar>
				<MetricToggle value={metric} onChange={setMetric} />
				<WindowPicker value={period} onChange={setPeriod} />
			</ControlsBar>

			{!query.data ? (
				<Status error={query.error} />
			) : (
				<VirtualTable
					rows={rows}
					columns={COLUMNS}
					rowKey={(a) => a.artist}
					fill
					scrollRestorationId="top-artists"
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
