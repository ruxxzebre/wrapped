import { useQuery } from "@tanstack/react-query";
import {
	type KeyboardEvent as ReactKeyboardEvent,
	useDeferredValue,
	useMemo,
	useState,
} from "react";
import { api } from "../api";
import { fmtInt } from "../format";
import { useT } from "../i18n";
import { artistPath, navigate, trackPath } from "../router";
import { Modal } from "../ui";
import * as css from "./CommandPalette.css";

type Result =
	| { type: "artist"; label: string; sub: string; to: string }
	| { type: "track"; label: string; sub: string; to: string };

// Ctrl+K palette. Reuses the Library track dump already in the query cache —
// no backend call — and derives the artist list from it.
export default function CommandPalette({ onClose }: { onClose: () => void }) {
	const t = useT();
	const { data } = useQuery({
		queryKey: ["allTracks"],
		queryFn: api.allTracks,
	});
	const [q, setQ] = useState("");
	const [active, setActive] = useState(0);
	const query = useDeferredValue(q);

	// Artist → total plays, derived once from the track list.
	const artists = useMemo(() => {
		const m = new Map<string, number>();
		for (const t of data?.items ?? []) {
			if (t.artist && t.artist !== "?")
				m.set(t.artist, (m.get(t.artist) ?? 0) + t.plays);
		}
		return [...m.entries()].map(([name, plays]) => ({ name, plays }));
	}, [data]);

	const results = useMemo<Result[]>(() => {
		const needle = query.trim().toLowerCase();
		if (!needle || !data) return [];
		const artistHits = artists
			.filter((a) => a.name.toLowerCase().includes(needle))
			.sort((x, y) => y.plays - x.plays)
			.slice(0, 6)
			.map<Result>((a) => ({
				type: "artist",
				label: a.name,
				sub: t("count.plays", { count: a.plays, n: fmtInt(a.plays) }),
				to: artistPath(a.name),
			}));
		const trackHits = data.items
			.filter(
				(tr) =>
					tr.name.toLowerCase().includes(needle) ||
					tr.artist.toLowerCase().includes(needle),
			)
			.sort((x, y) => y.plays - x.plays)
			.slice(0, 12)
			.map<Result>((tr) => ({
				type: "track",
				label: tr.name,
				sub: `${tr.artist} · ${t("count.plays", { count: tr.plays, n: fmtInt(tr.plays) })}`,
				to: trackPath(tr.track_uri),
			}));
		return [...artistHits, ...trackHits];
	}, [query, data, artists, t]);

	const go = (r?: Result) => {
		if (!r) return;
		navigate(r.to);
		onClose();
	};

	const onKeyDown = (e: ReactKeyboardEvent) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setActive((i) => Math.min(i + 1, results.length - 1));
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setActive((i) => Math.max(i - 1, 0));
		} else if (e.key === "Enter") {
			e.preventDefault();
			go(results[active]);
		} else if (e.key === "Escape") {
			onClose();
		}
	};

	return (
		<Modal onClose={onClose}>
			<input
				// Focus on mount; refires on re-render but focusing the already
				// focused element is a no-op.
				ref={(el) => el?.focus()}
				className={css.input}
				placeholder={t("palette.placeholder")}
				value={q}
				onChange={(e) => {
					setQ(e.target.value);
					setActive(0);
				}}
				onKeyDown={onKeyDown}
			/>
			{results.length > 0 && (
				<ul className={css.results}>
					{results.map((r, i) => (
						// biome-ignore lint/a11y/useKeyWithClickEvents: keyboard nav (arrows/Enter) is handled on the search input
						<li
							key={`${r.type}:${r.to}`}
							className={
								i === active ? `${css.result} ${css.resultActive}` : css.result
							}
							onMouseEnter={() => setActive(i)}
							onClick={() => go(r)}
						>
							<span className={css.kind}>
								{r.type === "artist" ? t("palette.artist") : t("palette.track")}
							</span>
							<span className={css.label}>{r.label}</span>
							<span className={css.sub}>{r.sub}</span>
						</li>
					))}
				</ul>
			)}
			{query.trim() && results.length === 0 && (
				<div className={css.empty}>{t("palette.noMatches")}</div>
			)}
		</Modal>
	);
}
