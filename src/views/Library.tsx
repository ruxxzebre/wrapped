import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { TrackRow } from "../api";
import { fmtDate, fmtHours, fmtInt, fmtPct } from "../format";
import { type TFunction, useT } from "../i18n";
import { ArtistLink, TrackLink } from "../links";
import { q } from "../queries";
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

const columns = (t: TFunction): VColumn<TrackRow>[] => [
	{
		key: "name",
		header: t("col.track"),
		size: "minmax(200px,2fr)",
		sortable: true,
		cell: (row) => <TrackLink uri={row.track_uri} name={row.name} />,
	},
	{
		key: "artist",
		header: t("col.artist"),
		size: "minmax(140px,1.4fr)",
		sortable: true,
		cell: (row) => <ArtistLink name={row.artist} muted />,
	},
	{
		key: "album",
		header: t("col.album"),
		size: "minmax(140px,1.4fr)",
		muted: true,
		cell: (row) => row.album,
	},
	{
		key: "plays",
		header: t("col.plays"),
		size: "70px",
		align: "right",
		sortable: true,
		cell: (row) => fmtInt(row.plays),
	},
	{
		key: "hours",
		header: t("col.hours"),
		size: "70px",
		align: "right",
		sortable: true,
		cell: (row) => fmtHours(row.hours),
	},
	{
		key: "last_play",
		header: t("col.last"),
		size: "95px",
		align: "right",
		muted: true,
		sortable: true,
		cell: (row) => fmtDate(row.last_play),
	},
	{
		key: "skip_ratio",
		header: t("col.skip"),
		size: "60px",
		align: "right",
		muted: true,
		sortable: true,
		cell: (row) => fmtPct(row.skip_ratio),
	},
];

type SortKey = keyof Pick<
	TrackRow,
	"name" | "artist" | "plays" | "hours" | "last_play" | "skip_ratio"
>;

// The whole distinct-track list (~20k rows) is shipped once and held in
// memory; search/sort never hit the server. Only the DOM is virtualized.
export default function Library() {
	const t = useT();
	const { data, error } = useQuery(q.allTracks());
	const [search, setSearch] = useState("");
	const [sort, setSort] = useState<Sort>({ key: "plays", desc: true });
	const COLUMNS = useMemo(() => columns(t), [t]);

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
				<Field label={t("controls.search")}>
					<Input
						placeholder={t("library.searchPlaceholder")}
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						width="16rem"
					/>
				</Field>
				<Muted size="md">
					{t("library.countOf", {
						shown: fmtInt(rows.length),
						total: fmtInt(data.total),
					})}
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
