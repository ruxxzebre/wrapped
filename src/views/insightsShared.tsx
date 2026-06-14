import type { ReactNode } from "react";
import { Muted, Panel } from "../ui";
import * as css from "./insightsShared.css";

// A titled panel with an explanatory lede line above its body. Every §15–§25
// insight is one of these, so the framing copy and spacing stay consistent.
export function Section({
	title,
	lede,
	children,
}: {
	title: string;
	lede?: string;
	children: ReactNode;
}) {
	return (
		<Panel title={title}>
			{lede != null && (
				<p className={css.lede}>
					<Muted size="sm">{lede}</Muted>
				</p>
			)}
			{children}
		</Panel>
	);
}
