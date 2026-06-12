import { useQuery } from "@tanstack/react-query";
import { Outlet, useMatches, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import * as css from "./App.css";
import { api } from "./api";
import CommandPalette from "./components/CommandPalette";
import { navigate } from "./router";
import { TABS } from "./tabs";
import { Button, PageHeader, Status } from "./ui";
import Import from "./views/Import";

export default function App() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	// Tab routes carry their title/tint in staticData; detail routes don't, so
	// they render without a PageHeader — same behavior as before the router
	// migration.
	const matches = useMatches();
	const leaf = matches[matches.length - 1];
	const title = leaf?.staticData.title;
	const tint = leaf?.staticData.tint ?? "neutral";

	// Gate the whole app on whether any history has been ingested. Until it has,
	// the data endpoints would each error, so we show the import screen instead.
	const { data: status, error: statusError } = useQuery({
		queryKey: ["status"],
		queryFn: api.status,
	});
	const [paletteOpen, setPaletteOpen] = useState(false);
	const [navOpen, setNavOpen] = useState(false);
	const mainRef = useRef<HTMLElement>(null);

	// The body never scrolls; the main pane does. A route change also resets
	// scroll and dismisses the mobile drawer. pathname is the intended trigger,
	// not a value read inside the effect.
	// biome-ignore lint/correctness/useExhaustiveDependencies: react to route change
	useEffect(() => {
		mainRef.current?.scrollTo(0, 0);
		setNavOpen(false);
	}, [pathname]);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				setPaletteOpen((o) => !o);
			} else if (e.key === "Escape") {
				setPaletteOpen(false);
				setNavOpen(false);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);

	// Status gate, after all hooks so hook order stays stable. A database that's
	// initialized but empty shows the welcome importer; an init failure surfaces
	// its error rather than a blank dashboard.
	if (statusError) {
		return (
			<div className={css.shell}>
				<Status error={statusError as Error} />
			</div>
		);
	}
	if (!status) {
		return (
			<div className={css.shell}>
				<Status />
			</div>
		);
	}
	if (!status.ready) return <Import variant="welcome" />;

	return (
		<div className={css.shell}>
			<div className={css.menuBar}>
				<button
					type="button"
					className={css.menuButton}
					aria-label={navOpen ? "Close menu" : "Open menu"}
					aria-expanded={navOpen}
					aria-controls="sidebar-nav"
					onClick={() => setNavOpen((o) => !o)}
				>
					☰
				</button>
				<a href="#/" className={css.brand}>
					Wrapped
				</a>
			</div>
			<aside
				id="sidebar-nav"
				className={navOpen ? `${css.sidebar} ${css.sidebarOpen}` : css.sidebar}
			>
				<a href="#/" className={css.brand}>
					Wrapped
				</a>
				<Button variant="chrome" onClick={() => setPaletteOpen(true)}>
					search <kbd>Ctrl K</kbd>
				</Button>
				<nav className={css.navList}>
					{TABS.map((t) => (
						<Button
							variant="nav"
							key={t.slug}
							active={t.slug === pathname}
							onClick={() => {
								navigate(t.slug);
								setNavOpen(false);
							}}
						>
							{t.name}
						</Button>
					))}
				</nav>
			</aside>
			{navOpen && (
				<div
					className={css.backdrop}
					aria-hidden="true"
					onClick={() => setNavOpen(false)}
				/>
			)}
			<main ref={mainRef} className={css.main}>
				{title && <PageHeader title={title} tint={tint} />}
				<div className={css.content}>
					<Outlet />
				</div>
				<footer className={css.footer}>
					<p className={css.footerAbout}>
						<strong>Wrapped</strong> — a self-hosted analyzer for your Spotify
						listening history. Import your extended streaming export to explore
						trends, top tracks and artists, and your taste over time. All data
						stays on your machine.
					</p>
					<p>
						Built by{" "}
						<a
							className={css.footerLink}
							href="https://github.com/ruxxzebre"
							target="_blank"
							rel="noopener noreferrer"
						>
							ruxxzebre
						</a>{" "}
						·{" "}
						<a
							className={css.footerLink}
							href="https://github.com/ruxxzebre/wrapped"
							target="_blank"
							rel="noopener noreferrer"
						>
							GitHub
						</a>
					</p>
				</footer>
			</main>
			{paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
		</div>
	);
}
