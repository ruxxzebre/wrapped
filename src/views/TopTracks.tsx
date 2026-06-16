import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { Metric, Period, TopTrack } from "../api";
import { MetricToggle, NumberInput, WindowPicker } from "../controls";
import { fmtHours, fmtInt } from "../format";
import { type TFunction, useT } from "../i18n";
import { ArtistLink, TrackLink, usePrefetchTrackDetails } from "../links";
import { q } from "../queries";
import {
	type Column,
	ControlsBar,
	DataTable,
	Field,
	Panel,
	Select,
	Status,
} from "../ui";

const columns = (t: TFunction): Column<TopTrack>[] => [
	{
		key: "rank",
		header: t("col.rank"),
		width: "2rem",
		muted: true,
		cell: (_, i) => i + 1,
	},
	{
		key: "track",
		header: t("col.track"),
		cell: (track) => <TrackLink uri={track.track_uri} name={track.name} />,
	},
	{
		key: "artist",
		header: t("col.artist"),
		cell: (track) => <ArtistLink name={track.artist} muted />,
	},
	{
		key: "plays",
		header: t("col.plays"),
		align: "right",
		cell: (track) => fmtInt(track.plays),
	},
	{
		key: "hours",
		header: t("col.hours"),
		align: "right",
		cell: (track) => fmtHours(track.hours),
	},
];

export default function TopTracks() {
	const t = useT();
	const [metric, setMetric] = useState<Metric>("plays");
	const [period, setPeriod] = useState<Period>({});
	const [minMs, setMinMs] = useState(30000);
	const [limit, setLimit] = useState(100);
	const COLUMNS = useMemo(() => columns(t), [t]);

	const { data, error } = useQuery({
		...q.topTracks(metric, period, minMs, limit),
		placeholderData: (prev) => prev,
	});

	// Warm every visible row's full track detail in one batched pass, so clicking
	// through paints from cache instead of opening cold.
	usePrefetchTrackDetails(data?.map((track) => track.track_uri) ?? []);

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
				<Field label={t("controls.limit")}>
					<Select
						value={limit}
						onChange={(e) => setLimit(Number(e.target.value))}
					>
						{[25, 50, 100, 250, 500, 1000].map((n) => (
							<option key={n} value={n}>
								{n}
							</option>
						))}
					</Select>
				</Field>
			</ControlsBar>

			{!data ? (
				<Status error={error} />
			) : (
				<Panel>
					<DataTable
						rows={data}
						columns={COLUMNS}
						rowKey={(t) => t.track_uri}
					/>
				</Panel>
			)}
		</>
	);
}
