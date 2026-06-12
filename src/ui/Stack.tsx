import type { CSSProperties, ReactNode } from "react";
import * as css from "./Stack.css";
import type { Gap } from "./types";

type FlexProps = {
	gap?: Gap;
	align?: "start" | "center" | "end";
	wrap?: boolean;
	style?: CSSProperties;
	children: ReactNode;
};

function cx(...parts: (string | false | undefined)[]) {
	return parts.filter(Boolean).join(" ");
}

export function Row({ gap = "md", align, wrap, style, children }: FlexProps) {
	return (
		<div
			className={cx(
				css.row,
				css.gap[gap],
				align && css.align[align],
				wrap && css.wrap,
			)}
			style={style}
		>
			{children}
		</div>
	);
}

export function Stack({ gap = "md", align, wrap, style, children }: FlexProps) {
	return (
		<div
			className={cx(
				css.stack,
				css.gap[gap],
				align && css.align[align],
				wrap && css.wrap,
			)}
			style={style}
		>
			{children}
		</div>
	);
}
