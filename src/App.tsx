import { useQuery } from "@tanstack/react-query";
import { Outlet, useMatches, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import * as css from "./App.css";
import { api } from "./api";
import CommandPalette from "./components/CommandPalette";
import { useLang, useT } from "./i18n";
import { navigate } from "./router";
import { leafActive, NAV } from "./tabs";
import { Button, PageHeader, Splash } from "./ui";
import Import from "./views/Import";

export default function App() {
	const t = useT();
	const lang = useLang();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const matches = useMatches();
	// Title/tint come from the nearest matched route that defines them, so a
	// nested child (/insights/patterns) inherits the parent group's "Insights"
	// header. Detail routes define neither, so they render without a header.
	const headed = [...matches].reverse().find((m) => m.staticData.titleKey);
	const title = headed?.staticData.titleKey
		? t(headed.staticData.titleKey)
		: undefined;
	const tint = headed?.staticData.tint ?? "neutral";
	const bare = matches.some((m) => m.staticData.bare ?? false);

	// Gate the whole app on whether any history has been ingested. Until it has,
	// the data endpoints would each error, so we show the import screen instead.
	const { data: status, error: statusError } = useQuery({
		queryKey: ["status"],
		queryFn: api.status,
	});
	const [paletteOpen, setPaletteOpen] = useState(false);
	const [navOpen, setNavOpen] = useState(false);
	// Which accordion groups are expanded. Seed with the group owning the route
	// the app loaded on.
	const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
		const init = new Set<string>();
		for (const g of NAV)
			if (
				g.kind === "expand" &&
				g.leaves.some((l) => leafActive(l.slug, pathname))
			)
				init.add(g.headerKey);
		return init;
	});
	const mainRef = useRef<HTMLElement>(null);

	// The body never scrolls; the main pane does. A route change resets scroll,
	// dismisses the mobile drawer, and auto-expands the active group.
	useEffect(() => {
		mainRef.current?.scrollTo(0, 0);
		setNavOpen(false);
		setOpenGroups((prev) => {
			const next = new Set(prev);
			for (const g of NAV)
				if (
					g.kind === "expand" &&
					g.leaves.some((l) => leafActive(l.slug, pathname))
				)
					next.add(g.headerKey);
			return next;
		});
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

	// Status gate, after all hooks so hook order stays stable.
	if (statusError) return <Splash error={statusError as Error} />;
	if (!status) return <Splash />;
	if (!status.ready) return <Import variant="welcome" />;

	const toggleGroup = (key: string) =>
		setOpenGroups((prev) => {
			const next = new Set(prev);
			if (next.has(key)) next.delete(key);
			else next.add(key);
			return next;
		});

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
					{NAV.map((g) =>
						g.kind === "link" ? (
							<Button
								key={g.headerKey}
								variant="nav"
								active={
									pathname === g.slug || pathname.startsWith(`${g.slug}/`)
								}
								onClick={() => {
									navigate(g.slug);
									setNavOpen(false);
								}}
							>
								{t(g.headerKey)}
							</Button>
						) : (
							<div key={g.headerKey} className={css.navGroup}>
								<button
									type="button"
									className={css.groupHeader}
									aria-expanded={openGroups.has(g.headerKey)}
									onClick={() => toggleGroup(g.headerKey)}
								>
									<span>{t(g.headerKey)}</span>
									<span className={css.chevron} aria-hidden="true">
										{openGroups.has(g.headerKey) ? "▾" : "▸"}
									</span>
								</button>
								{openGroups.has(g.headerKey) && (
									<div className={css.groupLeaves}>
										{g.leaves.map((l) => (
											<Button
												key={l.slug}
												variant="nav"
												active={leafActive(l.slug, pathname)}
												onClick={() => {
													navigate(l.slug);
													setNavOpen(false);
												}}
											>
												{t(l.titleKey)}
											</Button>
										))}
									</div>
								)}
							</div>
						),
					)}
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
