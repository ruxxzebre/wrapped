import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api, type DayCount } from "../api";
import { fmtHours, fmtInt } from "../format";
import { navigate } from "../router";
import { ControlsBar, Field, Panel, Select, Status } from "../ui";
import * as css from "./Calendar.css";

// GitHub-style contribution grid: weeks as columns, weekdays as rows, day
// cells shaded by hours listened. Click a day → Play Log filtered to it.

const CELL = 11;
const GAP = 3;
const STEP = CELL + GAP;
const TOP = 18; // room for month labels
const LEFT = 28; // room for weekday labels
const LEVELS = ["#242424", "#14502c", "#15883e", "#1db954", "#1ed760"];
const MONTHS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];

const WEEK_MS = 7 * 86400000;
const ymd = (d: Date) => d.toISOString().slice(0, 10);
const mondayIdx = (d: Date) => (d.getUTCDay() + 6) % 7; // Mon=0 … Sun=6

function level(hours: number, max: number): number {
	if (hours <= 0) return 0;
	if (max <= 0) return 1;
	const r = hours / max;
	if (r > 0.66) return 4;
	if (r > 0.33) return 3;
	if (r > 0.1) return 2;
	return 1;
}

export default function Calendar() {
	const { data: summary } = useQuery({
		queryKey: ["summary"],
		queryFn: api.summary,
	});
	const years = (summary?.years ?? []).map((y) => y.year).sort((a, b) => b - a);
	const [year, setYear] = useState<number | null>(null);
	const selected = year ?? years[0] ?? null;

	const { data, error } = useQuery({
		queryKey: ["calendar", selected],
		queryFn: () => api.calendar(selected ?? undefined),
		enabled: selected !== null || years.length === 0,
		placeholderData: (prev) => prev,
	});

	if (!data) return <Status error={error} />;
	return (
		<>
			<ControlsBar>
				<Field label="year">
					<Select
						value={data.year}
						onChange={(e) => setYear(Number(e.target.value))}
					>
						{years.map((y) => (
							<option key={y} value={y}>
								{y}
							</option>
						))}
					</Select>
				</Field>
			</ControlsBar>
			<Heatmap year={data.year} days={data.days} />
		</>
	);
}

function Heatmap({ year, days }: { year: number; days: DayCount[] }) {
	const byDate = useMemo(() => new Map(days.map((d) => [d.date, d])), [days]);
	const maxHours = useMemo(
		() => days.reduce((m, d) => Math.max(m, d.hours), 0),
		[days],
	);
	const totalHours = useMemo(
		() => days.reduce((s, d) => s + d.hours, 0),
		[days],
	);

	const { cells, cols, monthLabels } = useMemo(() => {
		const jan1 = new Date(Date.UTC(year, 0, 1));
		const dec31 = new Date(Date.UTC(year, 11, 31));
		const start = new Date(jan1);
		start.setUTCDate(jan1.getUTCDate() - mondayIdx(jan1));

		const cells: { date: string; col: number; row: number; day?: DayCount }[] =
			[];
		for (
			let d = new Date(start);
			d <= dec31;
			d.setUTCDate(d.getUTCDate() + 1)
		) {
			if (d < jan1) continue;
			const col = Math.floor((+d - +start) / WEEK_MS);
			cells.push({
				date: ymd(d),
				col,
				row: mondayIdx(d),
				day: byDate.get(ymd(d)),
			});
		}
		const cols = Math.floor((+dec31 - +start) / WEEK_MS) + 1;
		const monthLabels = MONTHS.map((label, m) => {
			const first = Date.UTC(year, m, 1);
			return { label, col: Math.floor((first - +start) / WEEK_MS) };
		});
		return { cells, cols, monthLabels };
	}, [year, byDate]);

	const width = LEFT + cols * STEP;
	const height = TOP + 7 * STEP;

	return (
		<Panel>
			<div className={css.summary}>
				<span>
					<strong>{fmtHours(totalHours)}</strong> hours over{" "}
					<strong>{fmtInt(days.length)}</strong> active days in {year}
				</span>
				<span className={css.legend}>
					less
					{LEVELS.map((c) => (
						<span key={c} className={css.swatch} style={{ background: c }} />
					))}
					more
				</span>
			</div>
			<div className={css.scroll}>
				<svg width={width} height={height} className={css.svg}>
					<title>Listening activity by day</title>
					{monthLabels.map((m) => (
						<text
							key={m.label}
							x={LEFT + m.col * STEP}
							y={12}
							className={css.monthLabel}
						>
							{m.label}
						</text>
					))}
					{["Mon", "Wed", "Fri"].map((d, i) => (
						<text
							key={d}
							x={0}
							y={TOP + (i * 2 + 1) * STEP - 2}
							className={css.monthLabel}
						>
							{d}
						</text>
					))}
					{cells.map((c) => {
						const hours = c.day?.hours ?? 0;
						const plays = c.day?.plays ?? 0;
						return (
							// biome-ignore lint/a11y/noStaticElementInteractions: SVG day cell; same pattern as the sortable VirtualTable headers
							<rect
								key={c.date}
								x={LEFT + c.col * STEP}
								y={TOP + c.row * STEP}
								width={CELL}
								height={CELL}
								rx={2}
								fill={LEVELS[level(hours, maxHours)]}
								className={plays ? `${css.cell} ${css.cellActive}` : css.cell}
								onClick={
									plays
										? () => navigate(`/play-log?from=${c.date}&to=${c.date}`)
										: undefined
								}
							>
								<title>
									{c.date}:{" "}
									{plays
										? `${fmtInt(plays)} plays · ${fmtHours(hours)} h`
										: "no plays"}
								</title>
							</rect>
						);
					})}
				</svg>
			</div>
		</Panel>
	);
}
