import { useQuery } from "@tanstack/react-query";
import { fmtDate, fmtDuration, fmtHours, fmtInt, fmtPct } from "../format";
import { tEnum, useT } from "../i18n";
import { ArtistLink, BackLink, SpotifyEmbed, SpotifyLink } from "../links";
import { q } from "../queries";
import { DetailHead, Grid2, Muted, Panel, Status } from "../ui";
import { Breakdown, Cards, HourBars, MonthlyChart } from "../widgets";

export default function TrackDetail({ uri }: { uri: string }) {
	const t = useT();
	const { data, error } = useQuery(q.track(uri));
	if (!data) return <Status error={error} />;

	const cards = [
		{ label: t("card.plays"), value: fmtInt(data.plays) },
		{ label: t("card.hours"), value: fmtHours(data.hours) },
		{ label: t("detail.skipRate"), value: fmtPct(data.skip_ratio) },
		{
			label: t("detail.length"),
			value: data.max_ms ? fmtDuration(data.max_ms) : t("common.dash"),
			sub: t("detail.longestPlay"),
		},
		{
			label: t("detail.rank"),
			value: data.rank_plays ? `#${fmtInt(data.rank_plays)}` : t("common.dash"),
			sub: t("detail.byPlaysLifetime"),
		},
		{
			label: t("detail.firstHeard"),
			value: fmtDate(data.first_play),
			sub: t("summary.latest", { date: fmtDate(data.last_play) }),
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

			<Panel title={t("track.playsPerMonth")}>
				<MonthlyChart data={data.monthly} metric="plays" />
			</Panel>

			<Panel title={t("track.whenYouPlay")}>
				<HourBars data={data.hourly} />
			</Panel>

			<Grid2>
				<Breakdown
					title={t("track.completion")}
					rows={data.completion}
					fmtLabel={(l) => tEnum(t, "completion", l)}
				/>
				<Breakdown
					title={t("track.howItStarts")}
					rows={data.reason_start}
					fmtLabel={(l) => tEnum(t, "reasonStart", l)}
				/>
			</Grid2>

			<Breakdown title={t("track.platforms")} rows={data.platforms} />
		</>
	);
}
