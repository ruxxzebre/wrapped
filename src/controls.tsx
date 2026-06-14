import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import type { Metric, Period } from "./api";
import { useT } from "./i18n";
import { q } from "./queries";
import { Field, Input, Select, ToggleGroup } from "./ui";

export function MetricToggle({
	value,
	onChange,
}: {
	value: Metric;
	onChange: (m: Metric) => void;
}) {
	const t = useT();
	return (
		<Field label={t("controls.rankBy")}>
			<ToggleGroup
				options={[
					{ value: "plays", label: t("metric.plays") },
					{ value: "ms", label: t("metric.time") },
				]}
				value={value}
				onChange={onChange}
			/>
		</Field>
	);
}

function windowForYear(year: number): Period {
	return { from: `${year}-01-01`, to: `${year}-12-31` };
}

function matchYear(value: Period): number | null {
	const m = value.from?.match(/^(\d{4})-01-01$/);
	if (m && value.to === `${m[1]}-12-31`) return Number(m[1]);
	return null;
}

export function WindowPicker({
	value,
	onChange,
}: {
	value: Period;
	onChange: (p: Period) => void;
}) {
	const t = useT();
	const { data: summary } = useQuery(q.summary());
	const years = (summary?.years ?? []).map((y) => y.year).sort((a, b) => b - a);

	const isAll = !value.from && !value.to;
	const year = matchYear(value);
	const preset = isAll ? "all" : year !== null ? String(year) : "custom";

	// When no explicit bound is set the date inputs would render blank, which
	// reads as broken. Fall back to the dataset's earliest play / today so the
	// fields always show the range they actually cover.
	const earliest = summary?.first_play?.slice(0, 10) ?? "";
	const today = new Date().toISOString().slice(0, 10);

	return (
		<>
			<Field label={t("controls.period")}>
				<Select
					value={preset}
					onChange={(e) => {
						const v = e.target.value;
						if (v === "all") onChange({});
						else if (v !== "custom") onChange(windowForYear(Number(v)));
					}}
				>
					<option value="all">{t("period.all")}</option>
					{years.map((y) => (
						<option key={y} value={y}>
							{y}
						</option>
					))}
					<option value="custom" disabled={preset !== "custom"}>
						{t("period.custom")}
					</option>
				</Select>
			</Field>
			<Field label={t("controls.from")}>
				<Input
					type="date"
					value={value.from ?? earliest}
					onChange={(e) =>
						onChange({ ...value, from: e.target.value || undefined })
					}
				/>
			</Field>
			<Field label={t("controls.to")}>
				<Input
					type="date"
					value={value.to ?? today}
					onChange={(e) =>
						onChange({ ...value, to: e.target.value || undefined })
					}
				/>
			</Field>
		</>
	);
}

// Number input that tolerates being cleared: while focused it shows the raw
// draft (possibly empty) and only commits parseable values; on blur it snaps
// back to the last committed value instead of coercing the empty string to 0.
export function NumberInput({
	value,
	onCommit,
	min,
	width,
}: {
	value: number;
	onCommit: (n: number) => void;
	min?: number;
	width?: string;
}) {
	const [draft, setDraft] = useState<string | null>(null);
	const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	// Cancel a pending debounced commit if the input unmounts mid-edit.
	useEffect(() => () => clearTimeout(timer.current), []);

	const parse = (s: string): number | null => {
		if (s === "") return null;
		const n = Number(s);
		if (!Number.isFinite(n) || (min !== undefined && n < min)) return null;
		return n;
	};

	return (
		<Input
			type="number"
			min={min}
			value={draft ?? String(value)}
			onFocus={() => setDraft(String(value))}
			onChange={(e) => {
				const s = e.target.value;
				setDraft(s);
				clearTimeout(timer.current);
				const n = parse(s);
				if (n !== null && n !== value)
					timer.current = setTimeout(() => onCommit(n), 300);
			}}
			onBlur={() => {
				clearTimeout(timer.current);
				const n = draft === null ? null : parse(draft);
				if (n !== null) onCommit(n);
				setDraft(null);
			}}
			width={width}
		/>
	);
}
