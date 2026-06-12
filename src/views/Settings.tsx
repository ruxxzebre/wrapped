import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { recreateListensView } from "../db/lifecycle";
import { setSetting, useSetting } from "../settings";
import { Muted, Panel, Select, Stack } from "../ui";
import * as css from "./Settings.css";

const TIMEZONES = Intl.supportedValuesOf("timeZone");

export default function Settings() {
	const showPlayer = useSetting("showPlayer");
	const timezone = useSetting("timezone");
	const qc = useQueryClient();
	const [tzBusy, setTzBusy] = useState(false);

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
		</Stack>
	);
}
