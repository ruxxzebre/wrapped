import { Link } from "@tanstack/react-router";
import type {
	StoryComeback,
	StoryCompanion,
	StoryDevotion,
	StoryFaded,
	StoryMarathon,
	StoryObsession,
	StoryOrigin,
	StoryPersona,
	Summary,
} from "../api";
import { fmtHours, fmtInt } from "../format";
import { fillNodes, type TFunction, useT } from "../i18n";
import * as css from "./Story.css";
import {
	Dissolve,
	Marks,
	Rings,
	Seal,
	Sigil,
	Spiral,
	Throughline,
} from "./Story.motifs";
import { ArtistFoot, Scene } from "./Story.scene";

// A track or artist name woven into a line as an accented link.
function TrackLink({ uri, name }: { uri: string; name: string }) {
	return (
		<Link to="/track/$uri" params={{ uri }} className={css.heroLink}>
			{name}
		</Link>
	);
}

function ArtistLink({ name }: { name: string }) {
	const t = useT();
	if (!name || name === "?")
		return <span className={css.hero}>{t("links.unknownArtist")}</span>;
	return (
		<Link to="/artist/$name" params={{ name }} className={css.heroLink}>
			{name}
		</Link>
	);
}

// Each beat owns its null guard, copy, motif and links, and takes only the slice
// of the story it narrates. A beat with no data renders nothing; `Story` just
// lists them in narrative order. Adding a beat means writing one component here
// and dropping it into that list.

// Origin: the very first play — where it all began.
export function OriginBeat({ data }: { data: StoryOrigin | null }) {
	const t = useT();
	if (!data) return null;
	const years = new Date().getFullYear() - Number(data.date.slice(0, 4));
	return (
		<Scene
			eyebrow={t("story.origin.eyebrow")}
			glow="rgba(29,185,84,0.16)"
			motif={<Rings />}
			line={fillNodes(t("story.origin.line", { date: data.date }), {
				track: (
					<Link
						to="/track/$uri"
						params={{ uri: data.track_uri }}
						className={css.heroLink}
					>
						{data.name}
					</Link>
				),
				weekday: <span className={css.hero}>{data.weekday}</span>,
			})}
			foot={fillNodes(t("story.origin.foot", { years }), {
				artist: <ArtistFoot name={data.artist} />,
			})}
		/>
	);
}

// Time: the weight of every logged hour. Sourced from the summary, not the story.
export function TimeBeat({ summary }: { summary: Summary | undefined }) {
	const t = useT();
	if (!summary || summary.hours <= 0) return null;
	return (
		<Scene
			eyebrow={t("story.time.eyebrow")}
			glow="rgba(80,140,255,0.16)"
			motif={<Marks />}
			line={fillNodes(
				t("story.time.line", {
					weeks: fmtInt(Math.round(summary.hours / 40)),
				}),
				{
					days: (
						<span className={css.hero}>
							{t("count.days", {
								count: Math.round(summary.hours / 24),
								n: fmtInt(Math.round(summary.hours / 24)),
							})}
						</span>
					),
				},
			)}
			foot={t("story.time.foot", {
				hours: fmtHours(summary.hours),
				year: summary.first_play.slice(0, 4),
			})}
		/>
	);
}

// Persona: a habit fingerprint turned into adjectives.
export function PersonaBeat({ data }: { data: StoryPersona | null }) {
	const t = useT();
	if (!data) return null;
	return (
		<Scene
			eyebrow={t("story.persona.eyebrow")}
			glow="rgba(180,120,255,0.16)"
			motif={<Sigil p={data} />}
			line={<PersonaLine p={data} t={t} />}
			foot={personaFootnote(data, t)}
		/>
	);
}

// Obsession: the single most-repeated track within one day.
export function ObsessionBeat({ data }: { data: StoryObsession | null }) {
	const t = useT();
	if (!data) return null;
	return (
		<Scene
			eyebrow={t("story.obsession.eyebrow")}
			glow="rgba(255,164,43,0.16)"
			motif={<Spiral n={data.plays} />}
			line={fillNodes(t("story.obsession.line"), {
				track: (
					<Link
						to="/track/$uri"
						params={{ uri: data.track_uri }}
						className={css.heroLink}
					>
						{data.name}
					</Link>
				),
				times: (
					<span className={css.hero}>
						{t("story.obsession.times", {
							count: data.plays,
							n: fmtInt(data.plays),
						})}
					</span>
				),
			})}
			foot={fillNodes(t("story.obsession.foot", { date: data.date }), {
				artist: <ArtistFoot name={data.artist} />,
			})}
		/>
	);
}

// Faded: a track you leaned on hard and then let go of.
export function FadedBeat({ data }: { data: StoryFaded | null }) {
	const t = useT();
	if (!data) return null;
	return (
		<Scene
			eyebrow={t("story.faded.eyebrow")}
			glow="rgba(241,94,108,0.14)"
			motif={<Dissolve />}
			line={fillNodes(
				t("story.faded.line", { since: data.last_play.slice(0, 4) }),
				{
					track: (
						<Link
							to="/track/$uri"
							params={{ uri: data.track_uri }}
							className={css.heroLink}
						>
							{data.name}
						</Link>
					),
					peak: <span className={css.hero}>{data.peak_year}</span>,
				},
			)}
			foot={fillNodes(t("story.faded.foot", { plays: fmtInt(data.plays) }), {
				artist: <ArtistFoot name={data.artist} />,
			})}
		/>
	);
}

// Crossroads: the midpoint breather. Always renders. Invites the reader to keep
// swiping for the rest of the story, or step out to the Summary / Insights.
export function CrossroadsBeat() {
	const t = useT();
	return (
		<Scene
			eyebrow={t("story.crossroads.eyebrow")}
			glow="rgba(80,140,255,0.16)"
			motif={<Marks />}
			line={fillNodes(t("story.crossroads.line"), {
				more: <span className={css.hero}>{t("story.crossroads.more")}</span>,
			})}
			foot={fillNodes(t("story.crossroads.foot"), {
				summary: (
					<Link to="/" className={css.heroLink}>
						{t("story.crossroads.summary")}
					</Link>
				),
				insights: (
					<Link to="/insights" className={css.heroLink}>
						{t("story.crossroads.insights")}
					</Link>
				),
			})}
		/>
	);
}

// Companion: the artist who stayed across the widest span of years.
export function CompanionBeat({ data }: { data: StoryCompanion | null }) {
	const t = useT();
	if (!data) return null;
	return (
		<Scene
			eyebrow={t("story.companion.eyebrow")}
			glow="rgba(29,185,84,0.16)"
			motif={<Throughline />}
			line={fillNodes(t("story.companion.line"), {
				artist: <ArtistLink name={data.artist} />,
				years: (
					<span className={css.hero}>
						{t("count.years", { count: data.years, n: fmtInt(data.years) })}
					</span>
				),
			})}
			foot={t("story.companion.foot", {
				plays: t("count.plays", { count: data.plays, n: fmtInt(data.plays) }),
				firstYear: data.first_year,
			})}
		/>
	);
}

// Comeback: a track you let go quiet, then couldn't stop again.
export function ComebackBeat({ data }: { data: StoryComeback | null }) {
	const t = useT();
	if (!data) return null;
	const months = Math.max(1, Math.round(data.gap_days / 30));
	return (
		<Scene
			eyebrow={t("story.comeback.eyebrow")}
			glow="rgba(120,200,150,0.15)"
			motif={<Spiral n={data.plays_30d} />}
			line={fillNodes(t("story.comeback.line"), {
				track: <TrackLink uri={data.track_uri} name={data.name} />,
				gap: (
					<span className={css.hero}>
						{t("count.months", { count: months, n: fmtInt(months) })}
					</span>
				),
			})}
			foot={fillNodes(
				t("story.comeback.foot", {
					date: data.date,
					plays: t("count.plays", {
						count: data.plays_30d,
						n: fmtInt(data.plays_30d),
					}),
				}),
				{ artist: <ArtistFoot name={data.artist} /> },
			)}
		/>
	);
}

// Marathon: your single most-consumed day.
export function MarathonBeat({ data }: { data: StoryMarathon | null }) {
	const t = useT();
	if (!data) return null;
	const hours = Math.round(data.hours);
	return (
		<Scene
			eyebrow={t("story.marathon.eyebrow")}
			glow="rgba(255,130,70,0.15)"
			motif={<Marks />}
			line={fillNodes(t("story.marathon.line", { date: data.date }), {
				hours: (
					<span className={css.hero}>
						{t("count.hours", { count: hours, n: fmtInt(hours) })}
					</span>
				),
			})}
			foot={fillNodes(
				t("story.marathon.foot", {
					weekday: data.weekday,
					streams: fmtInt(data.streams),
				}),
				{ artist: <ArtistFoot name={data.artist} /> },
			)}
		/>
	);
}

// Devotion: the track you played and played and never once skipped.
export function DevotionBeat({ data }: { data: StoryDevotion | null }) {
	const t = useT();
	if (!data) return null;
	return (
		<Scene
			eyebrow={t("story.devotion.eyebrow")}
			glow="rgba(180,120,255,0.16)"
			motif={<Seal />}
			line={fillNodes(t("story.devotion.line"), {
				track: <TrackLink uri={data.track_uri} name={data.name} />,
				times: (
					<span className={css.hero}>
						{t("count.plays", { count: data.plays, n: fmtInt(data.plays) })}
					</span>
				),
			})}
			foot={fillNodes(
				t("story.devotion.foot", {
					skip: `${Math.round(data.skip_ratio * 100)}%`,
				}),
				{ artist: <ArtistFoot name={data.artist} /> },
			)}
		/>
	);
}

// Closing: the true sign-off. Always renders — hands the reader to the Summary,
// with the Insights as a second door.
export function ClosingBeat() {
	const t = useT();
	return (
		<Scene
			eyebrow={t("story.closing.eyebrow")}
			glow="rgba(29,185,84,0.16)"
			motif={<Rings />}
			line={fillNodes(t("story.closing.line"), {
				summary: <span className={css.hero}>{t("story.closing.summary")}</span>,
			})}
			foot={fillNodes(t("story.closing.foot"), {
				insights: (
					<Link to="/insights" className={css.heroLink}>
						{t("story.closing.insights")}
					</Link>
				),
			})}
			action={
				<Link to="/" className={css.cta}>
					{t("story.closing.cta")}
				</Link>
			}
		/>
	);
}

// --- persona copy -----------------------------------------------------------

// Maps the persona stats to translation keys for each trait; the caller fills
// them into the sentence so word order follows the language.
function describe(p: StoryPersona) {
	const curiosity = p.oneshot_artists / Math.max(1, p.total_artists);
	const loyalty =
		p.loyal_artists >= 20
			? "story.persona.loyal"
			: curiosity > 0.6
				? "story.persona.curious"
				: "story.persona.openMinded";
	const clock =
		p.night_ratio >= 0.35
			? "story.persona.nightOwl"
			: p.night_ratio <= 0.12
				? "story.persona.daytime"
				: "story.persona.allHours";
	const skip =
		p.skip_ratio < 0.08
			? "story.persona.neverSkips"
			: p.skip_ratio < 0.2
				? "story.persona.rarelySkips"
				: "story.persona.skipsHard";
	return { loyalty, clock, skip } as const;
}

function PersonaLine({ p, t }: { p: StoryPersona; t: TFunction }) {
	const { loyalty, clock, skip } = describe(p);
	return fillNodes(
		t("story.persona.line", { loyalty: t(loyalty), skip: t(skip) }),
		{ clock: <span className={css.hero}>{t(clock)}</span> },
	);
}

function personaFootnote(p: StoryPersona, t: TFunction) {
	const pct = (r: number) => `${Math.round(r * 100)}%`;
	return t("story.persona.foot", {
		night: pct(p.night_ratio),
		skip: pct(p.skip_ratio),
		oneshots: fmtInt(p.oneshot_artists),
	});
}
