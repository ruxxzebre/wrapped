import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import {
	fmtCompletion,
	fmtDate,
	fmtDuration,
	fmtHours,
	fmtInt,
	fmtPct,
	fmtReasonStart,
} from "../format";
import { ArtistLink, BackLink, SpotifyEmbed, SpotifyLink } from "../links";
import { DetailHead, Grid2, Muted, Panel, Status } from "../ui";
import { Breakdown, Cards, HourBars, MonthlyChart } from "../widgets";

export default function TrackDetail({ uri }: { uri: string }) {
	const { data, error } = useQuery({
		queryKey: ["track", uri],
		queryFn: () => api.track(uri),
	});
	if (!data) return <Status error={error} />;

	const cards = [
		{ label: "plays", value: fmtInt(data.plays) },
		{ label: "hours", value: fmtHours(data.hours) },
		{ label: "skip rate", value: fmtPct(data.skip_ratio) },
		{
			label: "length",
			value: data.max_ms ? fmtDuration(data.max_ms) : "—",
			sub: "longest play",
		},
		{
			label: "rank",
			value: data.rank_plays ? `#${fmtInt(data.rank_plays)}` : "—",
			sub: "by plays, lifetime",
		},
		{
			label: "first heard",
			value: fmtDate(data.first_play),
			sub: `latest ${fmtDate(data.last_play)}`,
		},
	];

	return (
		<>
			<DetailHead
				back={<BackLink />}
				title={data.name}
				sub={
					<>
						<ArtistLink name={data.artist} /> · <Muted>{data.album}</Muted>
					</>
				}
				action={<SpotifyLink uri={uri} />}
			/>

			<Cards items={cards} />

			<SpotifyEmbed uri={uri} />

			<Panel title="Plays per month">
				<MonthlyChart data={data.monthly} metric="plays" />
			</Panel>

			<Panel title="When you play it (hour of day)">
				<HourBars data={data.hourly} />
			</Panel>

			<Grid2>
				<Breakdown
					title="Completion"
					rows={data.completion}
					fmtLabel={fmtCompletion}
				/>
				<Breakdown
					title="How it starts"
					rows={data.reason_start}
					fmtLabel={fmtReasonStart}
				/>
			</Grid2>

			<Breakdown title="Platforms" rows={data.platforms} />
		</>
	);
}
