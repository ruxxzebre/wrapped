import { useQueryClient } from "@tanstack/react-query";
import { type DragEvent, useRef, useState } from "react";
import { api } from "../api";
import { asset } from "../asset";
import { fillNodes, useT } from "../i18n";
import { navigate } from "../router";
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

// Images for the export walkthrough; the copy is translated per step at render.
const STEP_IMAGES = [
	asset("steps/step_1.png"),
	asset("steps/step_2.png"),
	asset("steps/step_3.png"),
	undefined,
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
	const t = useT();
	const qc = useQueryClient();
	const inputRef = useRef<HTMLInputElement>(null);
	const [phase, setPhase] = useState<Phase>({ kind: "idle" });
	const [dragging, setDragging] = useState(false);
	const [showTutorial, setShowTutorial] = useState(false);

	const steps = STEP_IMAGES.map((img, i) => ({
		img,
		title: t(`import.step${i + 1}Title` as "import.step1Title"),
		text: t(`import.step${i + 1}Text` as "import.step1Text"),
	}));

	const busy = phase.kind === "uploading" || phase.kind === "ingesting";

	async function importFile(file: File) {
		if (!isZip(file)) {
			setPhase({ kind: "error", message: t("import.errZip") });
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
			// Fresh data deserves a fresh read: always send the user to Story
			// first, regardless of which URL the import was triggered from.
			navigate("/story");
			setPhase({ kind: "done" });
		} catch (err) {
			setPhase({
				kind: "error",
				message: err instanceof Error ? err.message : t("import.errFailed"),
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
			<h1 className={css.heading}>{t("import.getData")}</h1>
			<ol className={css.steps}>
				{steps.map((step, i) => (
					<li key={step.title} className={css.step}>
						{step.img && (
							<img
								className={css.stepImg}
								src={step.img}
								alt={t("import.stepAlt", { n: i + 1, title: step.title })}
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
				← {t("import.backToUpload")}
			</button>
		</div>
	);

	const body = (
		<div className={css.card}>
			{variant === "welcome" ? (
				<>
					<h1 className={css.heading}>{t("import.welcomeTitle")}</h1>
					<p className={css.lede}>
						{fillNodes(t("import.welcomeLede"), {
							file: <strong>my_spotify_data.zip</strong>,
						})}
					</p>
				</>
			) : (
				<p className={css.lede}>{t("import.reimportLede")}</p>
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
							{t("import.reading", { pct: Math.round(phase.fraction * 100) })}
						</p>
					</>
				) : phase.kind === "ingesting" ? (
					<p className={css.working}>{t("import.importing")}</p>
				) : phase.kind === "done" ? (
					<>
						<span className={css.dropIcon} aria-hidden="true">
							✓
						</span>
						<span>{t("import.complete")}</span>
						<p className={css.hint}>{t("import.dropAnother")}</p>
					</>
				) : (
					<>
						<span className={css.dropIcon} aria-hidden="true">
							⬆
						</span>
						<span>{t("import.dropHere")}</span>
						<p className={css.hint}>{t("import.onlyZip")}</p>
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
					{t("import.learnHow")}
				</button>
			)}

			{variant === "reimport" && phase.kind === "idle" && (
				<p className={css.warnText}>⚠ {t("import.reimportWarn")}</p>
			)}

			<p className={css.privacy}>
				<span className={css.privacyIcon} aria-hidden="true">
					🔒
				</span>
				<span>
					{fillNodes(t("import.privacy"), {
						emph: <strong>{t("import.privacyEmph")}</strong>,
					})}
				</span>
			</p>

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
