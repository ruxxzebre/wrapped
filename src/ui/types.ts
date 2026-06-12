import type { ReactNode } from "react";

export type Align = "left" | "right";
export type Gap = "xs" | "sm" | "md" | "lg" | "xl";

export type Sort = { key: string; desc: boolean };

export type Column<T> = {
	key: string;
	header: ReactNode;
	/** "right" renders tabular-nums, right-aligned (legacy .num). */
	align?: Align;
	/** Fixed cell width, e.g. "2rem" for a rank column. */
	width?: string;
	/** Render the whole cell in the muted text color. */
	muted?: boolean;
	/** Header is clickable; requires controlled sort/onSortChange on the table. */
	sortable?: boolean;
	cell: (row: T, index: number) => ReactNode;
};

/** VirtualTable column: `size` is a grid-template-columns fragment. */
export type VColumn<T> = Column<T> & { size: string };
