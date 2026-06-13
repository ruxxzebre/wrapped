import { useT } from "../i18n";
import * as css from "./Status.css";

export function Status({
	error,
	label,
}: {
	error?: Error | null;
	label?: string;
}) {
	const t = useT();
	if (error)
		return <div className={`${css.status} ${css.error}`}>{error.message}</div>;
	return <div className={css.status}>{label ?? t("status.loading")}</div>;
}
