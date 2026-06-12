import type { ReactNode } from "react";
import * as css from "./Grid.css";

export function Grid2({ children }: { children: ReactNode }) {
	return <div className={css.grid2}>{children}</div>;
}

export function CardGrid({ children }: { children: ReactNode }) {
	return <div className={css.cardGrid}>{children}</div>;
}
