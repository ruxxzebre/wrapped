import * as css from "./Status.css";

export function Status({
	error,
	label = "loading…",
}: {
	error?: Error | null;
	label?: string;
}) {
	if (error)
		return <div className={`${css.status} ${css.error}`}>{error.message}</div>;
	return <div className={css.status}>{label}</div>;
}
