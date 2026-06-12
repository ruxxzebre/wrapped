import { useQueryClient } from "@tanstack/react-query";
import { type DragEvent, useRef, useState } from "react";
import { api } from "../api";
import { Panel } from "../ui";
import * as css from "./Import.css";

type Phase =
	| { kind: "idle" }
	| { kind: "uploading"; fraction: number }
	| { kind: "ingesting" }
	| { kind: "done" }
	| { kind: "error"; message: string };

function isZip(file: File) {
	return (
		file.name.toLowerCase().endsWith(".zip") || file.type === "application/zip"
	);
}

/**
 * Drag-and-drop importer for a Spotify my_spotify_data.zip export. Used both as
 * the full-screen welcome gate (variant "welcome") shown when no data exists,
 * and as the in-app "Import" tab (variant "reimport") that overwrites the
 * database. Either way the import drops and rebuilds the plays table, so a
 * successful import fully replaces prior data.
 */
export default function Import({
	variant = "reimport",
}: {
	variant?: "welcome" | "reimport";
} = {}) {
	const qc = useQueryClient();
	const inputRef = useRef<HTMLInputElement>(null);
	const [phase, setPhase] = useState<Phase>({ kind: "idle" });
	const [dragging, setDragging] = useState(false);

	const busy = phase.kind === "uploading" || phase.kind === "ingesting";

	async function importFile(file: File) {
		if (!isZip(file)) {
			setPhase({ kind: "error", message: "Please drop a .zip archive." });
			return;
		}
		setPhase({ kind: "uploading", fraction: 0 });
		try {
			await api.importZip(file, (fraction) => {
				// Extraction done; the SQL ingest runs with no further progress.
				if (fraction >= 1) setPhase({ kind: "ingesting" });
				else setPhase({ kind: "uploading", fraction });
			});
			setPhase({ kind: "ingesting" });
			// New data landed — drop every cached query so views refetch, and
			// the status gate (welcome screen) flips to the dashboard. The
			// welcome variant unmounts on that flip; the reimport tab stays
			// mounted, so settle it on an explicit done state.
			await qc.invalidateQueries();
			setPhase({ kind: "done" });
		} catch (err) {
			setPhase({
				kind: "error",
				message: err instanceof Error ? err.message : "Import failed.",
			});
		}
	}

	function onDrop(e: DragEvent) {
		e.preventDefault();
		setDragging(false);
		if (busy) return;
		const file = e.dataTransfer.files[0];
		if (file) void importFile(file);
	}

	const body = (
		<div className={css.card}>
			{variant === "welcome" ? (
				<>
					<h1 className={css.heading}>Welcome to Wrapped</h1>
					<p className={css.lede}>
						No listening history yet. Drop your{" "}
						<strong>my_spotify_data.zip</strong> below to get started — the one
						with the “Spotify Extended Streaming History” folder.
					</p>
				</>
			) : (
				<p className={css.lede}>
					Import a Spotify export to replace everything currently loaded. This
					overwrites your existing data.
				</p>
			)}

			<button
				type="button"
				className={[
					css.dropzone,
					dragging ? css.dropzoneActive : "",
					busy ? css.dropzoneBusy : "",
				]
					.filter(Boolean)
					.join(" ")}
				onClick={() => inputRef.current?.click()}
				onDragOver={(e) => {
					e.preventDefault();
					if (!busy) setDragging(true);
				}}
				onDragLeave={() => setDragging(false)}
				onDrop={onDrop}
				disabled={busy}
			>
				{phase.kind === "uploading" ? (
					<>
						<div className={css.track}>
							<div
								className={css.bar}
								style={{ width: `${Math.round(phase.fraction * 100)}%` }}
							/>
						</div>
						<p className={css.hint}>
							Reading export… {Math.round(phase.fraction * 100)}%
						</p>
					</>
				) : phase.kind === "ingesting" ? (
					<p className={css.working}>
						Importing history… this can take a moment.
					</p>
				) : phase.kind === "done" ? (
					<>
						<span className={css.dropIcon} aria-hidden="true">
							✓
						</span>
						<span>Import complete — your data has been replaced.</span>
						<p className={css.hint}>Drop another archive to import again.</p>
					</>
				) : (
					<>
						<span className={css.dropIcon} aria-hidden="true">
							⬆
						</span>
						<span>Drop my_spotify_data.zip here, or click to choose</span>
						<p className={css.hint}>
							Only the .zip — no need to unzip it first.
						</p>
					</>
				)}
			</button>

			{phase.kind === "error" && (
				<p className={css.errorText}>{phase.message}</p>
			)}
			{variant === "reimport" && phase.kind === "idle" && (
				<p className={css.warnText}>
					⚠ Re-importing replaces all currently loaded data.
				</p>
			)}

			<input
				ref={inputRef}
				type="file"
				accept=".zip,application/zip"
				hidden
				onChange={(e) => {
					const file = e.target.files?.[0];
					if (file) void importFile(file);
					e.target.value = "";
				}}
			/>
		</div>
	);

	if (variant === "welcome") return <div className={css.welcome}>{body}</div>;
	return <Panel>{body}</Panel>;
}
