import { asset } from "../asset";
import { useBootStatus } from "../db/boot";
import * as css from "./Splash.css";

// Full-screen branded boot screen shown while DuckDB-WASM instantiates and any
// OPFS snapshot is restored. Visually mirrors the static splash inlined in
// index.html so the handoff from pre-React markup to React is seamless. The
// phase label comes from the boot store (db/boot.ts), so a multi-second cold
// start reads as progress instead of one frozen word.

export function Splash({ error }: { error?: Error | null }) {
	const status = useBootStatus();
	return (
		<div className={css.root}>
			<img className={css.logo} src={asset("favicon.svg")} alt="" width={56} />
			<h1 className={css.wordmark}>Wrapped</h1>
			{error ? (
				<p className={css.error}>{error.message}</p>
			) : (
				<>
					<div className={css.spinner} aria-hidden="true" />
					<p className={css.label} role="status">
						{status}
					</p>
				</>
			)}
		</div>
	);
}
