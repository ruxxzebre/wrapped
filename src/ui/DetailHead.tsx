import type { ReactNode } from "react";
import * as css from "./DetailHead.css";

export function DetailHead({
	title,
	sub,
	back,
	action,
}: {
	title: ReactNode;
	sub?: ReactNode;
	back?: ReactNode;
	/** Optional control rendered to the right of the title (e.g. an action button). */
	action?: ReactNode;
}) {
	return (
		<div className={css.head}>
			{back != null && <div className={css.back}>{back}</div>}
			<div className={css.row}>
				<div>
					<h1 className={css.title}>{title}</h1>
					{sub != null && <div className={css.sub}>{sub}</div>}
				</div>
				{action != null && <div className={css.action}>{action}</div>}
			</div>
		</div>
	);
}

// Standalone title for layouts that place it inside their own header row
// (e.g. YearReview's prev/next navigation).
export function DetailTitle({ children }: { children: ReactNode }) {
	return <h1 className={`${css.title}`}>{children}</h1>;
}
