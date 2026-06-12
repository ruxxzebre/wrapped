import type { ReactNode } from "react";
import * as css from "./Panel.css";

export function Panel({
	title,
	children,
}: {
	title?: ReactNode;
	children: ReactNode;
}) {
	return (
		<div className={css.panel}>
			{title != null && <h2 className={css.title}>{title}</h2>}
			{children}
		</div>
	);
}
