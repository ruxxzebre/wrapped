import type { Translation } from "./index";

// Ukrainian — Українська. Typed against the English keys in ./en; anything
// omitted falls back to the English string.
export const uk: Translation = {
	// --- app shell ---------------------------------------------------------
	"app.openMenu": "Відкрити меню",
	"app.closeMenu": "Закрити меню",
	"app.search": "пошук",
	"app.footer.about":
		"self-hosted аналізатор історії прослуховування Spotify. Імпортуйте розширений експорт історії стрімінгу, щоб дослідити тренди, улюблені треки та виконавців і свій смак із часом. Усі дані залишаються на вашому пристрої.",
	"app.footer.builtBy": "Створено",

	// --- navigation --------------------------------------------------------
	"nav./": "Огляд",
	"nav./story": "Історія",
	"nav./top-tracks": "Топ треків",
	"nav./top-artists": "Топ виконавців",
	"nav./patterns": "Патерни",
	"nav./calendar": "Календар",
	"nav./library": "Бібліотека",
	"nav./play-log": "Журнал прослуховувань",
	"nav./compare": "Порівняння",
	"nav./import": "Імпорт",
	"nav./settings": "Налаштування",

	// --- shared controls ---------------------------------------------------
	"controls.rankBy": "сортувати за",
	"controls.period": "період",
	"controls.from": "з",
	"controls.to": "до",
	"controls.minSeconds": "мін. секунд",
	"controls.limit": "ліміт",
	"controls.year": "рік",
	"controls.search": "пошук",
	"period.all": "увесь час",
	"period.custom": "власний",
	"metric.plays": "прослуховування",
	"metric.time": "час",

	// --- shared table columns ---------------------------------------------
	"col.rank": "#",
	"col.track": "трек",
	"col.artist": "виконавець",
	"col.album": "альбом",
	"col.plays": "прослух.",
	"col.hours": "години",
	"col.tracks": "треки",
	"col.last": "останній",
	"col.skip": "пропуск",
	"col.playedAt": "зіграно",
	"col.for": "трив.",
	"col.platform": "платформа",
	"col.move": "зсув",
	"col.aRank": "ранг A",
	"col.bRank": "ранг B",
	"col.aValue": "A {unit}",
	"col.bValue": "B {unit}",

	// --- shared bits -------------------------------------------------------
	"common.cancel": "Скасувати",
	"common.dash": "—",
	"unit.plays": "прослух.",
	"unit.hrs": "год",
	"count.plays_one": "{n} прослуховування",
	"count.plays_few": "{n} прослуховування",
	"count.plays_many": "{n} прослуховувань",
	"count.days_one": "{n} день",
	"count.days_few": "{n} дні",
	"count.days_many": "{n} днів",

	// --- status / splash ---------------------------------------------------
	"status.loading": "завантаження…",

	// --- Summary -----------------------------------------------------------
	"card.plays": "прослуховування",
	"card.hours": "години",
	"card.tracks": "треки",
	"card.artists": "виконавці",
	"card.skips": "пропуски",
	"card.since": "з",
	"summary.streamsSub": "{count} стрімів ≥30с",
	"summary.latest": "останній {date}",
	"summary.pctOfPlays": "{pct} прослуховувань",
	"summary.hoursPerYear": "Годин на рік",
	"summary.playsPerYear": "Прослуховувань на рік",

	// --- On this day -------------------------------------------------------
	"onThisDay.title": "Цього дня",
	"onThisDay.thisWeek": "цього тижня",
	"onThisDay.yearsAgo": "{count} р. тому",

	// --- Patterns ----------------------------------------------------------
	"patterns.byHour": "Прослуховування за годинами дня (місцевий час початку)",
	"patterns.byWeekday": "Прослуховування за днями тижня",

	// --- Calendar ----------------------------------------------------------
	"calendar.summary": "{hours} годин за {days} активних днів у {year}",
	"calendar.less": "менше",
	"calendar.more": "більше",
	"calendar.activityTitle": "Активність прослуховування за днями",
	"calendar.dayPlays": "{plays} прослух. · {hours} год",
	"calendar.noPlays": "немає прослуховувань",

	// --- Library -----------------------------------------------------------
	"library.searchPlaceholder": "трек / виконавець / альбом",
	"library.countOf": "{shown} з {total} треків",

	// --- Play Log ----------------------------------------------------------
	"playLog.searchPlaceholder": "трек / виконавець",
	"playLog.loadingMore": "завантаження…",

	// --- Compare -----------------------------------------------------------
	"compare.compare": "порівняти",
	"compare.artists": "виконавці",
	"compare.tracks": "треки",

	// --- Settings ----------------------------------------------------------
	"settings.playback": "Відтворення",
	"settings.showPlayer": "Показувати вбудований плеєр Spotify",
	"settings.showPlayerHint":
		"Відображає плеєр на кожній сторінці треку. Автоматично прихований, коли трек недоступний у Spotify.",
	"settings.time": "Час",
	"settings.timezone": "Часовий пояс",
	"settings.timezoneHint":
		"Графіки за годинами, днями тижня та календарем групують прослуховування в цьому часовому поясі. За замовчуванням — пояс вашого браузера. Виберіть пояс, у якому ви насправді жили, якщо він відрізняється.",
	"settings.language": "Мова",
	"settings.languageAuto": "Автоматично (як у системі)",
	"settings.languageHint":
		"Мова інтерфейсу. За замовчуванням — мова вашої системи, якщо доступна, інакше англійська.",
	"settings.dangerZone": "Небезпечна зона",
	"settings.clearLibrary": "Очистити бібліотеку",
	"settings.clearing": "Очищення…",
	"settings.deleteImported": "Видалити імпортовані дані",
	"settings.clearLibraryHint":
		"Стирає базу даних і збережений знімок, повертаючи вас на екран привітання. Це не можна скасувати — доведеться заново імпортувати експорт Spotify.",
	"settings.confirmClearTitle": "Очистити бібліотеку?",
	"settings.confirmClearBody":
		"Це назавжди видалить усі імпортовані дані прослуховування з цього браузера. Ви зможете заново імпортувати експорт Spotify.",

	// --- Import ------------------------------------------------------------
	"import.getData": "Отримайте свої дані Spotify",
	"import.step1Title": "Знайдіть свій акаунт",
	"import.step1Text":
		"Перейдіть на spotify.com, увійдіть, потім відкрийте меню Акаунт у правому верхньому куті.",
	"import.step2Title": "Відкрийте Конфіденційність акаунта",
	"import.step2Text":
		"У бічній панелі налаштувань акаунта прокрутіть до розділу Конфіденційність акаунта.",
	"import.step3Title": "Запросіть свої дані",
	"import.step3Text":
		"У розділі «Завантажити дані» знайдіть Розширену історію стрімінгу й позначте її, зніміть позначку з Даних акаунта, потім натисніть Запросити дані.",
	"import.step4Title": "Дочекайтеся листа",
	"import.step4Text":
		"Spotify надішле посилання для підтвердження — натисніть його, щоб почати експорт. Через деякий час (часто кілька днів) вони надішлють посилання для завантаження. Візьміть файл my_spotify_data.zip і перетягніть його сюди — розпаковувати не потрібно.",
	"import.stepAlt": "Крок {n}: {title}",
	"import.backToUpload": "Назад до завантаження",
	"import.welcomeTitle": "Ласкаво просимо до Wrapped",
	"import.welcomeLede":
		"Історії прослуховування ще немає. Перетягніть {file} нижче, щоб почати",
	"import.reimportLede":
		"Імпортуйте експорт Spotify, щоб замінити все завантажене зараз. Це перезапише наявні дані.",
	"import.reading": "Читання експорту… {pct}%",
	"import.importing": "Імпорт історії… це може зайняти момент.",
	"import.complete": "Імпорт завершено — ваші дані замінено.",
	"import.dropAnother": "Перетягніть інший архів, щоб імпортувати знову.",
	"import.dropHere":
		"Перетягніть my_spotify_data.zip сюди або натисніть, щоб вибрати",
	"import.onlyZip": "Лише .zip — розпаковувати заздалегідь не потрібно.",
	"import.learnHow": "Дізнайтеся, як завантажити дані зі Spotify",
	"import.reimportWarn": "Повторний імпорт замінює всі завантажені зараз дані.",
	"import.errZip": "Будь ласка, перетягніть архів .zip.",
	"import.errFailed": "Імпорт не вдався.",

	// --- Track / Artist detail --------------------------------------------
	"detail.skipRate": "частота пропусків",
	"detail.rank": "ранг",
	"detail.byPlaysLifetime": "за прослуховуваннями, за весь час",
	"detail.firstHeard": "уперше почуто",
	"detail.length": "тривалість",
	"detail.longestPlay": "найдовше прослуховування",
	"track.playsPerMonth": "Прослуховувань на місяць",
	"track.whenYouPlay": "Коли ви це слухаєте (година дня)",
	"track.completion": "Завершеність",
	"track.howItStarts": "Як починається",
	"track.platforms": "Платформи",
	"artist.top3": "топ-3 треки = {pct} прослуховувань — {verdict}",
	"artist.liveOnHits": "ви живете на хітах",
	"artist.wholeCatalogue": "ви опрацьовуєте весь каталог",
	"artist.hoursPerMonth": "Годин на місяць",
	"artist.topAlbums": "Топ альбомів за годинами",
	"artist.allTracks": "Усі треки",
	"artist.allTracksCount": "Усі треки ({count})",

	// --- Year in review ----------------------------------------------------
	"year.inReview": "Підсумки {year}",
	"year.streamsSub": "{count} ≥30с",
	"year.topTracks": "Топ треків",
	"year.topArtists": "Топ виконавців",
	"year.busiestDay": "найактивніший день",
	"year.busiestSub": "{hours} год · {plays} прослух.",
	"year.longestStreak": "найдовша серія",
	"year.streakSub": "{from} → {to}",
	"year.biggestDiscovery": "найбільше відкриття",
	"year.discoverySub": "{hours} год, уперше почуто цього року",
	"year.skipChampion": "чемпіон із пропусків",
	"year.skipChampionSub": "{pct} пропущено з {plays} прослуховувань",

	// --- links -------------------------------------------------------------
	"links.openInSpotify": "Відкрити у Spotify",
	"links.spotifyPlayer": "Плеєр Spotify",
	"links.back": "Назад",
	"links.backLabel": "Повернутися на попередню сторінку",
	"links.unknownArtist": "невідомий виконавець",

	// --- command palette ---------------------------------------------------
	"palette.placeholder": "Пошук треків і виконавців…",
	"palette.artist": "виконавець",
	"palette.track": "трек",
	"palette.noMatches": "Немає збігів",

	// --- Story -------------------------------------------------------------
	"story.origin.eyebrow": "Як усе почалося",
	"story.origin.line": "Усе почалося з {track} у {weekday}, {date}.",
	"story.origin.foot": "{artist} · {years} років тому",
	"story.time.eyebrow": "Загалом",
	"story.time.line":
		"Ви натискали play {days} поспіль — близько {weeks} повних робочих тижнів музики.",
	"story.time.foot": "{hours} годин з {year}",
	"story.persona.eyebrow": "Хто ви",
	"story.persona.line": "Ви {loyalty} {clock}, який {skip}.",
	"story.persona.foot":
		"{night} після настання темряви · частота пропусків {skip} · {oneshots} виконавців спробувано лише раз",
	"story.persona.loyal": "відданий",
	"story.persona.curious": "безмежно допитливий",
	"story.persona.openMinded": "відкритий новому",
	"story.persona.nightOwl": "нічний слухач",
	"story.persona.daytime": "денний слухач",
	"story.persona.allHours": "цілодобовий слухач",
	"story.persona.neverSkips": "майже ніколи не пропускає",
	"story.persona.rarelySkips": "рідко пропускає",
	"story.persona.skipsHard": "пропускає без жалю",
	"story.obsession.eyebrow": "Ваш рекорд",
	"story.obsession.line": "Одного дня ви ввімкнули {track} {times}.",
	"story.obsession.times": "{count} разів",
	"story.obsession.foot": "{date} · {artist}",
	"story.faded.eyebrow": "Ви рушили далі",
	"story.faded.line":
		"Ви не вмикали {track} з {since}. Це був ваш гімн у {peak}.",
	"story.faded.foot": "{plays} прослуховувань того року · {artist}",
	"story.closing.eyebrow": "Ось і вся історія",
	"story.closing.line":
		"Цифри за кожним бітом чекають на вас у розділі {summary}.",
	"story.closing.summary": "Огляд",
	"story.closing.cta": "Перейти до огляду →",

	// --- completion bands --------------------------------------------------
	"completion.finished": "Дослухано",
	"completion.most": "Більшу частину",
	"completion.partial": "Частково",
	"completion.bailed": "Покинуто на початку",
	"completion.unknown": "Невідомо",

	// --- reason_start codes ------------------------------------------------
	"reasonStart.trackdone": "Попередній трек завершився",
	"reasonStart.fwdbtn": "Перемотка вперед до нього",
	"reasonStart.backbtn": "Перемотка назад до нього",
	"reasonStart.clickrow": "Вибрано зі списку",
	"reasonStart.playbtn": "Натиснуто play",
	"reasonStart.appload": "Застосунок відкрито",
	"reasonStart.remote": "Віддалений / cast пристрій",
	"reasonStart.trackerror": "Після помилки треку",
	"reasonStart.?": "Невідомо",
};
