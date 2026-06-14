import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { Metric, Period, TopArtist } from "../api";
import { MetricToggle, WindowPicker } from "../controls";
import { fmtHours, fmtInt } from "../format";
import { type TFunction, useT } from "../i18n";
import { ArtistLink } from "../links";
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

const columns = (t: TFunction): Column<TopArtist>[] => [
	{
		key: "rank",
		header: t("col.rank"),
		width: "2rem",
		muted: true,
		cell: (_, i) => i + 1,
	},
	{
		key: "artist",
		header: t("col.artist"),
		cell: (a) => <ArtistLink name={a.artist} />,
	},
	{
		key: "plays",
		header: t("col.plays"),
		align: "right",
		cell: (a) => fmtInt(a.plays),
	},
	{
		key: "hours",
		header: t("col.hours"),
		align: "right",
		cell: (a) => fmtHours(a.hours),
	},
	{
		key: "tracks",
		header: t("col.tracks"),
		align: "right",
		cell: (a) => fmtInt(a.tracks),
	},
];

export default function TopArtists() {
	const t = useT();
	const [metric, setMetric] = useState<Metric>("plays");
	const [period, setPeriod] = useState<Period>({});
	const [limit, setLimit] = useState(100);
	const COLUMNS = useMemo(() => columns(t), [t]);

	const { data, error } = useQuery({
		...q.topArtists(metric, period, limit),
		placeholderData: (prev) => prev,
	});

	return (
		<>
			<ControlsBar>
				<MetricToggle value={metric} onChange={setMetric} />
				<WindowPicker value={period} onChange={setPeriod} />
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
					<DataTable rows={data} columns={COLUMNS} rowKey={(a) => a.artist} />
				</Panel>
			)}
		</>
	);
}
