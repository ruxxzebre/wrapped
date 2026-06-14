// English catalog — the single source of truth for the app's copy. Every other
// language is typed against these keys (see Catalog in ./index) and may supply a
// subset; anything missing falls back to the English string here.
//
// Conventions:
//  - Keys are flat and dotted: "namespace.thing".
//  - "{name}" placeholders are filled at render time (numbers, dates, nodes).
//  - Plural strings come in "_one"/"_other" (and "_few"/"_many" for Slavic
//    languages) variants; callers pass { count } and the right form is picked
//    via Intl.PluralRules. The base key (without suffix) is what you call.
export const en = {
	// --- app shell ---------------------------------------------------------
	"app.openMenu": "Open menu",
	"app.closeMenu": "Close menu",
	"app.search": "search",
	"app.footer.about":
		"a self-hosted analyzer for your Spotify listening history. Import your extended streaming export to explore trends, top tracks and artists, and your taste over time. All data stays on your machine.",
	"app.footer.builtBy": "Built by",

	// --- navigation (keyed by tab slug) ------------------------------------
	"nav./": "Summary",
	"nav./story": "Story",
	"nav./top-tracks": "Top Tracks",
	"nav./top-artists": "Top Artists",
	"nav./patterns": "Patterns",
	"nav./calendar": "Calendar",
	"nav./library": "Library",
	"nav./play-log": "Play Log",
	"nav./compare": "Compare",
	"nav./import": "Import",
	"nav./settings": "Settings",
	"nav.group.home": "Home",
	"nav.group.music": "Music",
	"nav.group.insights": "Insights",
	"nav.group.timeline": "Timeline",
	"nav.group.explore": "Explore",
	"nav.group.system": "System",
	"nav.insights.overview": "Overview",
	"nav.insights.taste": "Taste",
	"nav.insights.habits": "Habits",
	"nav.insights.events": "Events",
	"nav.insights.devices": "Devices",
	"insights.dashboardTitle": "Insights",
	"insights.empty": "More insights are coming soon.",
	"insights.notEnough": "Not enough data yet.",

	// Overview headline cards
	"insights.overview.lede":
		"A deeper cut at your listening — taste shape, daily habits, notable events, and the devices behind it all. Pick a tab above.",
	"insights.overview.gini": "taste concentration",
	"insights.overview.longestHiatus": "longest hiatus",
	"insights.overview.nightShare": "after-midnight plays",

	// --- §24 Range index ---------------------------------------------------
	"insights.range.title": "Range index",
	"insights.range.lede":
		"How much of your listening comes from a handful of tracks. 0 is perfectly even; closer to 1 means a few songs dominate.",
	"insights.range.gini": "concentration (Gini)",
	"insights.range.top1": "top 1% share",
	"insights.range.byYear": "Concentration by year",
	"insights.range.giniLine": "Gini",
	"insights.range.top1Line": "top 1% share",

	// --- §17 Loyal companions ---------------------------------------------
	"insights.companions.title": "Loyal companions",
	"insights.companions.lede":
		"Played in every single year of your history — the constants that never left.",
	"insights.companions.empty":
		"Need at least 3 years of data to find your constants.",

	// --- §15 Seasonal ------------------------------------------------------
	"insights.seasonal.title": "Songs of the seasons",
	"insights.seasonal.lede":
		"Tracks whose plays cluster in one part of the year — your summer anthems and winter-only songs.",
	"insights.seasonal.peak": "peak",
	"insights.seasonal.concentration": "season-locked",
	"insights.seasonal.empty": "Need at least 2 years of data to spot seasons.",

	// --- §21 Chronotype ----------------------------------------------------
	"insights.chronotype.title": "Chronotype drift",
	"insights.chronotype.lede":
		"Your typical listening hour over the years — are you getting more nocturnal?",
	"insights.chronotype.meanHour": "center of gravity",
	"insights.chronotype.nightShare": "before 6am",
	"insights.chronotype.meanLine": "mean hour",

	// --- §20 Weekend vs weekday -------------------------------------------
	"insights.weekend.title": "Weekend vs weekday self",
	"insights.weekend.lede":
		"Your weekday self is {pct} different from your weekend self.",
	"insights.weekend.weekday": "Weekday",
	"insights.weekend.weekend": "Weekend",

	// --- §16 Attention span ------------------------------------------------
	"insights.attention.title": "Attention span",
	"insights.attention.lede":
		"Do you still finish songs? Average fraction of each track you actually play, per year.",
	"insights.attention.completion": "avg completion",
	"insights.attention.median": "median play",
	"insights.attention.completionLine": "completion",

	// --- §25 Hiatuses ------------------------------------------------------
	"insights.hiatuses.title": "Hiatuses",
	"insights.hiatuses.lede":
		"Stretches where you barely opened Spotify — your longest silences. An export gap can look identical to a real break.",

	// --- §18 Rediscoveries -------------------------------------------------
	"insights.rediscoveries.title": "Rediscoveries",
	"insights.rediscoveries.lede":
		"Tracks that went quiet for months, then came roaring back.",
	"insights.rediscoveries.revival": "{n} plays in 30 days",

	// --- §19 On repeat -----------------------------------------------------
	"insights.loops.title": "On repeat",
	"insights.loops.lede":
		"Back-to-back consecutive plays of the same track — when you had it on actual repeat.",
	"insights.loops.run": "{n}× in a row",

	// --- §22 Device archaeology -------------------------------------------
	"insights.devices.title": "Device archaeology",
	"insights.devices.lede":
		"The hardware story hidden in your platform field — when each device family came and went. Coarse by design: the exact user-agent is never imported.",
	"insights.devices.share": "share",

	// --- §23 Incognito & offline ------------------------------------------
	"insights.privacy.title": "Incognito & offline",
	"insights.privacy.lede":
		"Two flags nobody surfaces: private sessions that never hit your profile, and what you downloaded for the road.",
	"insights.privacy.incognito": "incognito plays",
	"insights.privacy.offline": "offline plays",
	"insights.privacy.topOffline": "Top downloads (offline)",
	"insights.privacy.topIncognito": "Top incognito tracks",
	"insights.privacy.none": "No private or offline plays recorded.",

	// --- shared insight columns -------------------------------------------
	"insights.col.years": "years",
	"insights.col.peak": "peak month",
	"insights.col.locked": "locked",
	"insights.col.gap": "silence",
	"insights.col.comeback": "comeback",
	"insights.col.revival": "revival",
	"insights.col.run": "loop",
	"insights.col.started": "started",
	"insights.col.device": "device",
	"insights.col.first": "first",
	"insights.col.last": "last",
	"insights.col.from": "from",
	"insights.col.to": "to",
	"insights.col.days": "days",

	// --- shared controls ---------------------------------------------------
	"controls.rankBy": "rank by",
	"controls.period": "period",
	"controls.from": "from",
	"controls.to": "to",
	"controls.minSeconds": "min seconds",
	"controls.limit": "limit",
	"controls.year": "year",
	"controls.search": "search",
	"period.all": "all time",
	"period.custom": "custom",
	"metric.plays": "plays",
	"metric.time": "time",

	// --- shared table columns ---------------------------------------------
	"col.rank": "#",
	"col.track": "track",
	"col.artist": "artist",
	"col.album": "album",
	"col.plays": "plays",
	"col.hours": "hours",
	"col.tracks": "tracks",
	"col.last": "last",
	"col.skip": "skip",
	"col.playedAt": "played at",
	"col.for": "for",
	"col.platform": "platform",
	"col.move": "move",
	"col.aRank": "A rank",
	"col.bRank": "B rank",
	"col.aValue": "A {unit}",
	"col.bValue": "B {unit}",

	// --- shared bits -------------------------------------------------------
	"common.cancel": "Cancel",
	"common.dash": "—",
	"unit.plays": "plays",
	"unit.hrs": "hrs",
	// Plural strings: pass { count } to pick the form and { n } for the displayed
	// (locale-grouped) number — count drives Intl.PluralRules, n is shown.
	"count.plays_one": "{n} play",
	"count.plays_other": "{n} plays",
	"count.days_one": "{n} day",
	"count.days_other": "{n} days",
	"count.years_one": "{n} year",
	"count.years_other": "{n} years",
	"count.months_one": "{n} month",
	"count.months_other": "{n} months",
	"count.hours_one": "{n} hour",
	"count.hours_other": "{n} hours",

	// --- status / splash ---------------------------------------------------
	"status.loading": "loading…",

	// --- Summary -----------------------------------------------------------
	"card.plays": "plays",
	"card.hours": "hours",
	"card.tracks": "tracks",
	"card.artists": "artists",
	"card.skips": "skips",
	"card.since": "since",
	"summary.streamsSub": "{count} ≥30s streams",
	"summary.latest": "latest {date}",
	"summary.pctOfPlays": "{pct} of plays",
	"summary.hoursPerYear": "Hours per year",
	"summary.playsPerYear": "Plays per year",

	// --- On this day -------------------------------------------------------
	"onThisDay.title": "On this day",
	"onThisDay.thisWeek": "this week",
	"onThisDay.yearsAgo": "{count}y ago",

	// --- Patterns ----------------------------------------------------------
	"patterns.byHour": "Listening by hour of day (local start time)",
	"patterns.byWeekday": "Listening by day of week",

	// --- Calendar ----------------------------------------------------------
	"calendar.summary": "{hours} hours over {days} active days in {year}",
	"calendar.less": "less",
	"calendar.more": "more",
	"calendar.activityTitle": "Listening activity by day",
	"calendar.dayPlays": "{plays} plays · {hours} h",
	"calendar.noPlays": "no plays",

	// --- Library -----------------------------------------------------------
	"library.searchPlaceholder": "track / artist / album",
	"library.countOf": "{shown} of {total} tracks",

	// --- Play Log ----------------------------------------------------------
	"playLog.searchPlaceholder": "track / artist",
	"playLog.loadingMore": "loading more…",

	// --- Compare -----------------------------------------------------------
	"compare.compare": "compare",
	"compare.artists": "artists",
	"compare.tracks": "tracks",

	// --- Settings ----------------------------------------------------------
	"settings.playback": "Playback",
	"settings.showPlayer": "Show embedded Spotify player",
	"settings.showPlayerHint":
		"Renders an in-page player on each track page. Hidden automatically when a track isn't available on Spotify.",
	"settings.time": "Time",
	"settings.timezone": "Timezone",
	"settings.timezoneHint":
		"Hour-of-day, weekday and calendar charts bucket plays in this timezone. Defaults to your browser's. Pick the timezone you actually lived in if it differs.",
	"settings.language": "Language",
	"settings.languageAuto": "Automatic (match system)",
	"settings.languageHint":
		"Language used across the interface. Defaults to your system language when available, otherwise English.",
	"settings.dangerZone": "Danger zone",
	"settings.clearLibrary": "Clear library",
	"settings.clearing": "Clearing…",
	"settings.deleteImported": "Delete imported data",
	"settings.clearLibraryHint":
		"Wipes the database and its saved snapshot, returning you to the welcome screen. This can't be undone — you'll need to re-import your Spotify export.",
	"settings.confirmClearTitle": "Clear your library?",
	"settings.confirmClearBody":
		"This permanently deletes all imported listening data from this browser. You can re-import your Spotify export afterwards.",

	// --- Import ------------------------------------------------------------
	"import.getData": "Get your Spotify data",
	"import.step1Title": "Find your account",
	"import.step1Text":
		"Go to spotify.com, log in, then open the Account menu in the top-right.",
	"import.step2Title": "Open Account privacy",
	"import.step2Text":
		"In the account settings sidebar, scroll to the Account privacy section.",
	"import.step3Title": "Request your data",
	"import.step3Text":
		"Under “Download your data”, locate Extended streaming history and tick it, untick Account data, then hit Request data.",
	"import.step4Title": "Wait for the email",
	"import.step4Text":
		"Spotify emails a confirmation link — click it to start the export. After a while (often a few days) they send a download link. Grab the my_spotify_data.zip and drop it here — no need to unzip.",
	"import.stepAlt": "Step {n}: {title}",
	"import.backToUpload": "Back to upload",
	"import.welcomeTitle": "Welcome to Wrapped",
	"import.welcomeLede":
		"No listening history yet. Drop your {file} below to get started",
	"import.reimportLede":
		"Import a Spotify export to replace everything currently loaded. This overwrites your existing data.",
	"import.reading": "Reading export… {pct}%",
	"import.importing": "Importing history… this can take a moment.",
	"import.complete": "Import complete — your data has been replaced.",
	"import.dropAnother": "Drop another archive to import again.",
	"import.dropHere": "Drop my_spotify_data.zip here, or click to choose",
	"import.onlyZip": "Only the .zip — no need to unzip it first.",
	"import.learnHow": "Learn how to load your data from Spotify",
	"import.reimportWarn": "Re-importing replaces all currently loaded data.",
	"import.privacy":
		"Your data never leaves this device. {emph}. Everything is processed right here in your browser, and nothing is uploaded, stored, or transmitted anywhere.",
	"import.privacyEmph": "No data is sent over the network",
	"import.errZip": "Please drop a .zip archive.",
	"import.errFailed": "Import failed.",

	// --- Track / Artist detail --------------------------------------------
	"detail.skipRate": "skip rate",
	"detail.rank": "rank",
	"detail.byPlaysLifetime": "by plays, lifetime",
	"detail.firstHeard": "first heard",
	"detail.length": "length",
	"detail.longestPlay": "longest play",
	"track.playsPerMonth": "Plays per month",
	"track.whenYouPlay": "When you play it (hour of day)",
	"track.completion": "Completion",
	"track.howItStarts": "How it starts",
	"track.platforms": "Platforms",
	"artist.top3": "top 3 tracks = {pct} of plays — {verdict}",
	"artist.liveOnHits": "you live on the hits",
	"artist.wholeCatalogue": "you work the whole catalogue",
	"artist.hoursPerMonth": "Hours per month",
	"artist.topAlbums": "Top albums by hours",
	"artist.allTracks": "All tracks",
	"artist.allTracksCount": "All tracks ({count})",

	// --- Year in review ----------------------------------------------------
	"year.inReview": "{year} in review",
	"year.streamsSub": "{count} ≥30s",
	"year.topTracks": "Top tracks",
	"year.topArtists": "Top artists",
	"year.busiestDay": "busiest day",
	"year.busiestSub": "{hours} h · {plays} plays",
	"year.longestStreak": "longest streak",
	"year.streakSub": "{from} → {to}",
	"year.biggestDiscovery": "biggest discovery",
	"year.discoverySub": "{hours} h, first heard this year",
	"year.skipChampion": "skip champion",
	"year.skipChampionSub": "{pct} skipped over {plays} plays",

	// --- links -------------------------------------------------------------
	"links.openInSpotify": "Open in Spotify",
	"links.spotifyPlayer": "Spotify player",
	"links.back": "Back",
	"links.backLabel": "Go back to the previous page",
	"links.unknownArtist": "unknown artist",

	// --- command palette ---------------------------------------------------
	"palette.placeholder": "Search tracks and artists…",
	"palette.artist": "artist",
	"palette.track": "track",
	"palette.noMatches": "No matches",

	// --- Story -------------------------------------------------------------
	"story.origin.eyebrow": "How it began",
	"story.origin.line": "It started with {track} on a {weekday}, {date}.",
	"story.origin.foot": "{artist} · {years} years ago",
	"story.time.eyebrow": "All told",
	"story.time.line":
		"You've pressed play for {days} straight — about {weeks} full work-weeks of music.",
	"story.time.foot": "{hours} hours since {year}",
	"story.persona.eyebrow": "Who you are",
	"story.persona.line": "You're a {loyalty} {clock} who {skip}.",
	"story.persona.foot":
		"{night} after dark · {skip} skip rate · {oneshots} artists tried just once",
	"story.persona.loyal": "fiercely loyal",
	"story.persona.curious": "endlessly curious",
	"story.persona.openMinded": "open-minded",
	"story.persona.nightOwl": "night owl",
	"story.persona.daytime": "daytime listener",
	"story.persona.allHours": "all-hours listener",
	"story.persona.neverSkips": "almost never skips",
	"story.persona.rarelySkips": "rarely skips",
	"story.persona.skipsHard": "skips without mercy",
	"story.obsession.eyebrow": "Your record",
	"story.obsession.line": "One day you played {track} {times}.",
	"story.obsession.times": "{count} times",
	"story.obsession.foot": "{date} · {artist}",
	"story.faded.eyebrow": "You moved on",
	"story.faded.line":
		"You haven't touched {track} since {since}. It was your anthem in {peak}.",
	"story.faded.foot": "{plays} plays that year · {artist}",
	"story.crossroads.eyebrow": "Catch your breath",
	"story.crossroads.line":
		"That's the first half. Keep swiping, there's {more} below.",
	"story.crossroads.more": "more of your story",
	"story.crossroads.foot":
		"Or step out now: open the {summary}, or dig into your {insights}.",
	"story.crossroads.summary": "Summary",
	"story.crossroads.insights": "Insights",
	"story.companion.eyebrow": "Still here",
	"story.companion.line":
		"Through it all, {artist} stayed with you for {years} and counting.",
	"story.companion.foot": "{plays} · in your rotation since {firstYear}",
	"story.comeback.eyebrow": "You came back",
	"story.comeback.line":
		"You let {track} go quiet for {gap}, then couldn't stop again.",
	"story.comeback.foot":
		"Back on {date} · {plays} in the month after · {artist}",
	"story.marathon.eyebrow": "One day you didn't stop",
	"story.marathon.line": "On {date} you listened for {hours}.",
	"story.marathon.foot": "{weekday} · {streams} tracks · mostly {artist}",
	"story.devotion.eyebrow": "Never once skipped",
	"story.devotion.line":
		"You played {track} {times}, and let it finish every single time.",
	"story.devotion.foot":
		"{artist} · while you skipped {skip} of everything else",
	"story.closing.eyebrow": "That's the story",
	"story.closing.line":
		"The numbers behind every beat are waiting for you in the {summary}.",
	"story.closing.summary": "Summary",
	"story.closing.foot":
		"Want the patterns behind it? Your {insights} go deeper.",
	"story.closing.insights": "Insights",
	"story.closing.cta": "Go To Summary →",

	// --- completion bands (backend codes) ----------------------------------
	"completion.finished": "Finished",
	"completion.most": "Most of it",
	"completion.partial": "Partway",
	"completion.bailed": "Bailed early",
	"completion.unknown": "Unknown",

	// --- reason_start codes ------------------------------------------------
	"reasonStart.trackdone": "Previous track ended",
	"reasonStart.fwdbtn": "Skipped forward into it",
	"reasonStart.backbtn": "Skipped back to it",
	"reasonStart.clickrow": "Picked from a list",
	"reasonStart.playbtn": "Pressed play",
	"reasonStart.appload": "App opened",
	"reasonStart.remote": "Remote / cast device",
	"reasonStart.trackerror": "After a track error",
	"reasonStart.?": "Unknown",
} as const;

export type Catalog = typeof en;
