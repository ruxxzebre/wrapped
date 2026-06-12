import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import { fmtInt } from "../format";
import { ArtistLink, TrackLink } from "../links";
import { Muted, Panel } from "../ui";
import * as css from "./OnThisDay.css";

// "This day in your history" — top track of the same week in each past year.
export default function OnThisDay() {
	const { data } = useQuery({
		queryKey: ["onThisDay"],
		queryFn: api.onThisDay,
	});
	if (!data || data.length === 0) return null;

	const thisYear = new Date().getFullYear();
	return (
		<Panel title="On this day">
			<div className={css.list}>
				{data.map((o) => {
					const ago = thisYear - o.year;
					return (
						<div className={css.row} key={o.year}>
							<span className={css.when}>
								{ago <= 0 ? "this week" : `${ago}y ago`}
							</span>
							<span className={css.track}>
								<TrackLink uri={o.track_uri} name={o.name} />
								<Muted> · </Muted>
								<ArtistLink name={o.artist} muted />
							</span>
							<span className={css.plays}>{fmtInt(o.plays)} plays</span>
						</div>
					);
				})}
			</div>
		</Panel>
	);
}
