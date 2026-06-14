import * as css from "./PendingView.css";
import { Skeleton } from "./Skeleton";

const CARD_KEYS = ["c1", "c2", "c3", "c4", "c5", "c6"];
const ROW_KEYS = ["r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8"];

// Router defaultPendingComponent: a layout-shaped skeleton shown while a lazy
// route chunk (and its loader) resolves, so the boot splash → first view handoff
// fills in like the app instead of flashing a spinner or floating the footer up.
export function PendingView() {
	return (
		<div className={css.root} aria-busy="true" aria-hidden="true">
			<div className={css.cards}>
				{CARD_KEYS.map((k) => (
					<div key={k} className={css.card}>
						<Skeleton width={52} height={9} />
						<Skeleton width="70%" height={20} />
					</div>
				))}
			</div>
			<div className={css.panel}>
				{ROW_KEYS.map((k) => (
					<div key={k} className={css.row}>
						<Skeleton width={28} height={28} radius={6} />
						<Skeleton width="40%" height={12} />
						<Skeleton width="20%" height={12} style={{ marginLeft: "auto" }} />
					</div>
				))}
			</div>
		</div>
	);
}
