import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { Metric, Period } from "../api";
import { MetricToggle, WindowPicker } from "../controls";
import { fmtInt } from "../format";
import { useT } from "../i18n";
import { ArtistLink, TrackLink } from "../links";
import { type CompareTop, q } from "../queries";
import {
	type Column,
	ControlsBar,
	DataTable,
	Delta,
	Field,
	Muted,
	Panel,
	palette,
	Row,
	Status,
	ToggleGroup,
} from "../ui";

type Entity = "artists" | "tracks";

type Joined = {
	key: string;
	name: string;
	artist?: string;
	uri?: string;
	rankA: number | null;
	rankB: number | null;
	valueA: number;
	valueB: number;
};

export default function Compare() {
	const t = useT();
	const { data: summary } = useQuery(q.summary());
	const [metric, setMetric] = useState<Metric>("plays");
	const [entity, setEntity] = useState<Entity>("artists");
	// A user-picked window overrides the default; until then each side derives
	// its default (earliest vs latest year) from the summary during render.
	const [aPicked, setA] = useState<Period | null>(null);
	const [bPicked, setB] = useState<Period | null>(null);
	const years = (summary?.years ?? []).map((y) => y.year).sort((x, y) => x - y);
	const a: Period = aPicked ?? (years.length >= 2 ? yearWindow(years[0]) : {});
	const b: Period =
		bPicked ?? (years.length >= 2 ? yearWindow(years[years.length - 1]) : {});

	const qA = useQuery({
		...q.compareTop(entity, metric, a),
		placeholderData: (p) => p,
	});
	const qB = useQuery({
		...q.compareTop(entity, metric, b),
		placeholderData: (p) => p,
	});

	const rows = useMemo(
		() => join(qA.data ?? [], qB.data ?? [], metric),
		[qA.data, qB.data, metric],
	);

	const unit = metric === "plays" ? t("unit.plays") : t("unit.hrs");
	const columns = useMemo<Column<Joined>[]>(
		() => [
			{
				key: "name",
				header: entity === "artists" ? t("col.artist") : t("col.track"),
				cell: (r) => (
					<>
						{r.uri ? (
							<TrackLink uri={r.uri} name={r.name} />
						) : (
							<ArtistLink name={r.name} />
						)}
						{r.artist && <Muted size="md"> · {r.artist}</Muted>}
					</>
				),
			},
			{
				key: "rankA",
				header: t("col.aRank"),
				align: "right",
				muted: true,
				cell: (r) => r.rankA ?? t("common.dash"),
			},
			{
				key: "rankB",
				header: t("col.bRank"),
				align: "right",
				muted: true,
				cell: (r) => r.rankB ?? t("common.dash"),
			},
			{
				key: "move",
				header: t("col.move"),
				align: "right",
				cell: (r) => <Delta rank={r.rankB} prevRank={r.rankA} />,
			},
			{
				key: "valueA",
				header: t("col.aValue", { unit }),
				align: "right",
				cell: (r) => fmtInt(Math.round(r.valueA)),
			},
			{
				key: "valueB",
				header: t("col.bValue", { unit }),
				align: "right",
				cell: (r) => fmtInt(Math.round(r.valueB)),
			},
		],
		[entity, unit, t],
	);

	return (
		<>
			<ControlsBar>
				<Field label={t("compare.compare")}>
					<ToggleGroup
						options={[
							{ value: "artists", label: t("compare.artists") },
							{ value: "tracks", label: t("compare.tracks") },
						]}
						value={entity}
						onChange={setEntity}
					/>
				</Field>
				<MetricToggle value={metric} onChange={setMetric} />
			</ControlsBar>

			<Row gap="xl" wrap style={{ marginBottom: "1rem" }}>
				<WindowGroup tag="A" value={a} onChange={setA} />
				<WindowGroup tag="B" value={b} onChange={setB} />
			</Row>

			{!qA.data || !qB.data ? (
				<Status error={qA.error ?? qB.error} />
			) : (
				<Panel>
					<DataTable rows={rows} columns={columns} rowKey={(r) => r.key} />
				</Panel>
			)}
		</>
	);
}

function WindowGroup({
	tag,
	value,
	onChange,
}: {
	tag: string;
	value: Period;
	onChange: (p: Period) => void;
}) {
	return (
		<Row gap="md" align="end" wrap>
			<strong
				style={{
					color: palette.accent,
					fontSize: "0.9rem",
					alignSelf: "center",
				}}
			>
				{tag}
			</strong>
			<WindowPicker value={value} onChange={onChange} />
		</Row>
	);
}

const yearWindow = (y: number): Period => ({
	from: `${y}-01-01`,
	to: `${y}-12-31`,
});

function join(
	aRows: CompareTop[],
	bRows: CompareTop[],
	metric: Metric,
): Joined[] {
	const val = (t: CompareTop) => (metric === "plays" ? t.plays : t.hours);
	const aMap = new Map(aRows.map((t, i) => [t.key, { t, rank: i + 1 }]));
	const bMap = new Map(bRows.map((t, i) => [t.key, { t, rank: i + 1 }]));
	const keys = new Set([...aMap.keys(), ...bMap.keys()]);

	const out: Joined[] = [];
	for (const key of keys) {
		const A = aMap.get(key);
		const B = bMap.get(key);
		const hit = B ?? A;
		if (!hit) continue;
		const src = hit.t;
		out.push({
			key,
			name: src.name,
			artist: src.artist,
			uri: src.uri,
			rankA: A?.rank ?? null,
			rankB: B?.rank ?? null,
			valueA: A ? val(A.t) : 0,
			valueB: B ? val(B.t) : 0,
		});
	}
	// Present-in-B first (by B rank), then entries that dropped out of B.
	return out.sort(
		(x, y) =>
			(x.rankB ?? 1e9) - (y.rankB ?? 1e9) ||
			(x.rankA ?? 1e9) - (y.rankA ?? 1e9),
	);
}
