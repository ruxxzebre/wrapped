import type { Translation } from "./index";

// Romanian — Română. Typed against the English keys in ./en; anything omitted
// falls back to the English string.
export const ro: Translation = {
	// --- app shell ---------------------------------------------------------
	"app.openMenu": "Deschide meniul",
	"app.closeMenu": "Închide meniul",
	"app.search": "caută",
	"app.footer.about":
		"un analizator self-hosted pentru istoricul tău de ascultare Spotify. Importă exportul extins al istoricului de streaming pentru a explora tendințe, cele mai ascultate piese și artiști și gusturile tale de-a lungul timpului. Toate datele rămân pe dispozitivul tău.",
	"app.footer.builtBy": "Creat de",

	// --- navigation --------------------------------------------------------
	"nav./": "Rezumat",
	"nav./story": "Poveste",
	"nav./top-tracks": "Top piese",
	"nav./top-artists": "Top artiști",
	"nav./patterns": "Tipare",
	"nav./calendar": "Calendar",
	"nav./library": "Bibliotecă",
	"nav./play-log": "Jurnal redări",
	"nav./compare": "Comparație",
	"nav./import": "Import",
	"nav./settings": "Setări",
	"nav.group.home": "Acasă",
	"nav.group.music": "Muzică",
	"nav.group.insights": "Statistici",
	"nav.group.timeline": "Cronologie",
	"nav.group.explore": "Explorare",
	"nav.group.system": "Sistem",
	"nav.insights.overview": "Prezentare",
	"nav.insights.taste": "Gust",
	"nav.insights.habits": "Obiceiuri",
	"nav.insights.events": "Evenimente",
	"nav.insights.devices": "Dispozitive",
	"insights.dashboardTitle": "Statistici",
	"insights.empty": "În curând vor apărea mai multe statistici.",
	"insights.notEnough": "Insuficiente date încă.",

	// Overview headline cards
	"insights.overview.lede":
		"O privire mai profundă asupra ascultărilor tale — forma gustului, obiceiuri zilnice, evenimente notabile și dispozitivele din spatele tuturor. Alege un tab mai sus.",
	"insights.overview.gini": "concentrația gustului",
	"insights.overview.longestHiatus": "cea mai lungă pauză",
	"insights.overview.nightShare": "redări după miezul nopții",

	// --- §24 Range index ---------------------------------------------------
	"insights.range.title": "Indice de diversitate",
	"insights.range.lede":
		"Cât din ascultările tale provin dintr-un număr mic de piese. 0 înseamnă perfect uniform; aproape de 1 înseamnă că câteva cântece domină.",
	"insights.range.gini": "concentrație (Gini)",
	"insights.range.top1": "ponderea top 1%",
	"insights.range.byYear": "Concentrație pe ani",
	"insights.range.giniLine": "Gini",
	"insights.range.top1Line": "ponderea top 1%",

	// --- §17 Loyal companions ---------------------------------------------
	"insights.companions.title": "Însoțitori fideli",
	"insights.companions.lede":
		"Redate în fiecare an din istoricul tău — constantele care nu au plecat niciodată.",
	"insights.companions.empty":
		"Ai nevoie de cel puțin 3 ani de date pentru a găsi constantele tale.",

	// --- §15 Seasonal ------------------------------------------------------
	"insights.seasonal.title": "Cântecele anotimpurilor",
	"insights.seasonal.lede":
		"Piese ale căror redări se concentrează într-o perioadă a anului — imnurile tale de vară și cântecele doar de iarnă.",
	"insights.seasonal.peak": "vârf",
	"insights.seasonal.concentration": "legate de sezon",
	"insights.seasonal.empty":
		"Ai nevoie de cel puțin 2 ani de date pentru a identifica sezonalitatea.",

	// --- §21 Chronotype ----------------------------------------------------
	"insights.chronotype.title": "Deriva cronotipului",
	"insights.chronotype.lede":
		"Ora tipică de ascultare de-a lungul anilor — devii mai nocturn?",
	"insights.chronotype.meanHour": "centru de greutate",
	"insights.chronotype.nightShare": "înainte de ora 6",
	"insights.chronotype.meanLine": "ora medie",

	// --- §20 Weekend vs weekday -------------------------------------------
	"insights.weekend.title": "Eul de weekend vs. cel de săptămână",
	"insights.weekend.lede":
		"Eul tău de săptămână diferă cu {pct} față de cel de weekend.",
	"insights.weekend.weekday": "Zile lucrătoare",
	"insights.weekend.weekend": "Weekend",

	// --- §16 Attention span ------------------------------------------------
	"insights.attention.title": "Durata atenției",
	"insights.attention.lede":
		"Mai termini cântecele? Fracțiunea medie din fiecare piesă pe care o asculți efectiv, pe an.",
	"insights.attention.completion": "finalizare medie",
	"insights.attention.median": "redare mediană",
	"insights.attention.completionLine": "finalizare",

	// --- §25 Hiatuses ------------------------------------------------------
	"insights.hiatuses.title": "Pauze",
	"insights.hiatuses.lede":
		"Perioade în care abia ai deschis Spotify — tăcerile tale cele mai lungi. O lacună în export poate arăta identic cu o pauză reală.",

	// --- §18 Rediscoveries -------------------------------------------------
	"insights.rediscoveries.title": "Redescoperiri",
	"insights.rediscoveries.lede":
		"Piese care au tăcut luni de zile, apoi au revenit cu forță.",
	"insights.rediscoveries.revival": "{n} redări în 30 de zile",

	// --- §19 On repeat -----------------------------------------------------
	"insights.loops.title": "Pe repeat",
	"insights.loops.lede":
		"Redări consecutive ale aceleiași piese — când ai avut-o pe repeat cu adevărat.",
	"insights.loops.run": "{n}× la rând",

	// --- §22 Device archaeology -------------------------------------------
	"insights.devices.title": "Arheologia dispozitivelor",
	"insights.devices.lede":
		"Povestea hardware ascunsă în câmpul platformei — când a apărut și a dispărut fiecare familie de dispozitive. Deliberat aproximativ: user-agent-ul exact nu este niciodată importat.",
	"insights.devices.share": "pondere",

	// --- §23 Incognito & offline ------------------------------------------
	"insights.privacy.title": "Incognito și offline",
	"insights.privacy.lede":
		"Două lucruri pe care de obicei nimeni nu le arată: sesiuni private care nu au ajuns niciodată în profilul tău și ce ai descărcat pentru drum.",
	"insights.privacy.incognito": "redări incognito",
	"insights.privacy.offline": "redări offline",
	"insights.privacy.topOffline": "Top descărcări (offline)",
	"insights.privacy.topIncognito": "Top piese incognito",
	"insights.privacy.none": "Nicio redare privată sau offline înregistrată.",

	// --- shared insight columns -------------------------------------------
	"insights.col.years": "ani",
	"insights.col.peak": "lună de vârf",
	"insights.col.locked": "sezonier",
	"insights.col.gap": "tăcere",
	"insights.col.comeback": "revenire",
	"insights.col.revival": "renaștere",
	"insights.col.run": "buclă",
	"insights.col.started": "început",
	"insights.col.device": "dispozitiv",
	"insights.col.first": "primul",
	"insights.col.last": "ultimul",
	"insights.col.from": "de la",
	"insights.col.to": "până la",
	"insights.col.days": "zile",

	// --- shared controls ---------------------------------------------------
	"controls.rankBy": "clasează după",
	"controls.period": "perioadă",
	"controls.from": "de la",
	"controls.to": "până la",
	"controls.minSeconds": "secunde min.",
	"controls.limit": "limită",
	"controls.year": "an",
	"controls.search": "caută",
	"period.all": "tot timpul",
	"period.custom": "personalizat",
	"metric.plays": "redări",
	"metric.time": "timp",

	// --- shared table columns ---------------------------------------------
	"col.rank": "#",
	"col.track": "piesă",
	"col.artist": "artist",
	"col.album": "album",
	"col.plays": "redări",
	"col.hours": "ore",
	"col.tracks": "piese",
	"col.last": "ultima",
	"col.skip": "sărit",
	"col.playedAt": "redat la",
	"col.for": "durată",
	"col.platform": "platformă",
	"col.move": "salt",
	"col.aRank": "rang A",
	"col.bRank": "rang B",
	"col.aValue": "A {unit}",
	"col.bValue": "B {unit}",

	// --- shared bits -------------------------------------------------------
	"common.cancel": "Anulează",
	"common.dash": "—",
	"unit.plays": "redări",
	"unit.hrs": "ore",
	"count.plays_one": "{n} redare",
	"count.plays_few": "{n} redări",
	"count.plays_other": "{n} de redări",
	"count.days_one": "{n} zi",
	"count.days_few": "{n} zile",
	"count.days_other": "{n} de zile",
	"count.years_one": "{n} an",
	"count.years_few": "{n} ani",
	"count.years_other": "{n} de ani",
	"count.months_one": "{n} lună",
	"count.months_few": "{n} luni",
	"count.months_other": "{n} de luni",
	"count.hours_one": "{n} oră",
	"count.hours_few": "{n} ore",
	"count.hours_other": "{n} de ore",

	// --- status / splash ---------------------------------------------------
	"status.loading": "se încarcă…",

	// --- Summary -----------------------------------------------------------
	"card.plays": "redări",
	"card.hours": "ore",
	"card.tracks": "piese",
	"card.artists": "artiști",
	"card.skips": "săriri",
	"card.since": "din",
	"summary.streamsSub": "{count} streamuri ≥30s",
	"summary.latest": "ultima {date}",
	"summary.pctOfPlays": "{pct} din redări",
	"summary.hoursPerYear": "Ore pe an",
	"summary.playsPerYear": "Redări pe an",

	// --- On this day -------------------------------------------------------
	"onThisDay.title": "În această zi",
	"onThisDay.thisWeek": "săptămâna asta",
	"onThisDay.yearsAgo": "acum {count} ani",

	// --- Patterns ----------------------------------------------------------
	"patterns.byHour": "Ascultare pe oră a zilei (ora locală de început)",
	"patterns.byWeekday": "Ascultare pe zi a săptămânii",

	// --- Calendar ----------------------------------------------------------
	"calendar.summary": "{hours} ore în {days} zile active în {year}",
	"calendar.less": "mai puțin",
	"calendar.more": "mai mult",
	"calendar.activityTitle": "Activitate de ascultare pe zile",
	"calendar.dayPlays": "{plays} redări · {hours} h",
	"calendar.noPlays": "fără redări",

	// --- Library -----------------------------------------------------------
	"library.searchPlaceholder": "piesă / artist / album",
	"library.countOf": "{shown} din {total} piese",

	// --- Play Log ----------------------------------------------------------
	"playLog.searchPlaceholder": "piesă / artist",
	"playLog.loadingMore": "se încarcă mai mult…",

	// --- Compare -----------------------------------------------------------
	"compare.compare": "compară",
	"compare.artists": "artiști",
	"compare.tracks": "piese",

	// --- Settings ----------------------------------------------------------
	"settings.playback": "Redare",
	"settings.showPlayer": "Afișează playerul Spotify încorporat",
	"settings.showPlayerHint":
		"Afișează un player în pagină pe fiecare pagină de piesă. Ascuns automat când o piesă nu este disponibilă pe Spotify.",
	"settings.time": "Timp",
	"settings.timezone": "Fus orar",
	"settings.timezoneHint":
		"Graficele pe oră, zi a săptămânii și calendar grupează redările în acest fus orar. Implicit este cel al browserului tău. Alege fusul orar în care ai trăit efectiv dacă diferă.",
	"settings.language": "Limbă",
	"settings.languageAuto": "Automat (potrivește sistemul)",
	"settings.languageHint":
		"Limba folosită în interfață. Implicit este limba sistemului tău când este disponibilă, altfel engleza.",
	"settings.dangerZone": "Zonă periculoasă",
	"settings.clearLibrary": "Șterge biblioteca",
	"settings.clearing": "Se șterge…",
	"settings.deleteImported": "Șterge datele importate",
	"settings.clearLibraryHint":
		"Șterge baza de date și instantaneul salvat, readucându-te la ecranul de bun venit. Nu poate fi anulat — va trebui să reimporți exportul Spotify.",
	"settings.confirmClearTitle": "Ștergi biblioteca?",
	"settings.confirmClearBody":
		"Aceasta șterge definitiv toate datele de ascultare importate din acest browser. Poți reimporta exportul Spotify ulterior.",

	// --- Import ------------------------------------------------------------
	"import.getData": "Obține datele tale Spotify",
	"import.step1Title": "Găsește-ți contul",
	"import.step1Text":
		"Mergi pe spotify.com, autentifică-te, apoi deschide meniul Cont din dreapta sus.",
	"import.step2Title": "Deschide Confidențialitatea contului",
	"import.step2Text":
		"În bara laterală a setărilor contului, derulează până la secțiunea Confidențialitatea contului.",
	"import.step3Title": "Solicită datele tale",
	"import.step3Text":
		"La „Descarcă datele tale”, găsește Istoricul extins de streaming și bifează-l, debifează Datele contului, apoi apasă Solicită datele.",
	"import.step4Title": "Așteaptă e-mailul",
	"import.step4Text":
		"Spotify trimite un link de confirmare prin e-mail — apasă-l pentru a începe exportul. După un timp (adesea câteva zile) trimit un link de descărcare. Ia fișierul my_spotify_data.zip și trage-l aici — nu e nevoie să-l dezarhivezi.",
	"import.stepAlt": "Pasul {n}: {title}",
	"import.backToUpload": "Înapoi la încărcare",
	"import.welcomeTitle": "Bine ai venit la Wrapped",
	"import.welcomeLede":
		"Niciun istoric de ascultare încă. Trage {file} mai jos pentru a începe",
	"import.reimportLede":
		"Importă un export Spotify pentru a înlocui tot ce este încărcat acum. Aceasta suprascrie datele existente.",
	"import.reading": "Se citește exportul… {pct}%",
	"import.importing": "Se importă istoricul… poate dura puțin.",
	"import.complete": "Import finalizat — datele tale au fost înlocuite.",
	"import.dropAnother": "Trage altă arhivă pentru a importa din nou.",
	"import.dropHere":
		"Trage my_spotify_data.zip aici sau dă clic pentru a alege",
	"import.onlyZip": "Doar fișierul .zip — nu e nevoie să-l dezarhivezi întâi.",
	"import.learnHow": "Află cum să-ți încarci datele de la Spotify",
	"import.reimportWarn":
		"Reimportarea înlocuiește toate datele încărcate acum.",
	"import.privacy":
		"Datele tale nu părăsesc niciodată acest dispozitiv. {emph}. Totul este procesat chiar aici, în browserul tău, și nimic nu este încărcat, stocat sau transmis nicăieri.",
	"import.privacyEmph": "Niciun fel de date nu sunt trimise prin rețea",
	"import.errZip": "Te rog trage o arhivă .zip.",
	"import.errFailed": "Importul a eșuat.",

	// --- Track / Artist detail --------------------------------------------
	"detail.skipRate": "rată de sărire",
	"detail.rank": "rang",
	"detail.byPlaysLifetime": "după redări, pe viață",
	"detail.firstHeard": "prima ascultare",
	"detail.length": "durată",
	"detail.longestPlay": "cea mai lungă redare",
	"detail.vsAverage": "{x}× față de media ta",
	"track.playsPerMonth": "Redări pe lună",
	"track.whenYouPlay": "Când o asculți (ora zilei)",
	"track.byWeekday": "Când o asculți (ziua săptămânii)",
	"track.completion": "Finalizare",
	"track.howItStarts": "Cum începe",
	"track.howItEnds": "Cum se termină",
	"track.platforms": "Platforme",
	"track.countries": "Unde ai ascultat",
	"track.completionTrend": "O termini? (pe ani)",
	"track.rankByYear": "Poziția în clasament pe ani",
	"track.leadsInto": "Duce spre",
	"track.comesBefore": "Vine înainte",
	"track.segueCount": "ori",
	"track.originTitle": "Cum a început",
	"track.originLine": "Auzită prima dată {weekday}, {date}.",
	"track.originGateway": "Imediat după {gateway}.",
	"track.season": "legată de sezon",
	"track.onRepeat": "pe repeat",
	"track.bingeDays": "zile de binge",
	"track.bingeDaysSub": "3+ redări într-o zi",
	"track.fullListens": "ascultări complete",
	"track.fullListensSub": "echivalent de la cap la coadă",
	"track.timesFinished": "ori finalizată",
	"track.timesFinishedSub": "redată până la capăt",
	"track.lastPlayed": "ultima redare",
	"track.daysAgo": "acum {n} z",
	"track.milestone": "bornă",
	"track.shuffleShare": "pe shuffle",
	"track.shuffleSub": "din redări au fost pe shuffle",
	"track.skipSplit":
		"Sare {shuffle} pe shuffle față de {intent} când o alegi tu.",
	"track.comebackTitle": "Redescoperire",
	"track.comebackLine": "A tăcut {gap}, apoi {n} redări în 30 de zile.",
	"artist.top3": "top 3 piese = {pct} din redări — {verdict}",
	"artist.liveOnHits": "trăiești pe hituri",
	"artist.wholeCatalogue": "explorezi tot catalogul",
	"artist.hoursPerMonth": "Ore pe lună",
	"artist.topAlbums": "Top albume după ore",
	"artist.allTracks": "Toate piesele",
	"artist.allTracksCount": "Toate piesele ({count})",
	"artist.whenYouPlay": "Când îi asculți (ora din zi)",
	"artist.byWeekday": "Când îi asculți (ziua săptămânii)",
	"artist.peak": "luna de vârf",
	"artist.peakSub": "{plays} redări",
	"artist.loyalty": "loialitate",
	"artist.loyaltyYears": "{years} ani",
	"artist.loyaltySub": "{months} luni active",
	"artist.gateway": "Prima piesă:",
	"artist.skipVsBaseline": "față de {pct} în bibliotecă",

	// --- Year in review ----------------------------------------------------
	"year.inReview": "{year} în retrospectivă",
	"year.streamsSub": "{count} ≥30s",
	"year.topTracks": "Top piese",
	"year.topArtists": "Top artiști",
	"year.busiestDay": "cea mai activă zi",
	"year.busiestSub": "{hours} h · {plays} redări",
	"year.longestStreak": "cea mai lungă serie",
	"year.streakSub": "{from} → {to}",
	"year.biggestDiscovery": "cea mai mare descoperire",
	"year.discoverySub": "{hours} h, ascultată prima dată anul acesta",
	"year.skipChampion": "campion la sărit",
	"year.skipChampionSub": "{pct} sărite din {plays} redări",

	// --- links -------------------------------------------------------------
	"links.openInSpotify": "Deschide în Spotify",
	"links.spotifyPlayer": "Player Spotify",
	"links.back": "Înapoi",
	"links.backLabel": "Întoarce-te la pagina anterioară",
	"links.unknownArtist": "artist necunoscut",

	// --- command palette ---------------------------------------------------
	"palette.placeholder": "Caută piese și artiști…",
	"palette.artist": "artist",
	"palette.track": "piesă",
	"palette.noMatches": "Nicio potrivire",

	// --- Story -------------------------------------------------------------
	"story.origin.eyebrow": "Cum a început",
	"story.origin.line": "A început cu {track} într-o {weekday}, {date}.",
	"story.origin.foot": "{artist} · acum {years} ani",
	"story.time.eyebrow": "În total",
	"story.time.line":
		"Ai apăsat play timp de {days} la rând — aproximativ {weeks} săptămâni de lucru pline de muzică.",
	"story.time.foot": "{hours} ore din {year}",
	"story.persona.eyebrow": "Cine ești",
	"story.persona.line": "Ești un {clock} {loyalty} care {skip}.",
	"story.persona.foot":
		"{night} după lăsarea întunericului · rată de sărire {skip} · {oneshots} artiști încercați o singură dată",
	"story.persona.loyal": "feroce de loial",
	"story.persona.curious": "nesfârșit de curios",
	"story.persona.openMinded": "cu mintea deschisă",
	"story.persona.nightOwl": "ascultător de noapte",
	"story.persona.daytime": "ascultător de zi",
	"story.persona.allHours": "ascultător la orice oră",
	"story.persona.neverSkips": "aproape niciodată nu sare",
	"story.persona.rarelySkips": "rar sare",
	"story.persona.skipsHard": "sare fără milă",
	"story.obsession.eyebrow": "Recordul tău",
	"story.obsession.line": "Într-o zi ai ascultat {track} de {times}.",
	"story.obsession.times": "{count} ori",
	"story.obsession.foot": "{date} · {artist}",
	"story.faded.eyebrow": "Ai trecut mai departe",
	"story.faded.line":
		"Nu ai mai ascultat {track} din {since}. Era imnul tău în {peak}.",
	"story.faded.foot": "{plays} redări în acel an · {artist}",
	"story.crossroads.eyebrow": "Trage-ți sufletul",
	"story.crossroads.line":
		"Asta a fost prima jumătate. Continuă să derulezi, {more} mai jos.",
	"story.crossroads.more": "mai mult din povestea ta",
	"story.crossroads.foot":
		"Sau ieși acum: deschide {summary} ori intră în {insights}.",
	"story.crossroads.summary": "Rezumat",
	"story.crossroads.insights": "Statistici",
	"story.companion.eyebrow": "Încă aici",
	"story.companion.line":
		"Prin toate, {artist} a rămas cu tine de {years} și continuă.",
	"story.companion.foot": "{plays} · în rotația ta din {firstYear}",
	"story.comeback.eyebrow": "Te-ai întors",
	"story.comeback.line":
		"Ai lăsat {track} în tăcere {gap}, apoi nu te-ai mai putut opri.",
	"story.comeback.foot":
		"Revenit pe {date} · {plays} în luna de după · {artist}",
	"story.marathon.eyebrow": "Într-o zi nu te-ai oprit",
	"story.marathon.line": "Pe {date} ai ascultat {hours}.",
	"story.marathon.foot": "{weekday} · {streams} piese · mai ales {artist}",
	"story.devotion.eyebrow": "Niciodată sărită",
	"story.devotion.line":
		"Ai ascultat {track} {times} și de fiecare dată ai lăsat-o până la capăt.",
	"story.devotion.foot": "{artist} · deși din rest săreai {skip}",
	"story.closing.eyebrow": "Asta e povestea",
	"story.closing.line":
		"Cifrele din spatele fiecărui ritm te așteaptă în {summary}.",
	"story.closing.summary": "Rezumat",
	"story.closing.foot": "Vrei și tiparele? {insights} tale merg mai adânc.",
	"story.closing.insights": "Statistici",
	"story.closing.cta": "Mergi la Rezumat →",

	// --- completion bands --------------------------------------------------
	"completion.finished": "Terminată",
	"completion.most": "Cea mai mare parte",
	"completion.partial": "Parțial",
	"completion.bailed": "Abandonată devreme",
	"completion.unknown": "Necunoscut",

	// --- reason_start codes ------------------------------------------------
	"reasonStart.trackdone": "Piesa anterioară s-a terminat",
	"reasonStart.fwdbtn": "Sărită înainte la ea",
	"reasonStart.backbtn": "Sărită înapoi la ea",
	"reasonStart.clickrow": "Aleasă dintr-o listă",
	"reasonStart.playbtn": "Apăsat play",
	"reasonStart.appload": "Aplicația deschisă",
	"reasonStart.remote": "Dispozitiv remote / cast",
	"reasonStart.trackerror": "După o eroare de piesă",
	"reasonStart.?": "Necunoscut",

	// --- reason_end codes --------------------------------------------------
	"reasonEnd.trackdone": "Redată până la capăt",
	"reasonEnd.fwdbtn": "Sărită înainte",
	"reasonEnd.backbtn": "Sărit înapoi",
	"reasonEnd.endplay": "Redare oprită",
	"reasonEnd.logout": "Deconectat",
	"reasonEnd.remote": "Dispozitiv remote / cast",
	"reasonEnd.trackerror": "Eroare de piesă",
	"reasonEnd.unexpected-exit": "Aplicația închisă",
	"reasonEnd.unexpected-exit-while-paused": "Închisă pe pauză",
	"reasonEnd.?": "Necunoscut",
};
