import * as css from "./PageHeader.css";

// Gradient page banner, rendered by the app shell above the routed view.
export function PageHeader({
	title,
	tint = "neutral",
}: {
	title: string;
	tint?: css.Tint;
}) {
	return (
		<header className={css.header[tint]}>
			<div className={css.inner}>
				<h1 className={css.title}>{title}</h1>
			</div>
		</header>
	);
}
