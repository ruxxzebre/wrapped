import type { ReactNode } from "react";
import * as css from "./Card.css";

export function Card({
	label,
	value,
	sub,
	valueSize = "lg",
}: {
	label: ReactNode;
	value: ReactNode;
	sub?: ReactNode;
	valueSize?: "md" | "lg";
}) {
	return (
		<div className={css.card}>
			<div className={css.label}>{label}</div>
			<div className={css.value[valueSize]}>{value}</div>
			{sub != null && sub !== "" && <div className={css.sub}>{sub}</div>}
		</div>
	);
}
