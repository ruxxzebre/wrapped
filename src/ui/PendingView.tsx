import * as css from "./PendingView.css";

// Router defaultPendingComponent: a top-of-viewport progress bar shown while a
// lazy route chunk (and its loader) resolves. Mirrors App's RouteProgress so the
// boot splash → first view handoff shows the same cool sweep instead of a black
// gap or a centered spinner.
export function PendingView() {
	return <div className={css.bar} aria-hidden="true" />;
}
