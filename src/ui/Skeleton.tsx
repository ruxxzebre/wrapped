import type { CSSProperties } from "react";
import * as css from "./Skeleton.css";

// Generic placeholder block. Compose these to mirror any real layout: pass
// explicit width/height so the skeleton reserves the same space its content
// will, which is what keeps the page from shifting when data arrives. Purely
// decorative, so it's hidden from assistive tech — mark the loading region on
// the container instead (e.g. aria-busy).
export function Skeleton({
	width = "100%",
	height = "1rem",
	radius,
	className,
	style,
}: {
	width?: number | string;
	height?: number | string;
	radius?: number | string;
	className?: string;
	style?: CSSProperties;
}) {
	return (
		<span
			aria-hidden="true"
			className={className ? `${css.base} ${className}` : css.base}
			style={{ width, height, borderRadius: radius, ...style }}
		/>
	);
}
