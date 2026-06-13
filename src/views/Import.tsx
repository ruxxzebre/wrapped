import { useQueryClient } from "@tanstack/react-query";
import { type DragEvent, useRef, useState } from "react";
import { api } from "../api";
import { asset } from "../asset";
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

// Walkthrough for requesting and downloading the Spotify export, shown on the
// welcome gate when a first-timer doesn't yet have their my_spotify_data.zip.
const STEPS: { img?: string; title: string; text: string }[] = [
	{
		img: asset("steps/step_1.png"),
		title: "Find your account",
		text: "Go to spotify.com, log in, then open the Account menu in the top-right.",
	},
	{
		img: asset("steps/step_2.png"),
		title: "Open Account privacy",
		text: "In the account settings sidebar, scroll to the Account privacy section.",
	},
	{
		img: asset("steps/step_3.png"),
		title: "Request your data",
		text: "Under “Download your data”, locate Extended streaming history and tick it, untick Account data, then hit Request data.",
	},
	{
		title: "Wait for the email",
		text: "Spotify emails a confirmation link — click it to start the export. After a while (often a few days) they send a download link. Grab the my_spotify_data.zip and drop it here — no need to unzip.",
	},
];

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
	const [showTutorial, setShowTutorial] = useState(false);

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

	const tutorial = (
		<div className={css.card}>
			<h1 className={css.heading}>Get your Spotify data</h1>
			<ol className={css.steps}>
				{STEPS.map((step, i) => (
					<li key={step.title} className={css.step}>
						{step.img && (
							<img
								className={css.stepImg}
								src={step.img}
								alt={`Step ${i + 1}: ${step.title}`}
								loading="lazy"
							/>
						)}
						<div className={css.stepBody}>
							<h2 className={css.stepTitle}>
								<span className={css.stepNum}>{i + 1}</span>
								{step.title}
							</h2>
							<p className={css.stepText}>{step.text}</p>
						</div>
					</li>
				))}
			</ol>
			<button
				type="button"
				className={css.backLink}
				onClick={() => setShowTutorial(false)}
			>
				← Back to upload
			</button>
		</div>
	);

	const body = (
		<div className={css.card}>
			{variant === "welcome" ? (
				<>
					<h1 className={css.heading}>Welcome to Wrapped</h1>
					<p className={css.lede}>
						No listening history yet. Drop your{" "}
						<strong>my_spotify_data.zip</strong> below to get started
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
			{variant === "welcome" && (
				<button
					type="button"
					className={css.tutorialLink}
					onClick={() => setShowTutorial(true)}
				>
					Learn how to load your data from Spotify
				</button>
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

	if (variant === "welcome")
		return <div className={css.welcome}>{showTutorial ? tutorial : body}</div>;
	return <Panel>{body}</Panel>;
}
