import type { Translation } from "./index";

// Ukrainian — Українська. Typed against the English keys in ./en; anything
// omitted falls back to the English string.
export const uk: Translation = {
	// --- app shell ---------------------------------------------------------
	"app.openMenu": "Відкрити меню",
	"app.closeMenu": "Закрити меню",
	"app.search": "пошук",
	"app.footer.about":
		"self-hosted аналізатор вашої історії прослуховування у Spotify. Імпортуйте розширену історію прослуховувань, щоб дослідити тренди, улюблені треки та виконавців і те, як змінювався ваш смак із часом. Усі дані залишаються на вашому пристрої.",
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
	"nav.group.home": "Головна",
	"nav.group.music": "Музика",
	"nav.group.insights": "Аналітика",
	"nav.group.timeline": "Хронологія",
	"nav.group.explore": "Дослідження",
	"nav.group.system": "Система",
	"nav.insights.overview": "Огляд",
	"nav.insights.taste": "Смак",
	"nav.insights.habits": "Звички",
	"nav.insights.events": "Події",
	"nav.insights.devices": "Пристрої",
	"insights.dashboardTitle": "Аналітика",
	"insights.empty": "Незабаром з'являться нові інсайти.",
	"insights.notEnough": "Поки недостатньо даних.",

	// Overview headline cards
	"insights.overview.lede":
		"Глибший погляд на те, що ви слухаєте: характер смаку, щоденні звички, помітні події та пристрої за всім цим. Оберіть вкладку вище.",
	"insights.overview.gini": "концентрація смаку",
	"insights.overview.longestHiatus": "найдовша пауза",
	"insights.overview.nightShare": "прослуховування після опівночі",

	// --- §24 Range index ---------------------------------------------------
	"insights.range.title": "Індекс різноманіття",
	"insights.range.lede":
		"Яка частка вашого прослуховування припадає на жменьку треків. 0 — цілковито рівномірно; ближче до 1 — кілька пісень домінують.",
	"insights.range.gini": "концентрація (Gini)",
	"insights.range.top1": "частка топ 1%",
	"insights.range.byYear": "Концентрація по роках",
	"insights.range.giniLine": "Gini",
	"insights.range.top1Line": "частка топ 1%",

	// --- §17 Loyal companions ---------------------------------------------
	"insights.companions.title": "Вірні супутники",
	"insights.companions.lede":
		"Звучали щороку у вашій історії — константи, що ніколи не зникали.",
	"insights.companions.empty":
		"Потрібно щонайменше 3 роки даних, щоб знайти ваші константи.",

	// --- §15 Seasonal ------------------------------------------------------
	"insights.seasonal.title": "Пісні пір року",
	"insights.seasonal.lede":
		"Треки, прослуховування яких концентруються в одному часі року — ваші літні гімни та зимові пісні.",
	"insights.seasonal.peak": "пік",
	"insights.seasonal.concentration": "прив'язані до сезону",
	"insights.seasonal.empty":
		"Потрібно щонайменше 2 роки даних, щоб помітити сезонність.",

	// --- §21 Chronotype ----------------------------------------------------
	"insights.chronotype.title": "Зсув хронотипу",
	"insights.chronotype.lede":
		"Типова година прослуховування протягом років — ви стаєте більш нічним слухачем?",
	"insights.chronotype.meanHour": "центр ваги",
	"insights.chronotype.nightShare": "до 6 ранку",
	"insights.chronotype.meanLine": "середня година",

	// --- §20 Weekend vs weekday -------------------------------------------
	"insights.weekend.title": "Ви в будні та у вихідні",
	"insights.weekend.lede":
		"У будні ви на {pct} відрізняєтесь від себе у вихідні.",
	"insights.weekend.weekday": "Будні",
	"insights.weekend.weekend": "Вихідні",

	// --- §16 Attention span ------------------------------------------------
	"insights.attention.title": "Тривалість уваги",
	"insights.attention.lede":
		"Ви все ще дослуховуєте пісні? Середня частка кожного треку, яку ви насправді слухаєте, по роках.",
	"insights.attention.completion": "середнє завершення",
	"insights.attention.median": "медіанне прослуховування",
	"insights.attention.completionLine": "завершеність",

	// --- §25 Hiatuses ------------------------------------------------------
	"insights.hiatuses.title": "Паузи",
	"insights.hiatuses.lede":
		"Проміжки, коли ви майже не відкривали Spotify — ваші найдовші мовчання. Прогалина в експорті може виглядати так само, як і справжня пауза.",

	// --- §18 Rediscoveries -------------------------------------------------
	"insights.rediscoveries.title": "Перевідкриття",
	"insights.rediscoveries.lede":
		"Треки, які замовкли на місяці, а потім повернулись із новою силою.",
	"insights.rediscoveries.revival": "{n} прослух. за 30 днів",

	// --- §19 On repeat -----------------------------------------------------
	"insights.loops.title": "На повторі",
	"insights.loops.lede":
		"Послідовні прослуховування того самого треку підряд — коли ви дійсно ставили його на повтор.",
	"insights.loops.run": "{n}× поспіль",

	// --- §22 Device archaeology -------------------------------------------
	"insights.devices.title": "Археологія пристроїв",
	"insights.devices.lede":
		"Апаратна історія, прихована у полі платформи — коли з'являлося і зникало кожне сімейство пристроїв. Навмисно приблизно: точний user-agent ніколи не імпортується.",
	"insights.devices.share": "частка",

	// --- §23 Incognito & offline ------------------------------------------
	"insights.privacy.title": "Інкогніто та офлайн",
	"insights.privacy.lede":
		"Дві речі, які зазвичай ніхто не показує: приватні сесії, що так і не потрапили у ваш профіль, і те, що ви завантажили в дорогу.",
	"insights.privacy.incognito": "прослух. в інкогніто",
	"insights.privacy.offline": "офлайн прослух.",
	"insights.privacy.topOffline": "Топ завантажень (офлайн)",
	"insights.privacy.topIncognito": "Топ треків в інкогніто",
	"insights.privacy.none": "Приватних або офлайн прослуховувань не записано.",

	// --- shared insight columns -------------------------------------------
	"insights.col.years": "роки",
	"insights.col.peak": "піковий місяць",
	"insights.col.locked": "прив'язано",
	"insights.col.gap": "мовчання",
	"insights.col.comeback": "повернення",
	"insights.col.revival": "відродження",
	"insights.col.run": "повтор",
	"insights.col.started": "початок",
	"insights.col.device": "пристрій",
	"insights.col.first": "перший",
	"insights.col.last": "останній",
	"insights.col.from": "з",
	"insights.col.to": "до",
	"insights.col.days": "дні",

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
	"count.years_one": "{n} рік",
	"count.years_few": "{n} роки",
	"count.years_many": "{n} років",
	"count.months_one": "{n} місяць",
	"count.months_few": "{n} місяці",
	"count.months_many": "{n} місяців",
	"count.hours_one": "{n} година",
	"count.hours_few": "{n} години",
	"count.hours_many": "{n} годин",

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
	"import.importing": "Імпорт історії… це може зайняти трохи часу.",
	"import.complete": "Імпорт завершено — ваші дані замінено.",
	"import.dropAnother": "Перетягніть інший архів, щоб імпортувати знову.",
	"import.dropHere":
		"Перетягніть my_spotify_data.zip сюди або натисніть, щоб вибрати",
	"import.onlyZip": "Лише .zip — розпаковувати заздалегідь не потрібно.",
	"import.learnHow": "Дізнайтеся, як завантажити дані зі Spotify",
	"import.reimportWarn": "Повторний імпорт замінює всі завантажені зараз дані.",
	"import.privacy":
		"Ваші дані ніколи не залишають цей пристрій. {emph}. Усе обробляється просто тут, у вашому браузері, і нічого не завантажується, не зберігається й нікуди не передається.",
	"import.privacyEmph": "Жодні дані не надсилаються через мережу",
	"import.errZip": "Будь ласка, перетягніть архів .zip.",
	"import.errFailed": "Імпорт не вдався.",

	// --- Track / Artist detail --------------------------------------------
	"detail.skipRate": "частота пропусків",
	"detail.rank": "ранг",
	"detail.byPlaysLifetime": "за прослуховуваннями, за весь час",
	"detail.firstHeard": "уперше почуто",
	"detail.length": "тривалість",
	"detail.longestPlay": "найдовше прослуховування",
	"detail.vsAverage": "{x}× від вашого середнього",
	"track.playsPerMonth": "Прослуховувань на місяць",
	"track.whenYouPlay": "Коли ви це слухаєте (година дня)",
	"track.byWeekday": "Коли ви це слухаєте (день тижня)",
	"track.completion": "Завершеність",
	"track.howItStarts": "Як починається",
	"track.howItEnds": "Як завершується",
	"track.platforms": "Платформи",
	"track.countries": "Де ви слухали",
	"track.completionTrend": "Чи дослуховуєте до кінця? (за роками)",
	"track.rankByYear": "Позиція в чарті за роками",
	"track.leadsInto": "Веде до",
	"track.comesBefore": "Звучить перед",
	"track.segueCount": "разів",
	"track.originTitle": "Як усе почалося",
	"track.originLine": "Уперше почуто в {weekday}, {date}.",
	"track.originGateway": "Одразу після {gateway}.",
	"track.season": "сезонність",
	"track.onRepeat": "на повторі",
	"track.bingeDays": "дні запою",
	"track.bingeDaysSub": "3+ прослуховувань за день",
	"track.fullListens": "повних прослуховувань",
	"track.fullListensSub": "еквівалент від початку до кінця",
	"track.timesFinished": "разів дослухано",
	"track.timesFinishedSub": "програно до кінця",
	"track.lastPlayed": "востаннє слухали",
	"track.daysAgo": "{n} дн тому",
	"track.milestone": "віха",
	"track.shuffleShare": "у перемішуванні",
	"track.shuffleSub": "прослуховувань у перемішуванні",
	"track.skipSplit":
		"Пропускаєте {shuffle} у перемішуванні і {intent}, коли обираєте самі.",
	"track.comebackTitle": "Повернення",
	"track.comebackLine":
		"Затихло на {gap}, потім {n} прослуховувань за 30 днів.",
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
	"story.crossroads.eyebrow": "Переведіть подих",
	"story.crossroads.line":
		"Це лише перша половина. Гортайте далі, {more} попереду.",
	"story.crossroads.more": "більше вашої історії",
	"story.crossroads.foot":
		"Або вийдіть зараз: відкрийте {summary} чи зануртеся в {insights}.",
	"story.crossroads.summary": "Огляд",
	"story.crossroads.insights": "Аналітика",
	"story.companion.eyebrow": "Досі поруч",
	"story.companion.line":
		"Крізь усе це {artist} залишався з вами вже {years} і далі.",
	"story.companion.foot": "{plays} · у вашій ротації з {firstYear}",
	"story.comeback.eyebrow": "Ви повернулися",
	"story.comeback.line":
		"Ви відпустили {track} на {gap}, а потім знову не могли спинитися.",
	"story.comeback.foot":
		"Повернення {date} · {plays} за місяць після · {artist}",
	"story.marathon.eyebrow": "Одного дня ви не спинялися",
	"story.marathon.line": "{date} ви слухали {hours}.",
	"story.marathon.foot": "{weekday} · {streams} треків · здебільшого {artist}",
	"story.devotion.eyebrow": "Жодного разу не пропустили",
	"story.devotion.line":
		"Ви слухали {track} {times} і щоразу давали дослухати до кінця.",
	"story.devotion.foot": "{artist} · хоча решту пропускали на {skip}",
	"story.closing.eyebrow": "Ось і вся історія",
	"story.closing.line":
		"Цифри за кожним бітом чекають на вас у розділі {summary}.",
	"story.closing.summary": "Огляд",
	"story.closing.foot":
		"Хочете побачити закономірності? Ваша {insights} копне глибше.",
	"story.closing.insights": "Аналітика",
	"story.closing.cta": "Перейти до огляду →",

	// --- completion bands --------------------------------------------------
	"completion.finished": "Дослухано",
	"completion.most": "Більшу частину",
	"completion.partial": "Частково",
	"completion.bailed": "Покинуто на початку",
	"completion.unknown": "Невідомо",

	// --- reason_start codes ------------------------------------------------
	"reasonStart.trackdone": "Попередній трек завершився",
	"reasonStart.fwdbtn": "Перейшли вперед до нього",
	"reasonStart.backbtn": "Перейшли назад до нього",
	"reasonStart.clickrow": "Вибрано зі списку",
	"reasonStart.playbtn": "Натиснуто play",
	"reasonStart.appload": "Застосунок відкрито",
	"reasonStart.remote": "Віддалений / cast пристрій",
	"reasonStart.trackerror": "Після помилки треку",
	"reasonStart.?": "Невідомо",

	// --- reason_end codes --------------------------------------------------
	"reasonEnd.trackdone": "Програно до кінця",
	"reasonEnd.fwdbtn": "Перемотано вперед",
	"reasonEnd.backbtn": "Повернулися назад",
	"reasonEnd.endplay": "Зупинено відтворення",
	"reasonEnd.logout": "Вихід із акаунта",
	"reasonEnd.remote": "Віддалений / cast пристрій",
	"reasonEnd.trackerror": "Помилка треку",
	"reasonEnd.unexpected-exit": "Застосунок закрито",
	"reasonEnd.unexpected-exit-while-paused": "Закрито на паузі",
	"reasonEnd.?": "Невідомо",
};
