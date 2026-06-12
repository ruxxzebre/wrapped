import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api, type Metric, type TopArtist, type Window } from "../api";
import { MetricToggle, WindowPicker } from "../controls";
import { fmtHours, fmtInt } from "../format";
import { ArtistLink } from "../links";
import {
	type Column,
	ControlsBar,
	DataTable,
	Field,
	Panel,
	Select,
	Status,
} from "../ui";

const COLUMNS: Column<TopArtist>[] = [
	{
		key: "rank",
		header: "#",
		width: "2rem",
		muted: true,
		cell: (_, i) => i + 1,
	},
	{
		key: "artist",
		header: "artist",
		cell: (a) => <ArtistLink name={a.artist} />,
	},
	{
		key: "plays",
		header: "plays",
		align: "right",
		cell: (a) => fmtInt(a.plays),
	},
	{
		key: "hours",
		header: "hours",
		align: "right",
		cell: (a) => fmtHours(a.hours),
	},
	{
		key: "tracks",
		header: "tracks",
		align: "right",
		cell: (a) => fmtInt(a.tracks),
	},
];

export default function TopArtists() {
	const [metric, setMetric] = useState<Metric>("plays");
	const [window, setWindow] = useState<Window>({});
	const [limit, setLimit] = useState(100);

	const { data, error } = useQuery({
		queryKey: ["topArtists", metric, window, limit],
		queryFn: () => api.topArtists(metric, window, 30000, limit),
		placeholderData: (prev) => prev,
	});

	return (
		<>
			<ControlsBar>
				<MetricToggle value={metric} onChange={setMetric} />
				<WindowPicker value={window} onChange={setWindow} />
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
					<DataTable rows={data} columns={COLUMNS} rowKey={(a) => a.artist} />
				</Panel>
			)}
		</>
	);
}
