import { useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { useCallback } from "react";
import { q } from "../queries";
import {
	ClosingBeat,
	ComebackBeat,
	CompanionBeat,
	CrossroadsBeat,
	DevotionBeat,
	FadedBeat,
	MarathonBeat,
	ObsessionBeat,
	OriginBeat,
	PersonaBeat,
	TimeBeat,
} from "./Story.beats";
import * as css from "./Story.css";
import { useStorySnap } from "./Story.hooks";

// The "story stack": the summary opens with a short, second-person narrative.
// Act one — origin → the weight of those hours → who you are → an obsession →
// what you left behind — then a crossroads breather, then act two — who stayed,
// what came back, your deepest day, what you never skipped — and a sign-off.
// Each beat renders nothing when its data is missing; this orchestrator just
// lists them in narrative order.

const storyApi = getRouteApi("/story");

export default function Story() {
	const { data: story } = useQuery(q.story());
	// Shares the summary cache with the cards below, so this is usually a hit.
	const { data: summary } = useQuery(q.summary());

	// The active scene lives in the URL (?scene=N). We restore it on mount and
	// rewrite it (replacing, not pushing) as the reader moves, so leaving for a
	// track/artist detail and pressing back returns to this exact beat.
	const { scene = 0 } = storyApi.useSearch();
	const navigate = storyApi.useNavigate();
	const onScene = useCallback(
		(i: number) =>
			navigate({ search: i > 0 ? { scene: i } : {}, replace: true }),
		[navigate],
	);
	const stackRef = useStorySnap(!!story, scene, onScene);

	// Hold the whole stack back until the narrative is ready — a half-drawn story
	// is worse than a beat of nothing. The cards below paint their own skeletons.
	if (!story) return null;

	return (
		<div className={css.stack} ref={stackRef}>
			<OriginBeat data={story.origin} />
			<TimeBeat summary={summary} />
			<PersonaBeat data={story.persona} />
			<ObsessionBeat data={story.obsession} />
			<FadedBeat data={story.faded} />
			<CrossroadsBeat />
			<CompanionBeat data={story.companion} />
			<ComebackBeat data={story.comeback} />
			<MarathonBeat data={story.marathon} />
			<DevotionBeat data={story.devotion} />
			<ClosingBeat />
		</div>
	);
}
