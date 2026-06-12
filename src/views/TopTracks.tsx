import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api, type Metric, type TopTrack, type Window } from "../api";
import { MetricToggle, NumberInput, WindowPicker } from "../controls";
import { fmtHours, fmtInt } from "../format";
import { ArtistLink, TrackLink } from "../links";
import {
	type Column,
	ControlsBar,
	DataTable,
	Field,
	Panel,
	Select,
	Status,
} from "../ui";

const COLUMNS: Column<TopTrack>[] = [
	{
		key: "rank",
		header: "#",
		width: "2rem",
		muted: true,
		cell: (_, i) => i + 1,
	},
	{
		key: "track",
		header: "track",
		cell: (t) => <TrackLink uri={t.track_uri} name={t.name} />,
	},
	{
		key: "artist",
		header: "artist",
		cell: (t) => <ArtistLink name={t.artist} muted />,
	},
	{
		key: "plays",
		header: "plays",
		align: "right",
		cell: (t) => fmtInt(t.plays),
	},
	{
		key: "hours",
		header: "hours",
		align: "right",
		cell: (t) => fmtHours(t.hours),
	},
];

export default function TopTracks() {
	const [metric, setMetric] = useState<Metric>("plays");
	const [window, setWindow] = useState<Window>({});
	const [minMs, setMinMs] = useState(30000);
	const [limit, setLimit] = useState(100);

	const { data, error } = useQuery({
		queryKey: ["topTracks", metric, window, minMs, limit],
		queryFn: () => api.topTracks(metric, window, minMs, limit),
		placeholderData: (prev) => prev,
	});

	return (
		<>
			<ControlsBar>
				<MetricToggle value={metric} onChange={setMetric} />
				<WindowPicker value={window} onChange={setWindow} />
				<Field label="min seconds">
					<NumberInput
						min={0}
						value={minMs / 1000}
						onCommit={(n) => setMinMs(n * 1000)}
						width="5.5rem"
					/>
				</Field>
				<Field label="limit">
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
