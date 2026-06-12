import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api, type TrackRow } from "../api";
import { fmtDate, fmtHours, fmtInt, fmtPct } from "../format";
import { ArtistLink, TrackLink } from "../links";
import {
	ControlsBar,
	Field,
	Input,
	Muted,
	type Sort,
	Status,
	type VColumn,
	VirtualTable,
} from "../ui";

const COLUMNS: VColumn<TrackRow>[] = [
	{
		key: "name",
		header: "track",
		size: "minmax(200px,2fr)",
		sortable: true,
		cell: (t) => <TrackLink uri={t.track_uri} name={t.name} />,
	},
	{
		key: "artist",
		header: "artist",
		size: "minmax(140px,1.4fr)",
		sortable: true,
		cell: (t) => <ArtistLink name={t.artist} muted />,
	},
	{
		key: "album",
		header: "album",
		size: "minmax(140px,1.4fr)",
		muted: true,
		cell: (t) => t.album,
	},
	{
		key: "plays",
		header: "plays",
		size: "70px",
		align: "right",
		sortable: true,
		cell: (t) => fmtInt(t.plays),
	},
	{
		key: "hours",
		header: "hours",
		size: "70px",
		align: "right",
		sortable: true,
		cell: (t) => fmtHours(t.hours),
	},
	{
		key: "last_play",
		header: "last",
		size: "95px",
		align: "right",
		muted: true,
		sortable: true,
		cell: (t) => fmtDate(t.last_play),
	},
	{
		key: "skip_ratio",
		header: "skip",
		size: "60px",
		align: "right",
		muted: true,
		sortable: true,
		cell: (t) => fmtPct(t.skip_ratio),
	},
];

type SortKey = keyof Pick<
	TrackRow,
	"name" | "artist" | "plays" | "hours" | "last_play" | "skip_ratio"
>;

// The whole distinct-track list (~20k rows) is shipped once and held in
// memory; search/sort never hit the server. Only the DOM is virtualized.
export default function Library() {
	const { data, error } = useQuery({
		queryKey: ["allTracks"],
		queryFn: api.allTracks,
	});
	const [search, setSearch] = useState("");
	const [sort, setSort] = useState<Sort>({ key: "plays", desc: true });

	const rows = useMemo(() => {
		if (!data) return [];
		const q = search.toLowerCase();
		const filtered = q
			? data.items.filter(
					(t) =>
						t.name.toLowerCase().includes(q) ||
						t.artist.toLowerCase().includes(q) ||
						t.album.toLowerCase().includes(q),
				)
			: data.items;
		const dir = sort.desc ? -1 : 1;
		const key = sort.key as SortKey;
		return [...filtered].sort((a, b) => {
			const av = a[key];
			const bv = b[key];
			if (typeof av === "string" && typeof bv === "string")
				return dir * av.localeCompare(bv);
			return dir * (Number(av) - Number(bv));
		});
	}, [data, search, sort]);

	if (!data) return <Status error={error} />;

	// New sort column defaults descending except for the text columns.
	const onSortChange = (s: Sort) => {
		if (s.key === sort.key) setSort(s);
		else setSort({ key: s.key, desc: s.key !== "name" && s.key !== "artist" });
	};

	return (
		<>
			<ControlsBar>
				<Field label="search">
					<Input
						placeholder="track / artist / album"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						width="16rem"
					/>
				</Field>
				<Muted size="md">
					{fmtInt(rows.length)} of {fmtInt(data.total)} tracks
				</Muted>
			</ControlsBar>

			<VirtualTable
				rows={rows}
				columns={COLUMNS}
				rowKey={(t) => t.track_uri}
				sort={sort}
				onSortChange={onSortChange}
			/>
		</>
	);
}
