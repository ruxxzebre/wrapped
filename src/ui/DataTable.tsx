import * as css from "./DataTable.css";
import type { Column, Sort } from "./types";

function cellClass(col: Column<unknown>) {
	const parts = [];
	if (col.align === "right") parts.push(css.num);
	if (col.muted) parts.push(css.muted);
	return parts.length ? parts.join(" ") : undefined;
}

export function DataTable<T>({
	rows,
	columns,
	rowKey,
	sort,
	onSortChange,
	showHeader = true,
}: {
	rows: T[];
	columns: Column<T>[];
	rowKey: (row: T, index: number) => string;
	sort?: Sort;
	onSortChange?: (s: Sort) => void;
	showHeader?: boolean;
}) {
	const toggleSort = (key: string) => {
		if (!onSortChange) return;
		if (sort?.key === key) onSortChange({ key, desc: !sort.desc });
		else onSortChange({ key, desc: true });
	};

	return (
		<div className={css.scroll}>
			<table className={css.table}>
				{showHeader && (
					<thead>
						<tr>
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
									<th
										key={col.key}
										className={className || undefined}
										style={col.width ? { width: col.width } : undefined}
										onClick={sortable ? () => toggleSort(col.key) : undefined}
									>
										{col.header}
										{arrow}
									</th>
								);
							})}
						</tr>
					</thead>
				)}
				<tbody>
					{rows.map((row, i) => (
						<tr key={rowKey(row, i)}>
							{columns.map((col) => (
								<td
									key={col.key}
									className={cellClass(col as Column<unknown>)}
									style={col.width ? { width: col.width } : undefined}
								>
									{col.cell(row, i)}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
