import { useElementScrollRestoration } from "@tanstack/react-router";
import { useVirtualizer } from "@tanstack/react-virtual";
import { type ReactNode, useEffect, useMemo, useRef } from "react";
import type { Sort, VColumn } from "./types";
import * as css from "./VirtualTable.css";

function cellClass(col: VColumn<unknown>) {
	const parts = [];
	if (col.align === "right") parts.push(css.num);
	if (col.muted) parts.push(css.muted);
	return parts.length ? parts.join(" ") : undefined;
}

// Virtualized grid for large row counts (Library ~20k, PlayLog ~85k). Only
// the visible window hits the DOM; rows are absolutely positioned.
export function VirtualTable<T>({
	rows,
	columns,
	rowKey,
	rowHeight = 36,
	headerHeight = 34,
	overscan = 15,
	height = 600,
	sort,
	onSortChange,
	onEndReached,
	endThreshold = 30,
	footer,
	scrollRestorationId,
}: {
	rows: T[];
	columns: VColumn<T>[];
	rowKey: (row: T, index: number) => string;
	rowHeight?: number;
	headerHeight?: number;
	overscan?: number;
	height?: number | string;
	sort?: Sort;
	onSortChange?: (s: Sort) => void;
	/** Called when scrolling renders rows within endThreshold of the end. */
	onEndReached?: () => void;
	endThreshold?: number;
	footer?: ReactNode;
	/**
	 * When set, the inner scroll offset is saved per route and restored on
	 * back/forward — so returning from a detail page lands where you left off.
	 * Must be unique per mounting view (e.g. "library", "play-log").
	 */
	scrollRestorationId?: string;
}) {
	const parentRef = useRef<HTMLDivElement>(null);
	// id lookup resolves synchronously from cache, so the saved offset is ready
	// before the virtualizer mounts; passing it as initialOffset avoids a
	// scroll-to-top flash on restore. Empty id simply never matches (no restore).
	const scrollEntry = useElementScrollRestoration({
		id: scrollRestorationId ?? "",
	});
	const virtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => rowHeight,
		overscan,
		initialOffset: scrollEntry?.scrollY,
	});

	const gridTemplateColumns = useMemo(
		() => columns.map((c) => c.size).join(" "),
		[columns],
	);

	const virtualItems = virtualizer.getVirtualItems();

	useEffect(() => {
		if (!onEndReached) return;
		const last = virtualItems.at(-1);
		if (last && last.index >= rows.length - endThreshold) onEndReached();
	}, [virtualItems, rows.length, endThreshold, onEndReached]);

	const toggleSort = (key: string) => {
		if (!onSortChange) return;
		if (sort?.key === key) onSortChange({ key, desc: !sort.desc });
		else onSortChange({ key, desc: true });
	};

	return (
		<>
			<div
				className={css.wrap}
				ref={parentRef}
				style={{ height }}
				data-scroll-restoration-id={scrollRestorationId}
			>
				<div
					className={`${css.row} ${css.head}`}
					style={{ gridTemplateColumns, height: headerHeight }}
				>
					{columns.map((col) => {
						const sortable = col.sortable && onSortChange;
						const arrow =
							sort?.key === col.key ? (sort.desc ? " ↓" : " ↑") : "";
						const className = [
							col.align === "right" ? css.num : undefined,
							sortable ? css.sortable : undefined,
						]
							.filter(Boolean)
							.join(" ");
						return (
							// biome-ignore lint/a11y/noStaticElementInteractions: grid header cell; same pattern as the pre-component sortable headers
							// biome-ignore lint/a11y/useKeyWithClickEvents: see above
							<div
								key={col.key}
								className={className || undefined}
								onClick={sortable ? () => toggleSort(col.key) : undefined}
							>
								{col.header}
								{arrow}
							</div>
						);
					})}
				</div>
				<div
					style={{ height: virtualizer.getTotalSize(), position: "relative" }}
				>
					{virtualItems.map((vi) => {
						const row = rows[vi.index];
						return (
							<div
								key={rowKey(row, vi.index)}
								className={css.row}
								style={{
									gridTemplateColumns,
									position: "absolute",
									top: 0,
									left: 0,
									right: 0,
									height: vi.size,
									transform: `translateY(${vi.start}px)`,
								}}
							>
								{columns.map((col) => (
									<div
										key={col.key}
										className={cellClass(col as VColumn<unknown>)}
									>
										{col.cell(row, vi.index)}
									</div>
								))}
							</div>
						);
					})}
				</div>
			</div>
			{footer}
		</>
	);
}
