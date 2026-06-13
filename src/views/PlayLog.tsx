import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { api, type PlayRow, type Window } from "../api";
import { WindowPicker } from "../controls";
import { fmtDateTime, fmtDuration } from "../format";
import { type TFunction, useT } from "../i18n";
import { ArtistLink, TrackLink } from "../links";
import {
	ControlsBar,
	Field,
	Input,
	Status,
	type VColumn,
	VirtualTable,
} from "../ui";

const columns = (t: TFunction): VColumn<PlayRow>[] => [
	{
		key: "ts",
		header: t("col.playedAt"),
		size: "140px",
		muted: true,
		cell: (p) => fmtDateTime(p.ts),
	},
	{
		key: "track",
		header: t("col.track"),
		size: "minmax(200px,2fr)",
		cell: (p) => <TrackLink uri={p.track_uri} name={p.name} />,
	},
	{
		key: "artist",
		header: t("col.artist"),
		size: "minmax(140px,1.4fr)",
		cell: (p) => <ArtistLink name={p.artist} muted />,
	},
	{
		key: "for",
		header: t("col.for"),
		size: "60px",
		align: "right",
		cell: (p) => fmtDuration(p.ms_played),
	},
	{
		key: "skip",
		header: t("col.skip"),
		size: "60px",
		muted: true,
		cell: (p) => (p.skipped ? "⏭" : ""),
	},
	{
		key: "platform",
		header: t("col.platform"),
		size: "minmax(100px,1fr)",
		muted: true,
		cell: (p) => shortPlatform(p.platform),
	},
];

// The raw log is 85k+ rows — data transfer is paginated server-side (keyset
// cursor) and only the fetched window is rendered, virtualized.
export default function PlayLog() {
	const t = useT();
	const { from: qFrom, to: qTo } = useSearch({ from: "/play-log" });
	const COLUMNS = useMemo(() => columns(t), [t]);

	const [search, setSearch] = useState("");
	const [debounced, setDebounced] = useState("");

	// The URL (e.g. a Calendar day click) provides the window until the user
	// picks one; a new URL filter resets the pick (render-time adjust, no
	// effect, so there's no flash of the stale window).
	const [picked, setWindow] = useState<Window | null>(null);
	const [prevParams, setPrevParams] = useState({ qFrom, qTo });
	if (prevParams.qFrom !== qFrom || prevParams.qTo !== qTo) {
		setPrevParams({ qFrom, qTo });
		setWindow(null);
	}
	const window = picked ?? { from: qFrom, to: qTo };

	useEffect(() => {
		const t = setTimeout(() => setDebounced(search), 300);
		return () => clearTimeout(t);
	}, [search]);

	const query = useInfiniteQuery({
		queryKey: ["plays", debounced, window],
		queryFn: ({ pageParam }) => api.plays(pageParam, debounced, window),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (last) => last.next_cursor ?? undefined,
	});

	const rows = useMemo(
		() => query.data?.pages.flatMap((p) => p.items) ?? [],
		[query.data],
	);

	if (!query.data) return <Status error={query.error} />;

	return (
		<>
			<ControlsBar>
				<Field label={t("controls.search")}>
					<Input
						placeholder={t("playLog.searchPlaceholder")}
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						width="16rem"
					/>
				</Field>
				<WindowPicker value={window} onChange={setWindow} />
			</ControlsBar>

			<VirtualTable
				rows={rows}
				columns={COLUMNS}
				rowKey={(p) => `${p.ts}-${p.track_uri}`}
				rowHeight={34}
				overscan={20}
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
		</>
	);
}

function shortPlatform(p: string) {
	const l = p.toLowerCase();
	if (l.includes("android")) return "android";
	if (l.includes("windows")) return "windows";
	if (l.includes("ios") || l.includes("iphone")) return "ios";
	if (l.includes("mac") || l.includes("os x")) return "mac";
	if (l.includes("linux")) return "linux";
	if (l.includes("web")) return "web";
	return p.split(" ")[0] ?? p;
}
