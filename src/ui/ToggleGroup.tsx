import type { ReactNode } from "react";
import * as css from "./ToggleGroup.css";

export function ToggleGroup<V extends string>({
	options,
	value,
	onChange,
}: {
	options: { value: V; label: ReactNode }[];
	value: V;
	onChange: (v: V) => void;
}) {
	return (
		<span className={css.group}>
			{options.map((o) => (
				<button
					type="button"
					key={o.value}
					className={
						o.value === value ? `${css.option} ${css.active}` : css.option
					}
					onClick={() => onChange(o.value)}
				>
					{o.label}
				</button>
			))}
		</span>
	);
}
