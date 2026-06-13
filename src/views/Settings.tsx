import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../api";
import { recreateListensView } from "../db/lifecycle";
import { LANGUAGES, useT } from "../i18n";
import { setSetting, useSetting } from "../settings";
import { Button, Modal, Muted, Panel, Select, Stack } from "../ui";
import * as css from "./Settings.css";

const TIMEZONES = Intl.supportedValuesOf("timeZone");

export default function Settings() {
	const t = useT();
	const showPlayer = useSetting("showPlayer");
	const timezone = useSetting("timezone");
	const language = useSetting("language");
	const qc = useQueryClient();
	const [tzBusy, setTzBusy] = useState(false);
	const [confirmClear, setConfirmClear] = useState(false);
	const [clearBusy, setClearBusy] = useState(false);

	// The browser default can be an alias missing from supportedValuesOf.
	const tzOptions = TIMEZONES.includes(timezone)
		? TIMEZONES
		: [timezone, ...TIMEZONES];

	async function changeTimezone(tz: string) {
		setSetting("timezone", tz);
		setTzBusy(true);
		try {
			// Every time-of-day and calendar aggregate depends on started_local,
			// so rebuild the view and drop the whole query cache (staleTime is
			// Infinity — nothing refetches on its own).
			await recreateListensView(tz);
			await qc.invalidateQueries();
		} finally {
			setTzBusy(false);
		}
	}

	async function clearLibrary() {
		setClearBusy(true);
		try {
			await api.clearDatabase();
			// status is now not-ready, so App swaps back to the welcome screen;
			// drop every cached aggregate so nothing stale lingers behind it.
			await qc.invalidateQueries();
		} finally {
			setClearBusy(false);
			setConfirmClear(false);
		}
	}

	return (
		<Stack>
			<Panel title={t("settings.language")}>
				{/* biome-ignore lint/a11y/noLabelWithoutControl: the control is the Select component */}
				<label className={css.row}>
					<Select
						value={language}
						onChange={(e) =>
							setSetting(
								"language",
								e.target.value as (typeof LANGUAGES)[number]["code"] | "auto",
							)
						}
					>
						<option value="auto">{t("settings.languageAuto")}</option>
						{LANGUAGES.map((l) => (
							<option key={l.code} value={l.code}>
								{l.label}
							</option>
						))}
					</Select>
					<span className={css.label}>
						{t("settings.language")}
						<Muted>{t("settings.languageHint")}</Muted>
					</span>
				</label>
			</Panel>
			<Panel title={t("settings.playback")}>
				<label className={css.row}>
					<input
						type="checkbox"
						className={css.checkbox}
						checked={showPlayer}
						onChange={(e) => setSetting("showPlayer", e.target.checked)}
					/>
					<span className={css.label}>
						{t("settings.showPlayer")}
						<Muted>{t("settings.showPlayerHint")}</Muted>
					</span>
				</label>
			</Panel>
			<Panel title={t("settings.time")}>
				{/* biome-ignore lint/a11y/noLabelWithoutControl: the control is the Select component */}
				<label className={css.row}>
					<Select
						value={timezone}
						disabled={tzBusy}
						onChange={(e) => void changeTimezone(e.target.value)}
					>
						{tzOptions.map((tz) => (
							<option key={tz} value={tz}>
								{tz}
							</option>
						))}
					</Select>
					<span className={css.label}>
						{t("settings.timezone")}
						<Muted>{t("settings.timezoneHint")}</Muted>
					</span>
				</label>
			</Panel>
			<Panel title={t("settings.dangerZone")}>
				<div className={css.dangerRow}>
					<Button
						variant="danger"
						disabled={clearBusy}
						onClick={() => setConfirmClear(true)}
					>
						{t("settings.clearLibrary")}
					</Button>
					<span className={css.label}>
						{t("settings.deleteImported")}
						<Muted>{t("settings.clearLibraryHint")}</Muted>
					</span>
				</div>
			</Panel>
			{confirmClear && (
				<Modal onClose={() => !clearBusy && setConfirmClear(false)}>
					<Stack>
						<strong>{t("settings.confirmClearTitle")}</strong>
						<Muted>{t("settings.confirmClearBody")}</Muted>
						<div className={css.modalActions}>
							<Button
								variant="chrome"
								disabled={clearBusy}
								onClick={() => setConfirmClear(false)}
							>
								{t("common.cancel")}
							</Button>
							<Button
								variant="danger"
								disabled={clearBusy}
								onClick={() => void clearLibrary()}
							>
								{clearBusy
									? t("settings.clearing")
									: t("settings.clearLibrary")}
							</Button>
						</div>
					</Stack>
				</Modal>
			)}
		</Stack>
	);
}
