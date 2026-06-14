import * as css from "./PendingView.css";

// Router defaultPendingComponent: a centered green spinner shown while a lazy
// route chunk (and its loader) resolves. The view's own skeletons take over
// once the chunk lands, so this is just the boot/nav → view handoff.
export function PendingView() {
	return (
		<div className={css.root} aria-busy="true" aria-hidden="true">
			<div className={css.spinner} />
		</div>
	);
}
