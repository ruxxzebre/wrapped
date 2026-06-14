import { Link } from "@tanstack/react-router";
import type { CSSProperties, ReactNode } from "react";
import { useT } from "../i18n";
import * as css from "./Story.css";
import { useReveal } from "./Story.hooks";

// A single full-bleed beat: an abstract motif behind a short second-person line
// and an optional footnote. The content reveals once as it scrolls into view.
export function Scene({
	eyebrow,
	glow,
	motif,
	line,
	foot,
	action,
}: {
	eyebrow: string;
	glow: string;
	motif: ReactNode;
	line: ReactNode;
	foot: ReactNode;
	action?: ReactNode;
}) {
	const { ref, shown } = useReveal<HTMLElement>();
	return (
		<section className={css.scene} ref={ref}>
			<div className={css.glow} style={{ "--glow": glow } as CSSProperties} />
			{motif}
			<div className={`${css.content} ${shown ? css.revealed : ""}`}>
				<div className={css.eyebrow}>{eyebrow}</div>
				<p className={css.line}>{line}</p>
				{foot && <div className={css.footnote}>{foot}</div>}
				{action && <div>{action}</div>}
			</div>
		</section>
	);
}

export function ArtistFoot({ name }: { name: string }) {
	const t = useT();
	if (!name || name === "?") return <span>{t("links.unknownArtist")}</span>;
	return (
		<Link to="/artist/$name" params={{ name }} className={css.heroLink}>
			{name}
		</Link>
	);
}
