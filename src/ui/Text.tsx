import type { ReactNode } from "react";
import * as css from "./Text.css";

export function Muted({
	size,
	children,
}: {
	size?: "sm" | "md" | "base";
	children: ReactNode;
}) {
	return (
		<span className={size ? `${css.muted} ${css.mutedSize[size]}` : css.muted}>
			{children}
		</span>
	);
}
