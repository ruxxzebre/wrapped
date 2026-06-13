import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../api";
import { recreateListensView } from "../db/lifecycle";
import { setSetting, useSetting } from "../settings";
import { Button, Modal, Muted, Panel, Select, Stack } from "../ui";
import * as css from "./Settings.css";

const TIMEZONES = Intl.supportedValuesOf("timeZone");

export default function Settings() {
	const showPlayer = useSetting("showPlayer");
	const timezone = useSetting("timezone");
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
			<Panel title="Playback">
				<label className={css.row}>
					<input
						type="checkbox"
						className={css.checkbox}
						checked={showPlayer}
						onChange={(e) => setSetting("showPlayer", e.target.checked)}
					/>
					<span className={css.label}>
						Show embedded Spotify player
						<Muted>
							Renders an in-page player on each track page. Hidden automatically
							when a track isn't available on Spotify.
						</Muted>
					</span>
				</label>
			</Panel>
			<Panel title="Time">
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
						Timezone
						<Muted>
							Hour-of-day, weekday and calendar charts bucket plays in this
							timezone. Defaults to your browser's. Pick the timezone you
							actually lived in if it differs.
						</Muted>
					</span>
				</label>
			</Panel>
			<Panel title="Danger zone">
				<div className={css.dangerRow}>
					<Button
						variant="danger"
						disabled={clearBusy}
						onClick={() => setConfirmClear(true)}
					>
						Clear library
					</Button>
					<span className={css.label}>
						Delete imported data
						<Muted>
							Wipes the database and its saved snapshot, returning you to the
							welcome screen. This can't be undone — you'll need to re-import
							your Spotify export.
						</Muted>
					</span>
				</div>
			</Panel>
			{confirmClear && (
				<Modal onClose={() => !clearBusy && setConfirmClear(false)}>
					<Stack>
						<strong>Clear your library?</strong>
						<Muted>
							This permanently deletes all imported listening data from this
							browser. You can re-import your Spotify export afterwards.
						</Muted>
						<div className={css.modalActions}>
							<Button
								variant="chrome"
								disabled={clearBusy}
								onClick={() => setConfirmClear(false)}
							>
								Cancel
							</Button>
							<Button
								variant="danger"
								disabled={clearBusy}
								onClick={() => void clearLibrary()}
							>
								{clearBusy ? "Clearing…" : "Clear library"}
							</Button>
						</div>
					</Stack>
				</Modal>
			)}
		</Stack>
	);
}
