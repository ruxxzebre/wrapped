import { useQuery } from "@tanstack/react-query";
import { Outlet, useMatches, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import * as css from "./App.css";
import { api } from "./api";
import CommandPalette from "./components/CommandPalette";
import { type TKey, useLang, useT } from "./i18n";
import { navigate } from "./router";
import { TABS } from "./tabs";
import { Button, PageHeader, Splash } from "./ui";
import Import from "./views/Import";

export default function App() {
	const t = useT();
	const lang = useLang();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	// Tab routes carry their title/tint in staticData; detail routes don't, so
	// they render without a PageHeader — same behavior as before the router
	// migration.
	const matches = useMatches();
	const leaf = matches[matches.length - 1];
	// Tab routes carry an English title in staticData only to flag "has a header";
	// the displayed text is translated from the route's slug (which doubles as its
	// nav key) so it follows the active language.
	const title = leaf?.staticData.title
		? t(`nav.${pathname}` as TKey)
		: undefined;
	const tint = leaf?.staticData.tint ?? "neutral";
	// Bare tabs (Story) own the scroll pane for full-screen scroll-snap, so we
	// drop the content wrapper and footer and let the body scroll itself.
	const bare = leaf?.staticData.bare ?? false;

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

	// Keep the document language in sync for accessibility and correct hyphenation.
	useEffect(() => {
		document.documentElement.lang = lang;
	}, [lang]);

	// Status gate, after all hooks so hook order stays stable. A database that's
	// initialized but empty shows the welcome importer; an init failure surfaces
	// its error rather than a blank dashboard.
	if (statusError) return <Splash error={statusError as Error} />;
	if (!status) return <Splash />;
	if (!status.ready) return <Import variant="welcome" />;

	return (
		<div className={css.shell}>
			<div className={css.menuBar}>
				<button
					type="button"
					className={css.menuButton}
					aria-label={navOpen ? t("app.closeMenu") : t("app.openMenu")}
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
					{t("app.search")} <kbd>Ctrl K</kbd>
				</Button>
				<nav className={css.navList}>
					{TABS.map((tab) => (
						<Button
							variant="nav"
							key={tab.slug}
							active={tab.slug === pathname}
							onClick={() => {
								navigate(tab.slug);
								setNavOpen(false);
							}}
						>
							{t(`nav.${tab.slug}` as TKey)}
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
			<main ref={mainRef} className={bare ? css.mainBare : css.main}>
				{title && <PageHeader title={title} tint={tint} />}
				{bare ? (
					<Outlet />
				) : (
					<>
						<div className={css.content}>
							<Outlet />
						</div>
						<footer className={css.footer}>
							<p className={css.footerAbout}>
								<strong>Wrapped</strong> — {t("app.footer.about")}
							</p>
							<p>
								{t("app.footer.builtBy")}{" "}
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
					</>
				)}
			</main>
			{paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
		</div>
	);
}
