import type { Translation } from "./index";

// Russian — Русский. Typed against the English keys in ./en; anything omitted
// falls back to the English string.
export const ru: Translation = {
	// --- app shell ---------------------------------------------------------
	"app.openMenu": "Открыть меню",
	"app.closeMenu": "Закрыть меню",
	"app.search": "поиск",
	"app.footer.about":
		"self-hosted анализатор вашей истории прослушивания в Spotify. Импортируйте расширенную историю прослушиваний, чтобы изучить тренды, любимые треки и исполнителей и то, как менялся ваш вкус со временем. Все данные остаются на вашем устройстве.",
	"app.footer.builtBy": "Создано",

	// --- navigation --------------------------------------------------------
	"nav./": "Обзор",
	"nav./story": "История",
	"nav./top-tracks": "Топ треков",
	"nav./top-artists": "Топ исполнителей",
	"nav./patterns": "Паттерны",
	"nav./calendar": "Календарь",
	"nav./library": "Библиотека",
	"nav./play-log": "Журнал прослушиваний",
	"nav./compare": "Сравнение",
	"nav./import": "Импорт",
	"nav./settings": "Настройки",
	"nav.group.home": "Главная",
	"nav.group.music": "Музыка",
	"nav.group.insights": "Аналитика",
	"nav.group.timeline": "Хронология",
	"nav.group.explore": "Исследовать",
	"nav.group.system": "Система",
	"nav.insights.overview": "Обзор",
	"nav.insights.taste": "Вкус",
	"nav.insights.habits": "Привычки",
	"nav.insights.events": "События",
	"nav.insights.devices": "Устройства",
	"insights.dashboardTitle": "Аналитика",
	"insights.empty": "Скоро появятся новые инсайты.",
	"insights.notEnough": "Данных пока недостаточно.",

	// Overview headline cards
	"insights.overview.lede":
		"Более глубокий взгляд на то, что вы слушаете: характер вкуса, ежедневные привычки, заметные события и устройства за всем этим. Выберите вкладку выше.",
	"insights.overview.gini": "концентрация вкуса",
	"insights.overview.longestHiatus": "самая долгая пауза",
	"insights.overview.nightShare": "прослушивания после полуночи",

	// --- §24 Range index ---------------------------------------------------
	"insights.range.title": "Индекс разнообразия",
	"insights.range.lede":
		"Какая доля прослушивания приходится на горстку треков. 0 — совершенно равномерно; ближе к 1 — несколько песен доминируют.",
	"insights.range.gini": "концентрация (Gini)",
	"insights.range.top1": "доля топ 1%",
	"insights.range.byYear": "Концентрация по годам",
	"insights.range.giniLine": "Gini",
	"insights.range.top1Line": "доля топ 1%",

	// --- §17 Loyal companions ---------------------------------------------
	"insights.companions.title": "Верные спутники",
	"insights.companions.lede":
		"Звучали каждый год за всю историю — константы, которые никогда не уходили.",
	"insights.companions.empty":
		"Нужно не менее 3 лет данных, чтобы найти ваши константы.",

	// --- §15 Seasonal ------------------------------------------------------
	"insights.seasonal.title": "Песни времён года",
	"insights.seasonal.lede":
		"Треки, прослушивания которых концентрируются в одно время года — ваши летние гимны и зимние песни.",
	"insights.seasonal.peak": "пик",
	"insights.seasonal.concentration": "привязаны к сезону",
	"insights.seasonal.empty":
		"Нужно не менее 2 лет данных, чтобы заметить сезонность.",

	// --- §21 Chronotype ----------------------------------------------------
	"insights.chronotype.title": "Смещение хронотипа",
	"insights.chronotype.lede":
		"Типичный час прослушивания по годам — вы становитесь более ночным слушателем?",
	"insights.chronotype.meanHour": "центр тяжести",
	"insights.chronotype.nightShare": "до 6 утра",
	"insights.chronotype.meanLine": "средний час",

	// --- §20 Weekend vs weekday -------------------------------------------
	"insights.weekend.title": "Вы в будни и в выходные",
	"insights.weekend.lede": "В будни вы на {pct} не такой, как по выходным.",
	"insights.weekend.weekday": "Будни",
	"insights.weekend.weekend": "Выходные",

	// --- §16 Attention span ------------------------------------------------
	"insights.attention.title": "Концентрация внимания",
	"insights.attention.lede":
		"Вы ещё дослушиваете песни? Средняя доля каждого трека, которую вы действительно слушаете, по годам.",
	"insights.attention.completion": "среднее завершение",
	"insights.attention.median": "медианное прослушивание",
	"insights.attention.completionLine": "завершённость",

	// --- §25 Hiatuses ------------------------------------------------------
	"insights.hiatuses.title": "Паузы",
	"insights.hiatuses.lede":
		"Промежутки, когда вы почти не открывали Spotify — ваши самые долгие молчания. Пробел в экспорте может выглядеть так же, как настоящий перерыв.",

	// --- §18 Rediscoveries -------------------------------------------------
	"insights.rediscoveries.title": "Переоткрытия",
	"insights.rediscoveries.lede":
		"Треки, которые замолчали на месяцы, а потом вернулись с новой силой.",
	"insights.rediscoveries.revival": "{n} прослуш. за 30 дней",

	// --- §19 On repeat -----------------------------------------------------
	"insights.loops.title": "На повторе",
	"insights.loops.lede":
		"Последовательные прослушивания одного и того же трека подряд — когда вы действительно ставили его на повтор.",
	"insights.loops.run": "{n}× подряд",

	// --- §22 Device archaeology -------------------------------------------
	"insights.devices.title": "Археология устройств",
	"insights.devices.lede":
		"Аппаратная история, скрытая в поле платформы — когда появлялось и исчезало каждое семейство устройств. Намеренно приблизительно: точный user-agent никогда не импортируется.",
	"insights.devices.share": "доля",

	// --- §23 Incognito & offline ------------------------------------------
	"insights.privacy.title": "Инкогнито и офлайн",
	"insights.privacy.lede":
		"Две вещи, которые обычно никто не показывает: приватные сессии, которые так и не попали в ваш профиль, и то, что вы скачали в дорогу.",
	"insights.privacy.incognito": "прослуш. в инкогнито",
	"insights.privacy.offline": "офлайн прослуш.",
	"insights.privacy.topOffline": "Топ загрузок (офлайн)",
	"insights.privacy.topIncognito": "Топ треков в инкогнито",
	"insights.privacy.none": "Приватных или офлайн прослушиваний не записано.",

	// --- shared insight columns -------------------------------------------
	"insights.col.years": "годы",
	"insights.col.peak": "пиковый месяц",
	"insights.col.locked": "привязан",
	"insights.col.gap": "молчание",
	"insights.col.comeback": "возвращение",
	"insights.col.revival": "возрождение",
	"insights.col.run": "повтор",
	"insights.col.started": "начало",
	"insights.col.device": "устройство",
	"insights.col.first": "первый",
	"insights.col.last": "последний",
	"insights.col.from": "с",
	"insights.col.to": "по",
	"insights.col.days": "дни",

	// --- shared controls ---------------------------------------------------
	"controls.rankBy": "сортировать по",
	"controls.period": "период",
	"controls.from": "с",
	"controls.to": "по",
	"controls.minSeconds": "мин. секунд",
	"controls.limit": "лимит",
	"controls.year": "год",
	"controls.search": "поиск",
	"period.all": "всё время",
	"period.custom": "произвольный",
	"metric.plays": "прослушивания",
	"metric.time": "время",

	// --- shared table columns ---------------------------------------------
	"col.rank": "#",
	"col.track": "трек",
	"col.artist": "исполнитель",
	"col.album": "альбом",
	"col.plays": "прослуш.",
	"col.hours": "часы",
	"col.tracks": "треки",
	"col.last": "последний",
	"col.skip": "пропуск",
	"col.playedAt": "сыграно",
	"col.for": "длит.",
	"col.platform": "платформа",
	"col.move": "сдвиг",
	"col.aRank": "ранг A",
	"col.bRank": "ранг B",
	"col.aValue": "A {unit}",
	"col.bValue": "B {unit}",

	// --- shared bits -------------------------------------------------------
	"common.cancel": "Отмена",
	"common.dash": "—",
	"unit.plays": "просл.",
	"unit.hrs": "ч",
	"count.plays_one": "{n} прослушивание",
	"count.plays_few": "{n} прослушивания",
	"count.plays_many": "{n} прослушиваний",
	"count.days_one": "{n} день",
	"count.days_few": "{n} дня",
	"count.days_many": "{n} дней",
	"count.years_one": "{n} год",
	"count.years_few": "{n} года",
	"count.years_many": "{n} лет",
	"count.months_one": "{n} месяц",
	"count.months_few": "{n} месяца",
	"count.months_many": "{n} месяцев",
	"count.hours_one": "{n} час",
	"count.hours_few": "{n} часа",
	"count.hours_many": "{n} часов",

	// --- status / splash ---------------------------------------------------
	"status.loading": "загрузка…",

	// --- Summary -----------------------------------------------------------
	"card.plays": "прослушивания",
	"card.hours": "часы",
	"card.tracks": "треки",
	"card.artists": "исполнители",
	"card.skips": "пропуски",
	"card.since": "с",
	"summary.streamsSub": "{count} стримов ≥30с",
	"summary.latest": "последний {date}",
	"summary.pctOfPlays": "{pct} прослушиваний",
	"summary.hoursPerYear": "Часов в год",
	"summary.playsPerYear": "Прослушиваний в год",

	// --- On this day -------------------------------------------------------
	"onThisDay.title": "В этот день",
	"onThisDay.thisWeek": "на этой неделе",
	"onThisDay.yearsAgo": "{count} л. назад",

	// --- Patterns ----------------------------------------------------------
	"patterns.byHour": "Прослушивание по часам дня (местное время начала)",
	"patterns.byWeekday": "Прослушивание по дням недели",

	// --- Calendar ----------------------------------------------------------
	"calendar.summary": "{hours} часов за {days} активных дней в {year}",
	"calendar.less": "меньше",
	"calendar.more": "больше",
	"calendar.activityTitle": "Активность прослушивания по дням",
	"calendar.dayPlays": "{plays} прослуш. · {hours} ч",
	"calendar.noPlays": "нет прослушиваний",

	// --- Library -----------------------------------------------------------
	"library.searchPlaceholder": "трек / исполнитель / альбом",
	"library.countOf": "{shown} из {total} треков",

	// --- Play Log ----------------------------------------------------------
	"playLog.searchPlaceholder": "трек / исполнитель",
	"playLog.loadingMore": "загрузка…",

	// --- Compare -----------------------------------------------------------
	"compare.compare": "сравнить",
	"compare.artists": "исполнители",
	"compare.tracks": "треки",

	// --- Settings ----------------------------------------------------------
	"settings.playback": "Воспроизведение",
	"settings.showPlayer": "Показывать встроенный плеер Spotify",
	"settings.showPlayerHint":
		"Отображает плеер на каждой странице трека. Автоматически скрывается, когда трек недоступен в Spotify.",
	"settings.time": "Время",
	"settings.timezone": "Часовой пояс",
	"settings.timezoneHint":
		"Графики по часам, дням недели и календарю группируют прослушивания в этом часовом поясе. По умолчанию — пояс вашего браузера. Выберите пояс, в котором вы действительно жили, если он отличается.",
	"settings.language": "Язык",
	"settings.languageAuto": "Автоматически (как в системе)",
	"settings.languageHint":
		"Язык интерфейса. По умолчанию — язык вашей системы, если доступен, иначе английский.",
	"settings.dangerZone": "Опасная зона",
	"settings.clearLibrary": "Очистить библиотеку",
	"settings.clearing": "Очистка…",
	"settings.deleteImported": "Удалить импортированные данные",
	"settings.clearLibraryHint":
		"Стирает базу данных и сохранённый снимок, возвращая вас на экран приветствия. Это нельзя отменить — придётся заново импортировать экспорт Spotify.",
	"settings.confirmClearTitle": "Очистить библиотеку?",
	"settings.confirmClearBody":
		"Это безвозвратно удалит все импортированные данные прослушивания из этого браузера. Вы сможете заново импортировать экспорт Spotify.",

	// --- Import ------------------------------------------------------------
	"import.getData": "Получите свои данные Spotify",
	"import.step1Title": "Найдите свой аккаунт",
	"import.step1Text":
		"Перейдите на spotify.com, войдите, затем откройте меню Аккаунт в правом верхнем углу.",
	"import.step2Title": "Откройте Конфиденциальность аккаунта",
	"import.step2Text":
		"В боковой панели настроек аккаунта прокрутите до раздела Конфиденциальность аккаунта.",
	"import.step3Title": "Запросите свои данные",
	"import.step3Text":
		"В разделе «Скачать данные» найдите Расширенную историю стриминга и отметьте её, снимите отметку с Данных аккаунта, затем нажмите Запросить данные.",
	"import.step4Title": "Дождитесь письма",
	"import.step4Text":
		"Spotify пришлёт ссылку для подтверждения — нажмите её, чтобы начать экспорт. Через некоторое время (часто несколько дней) они пришлют ссылку для скачивания. Возьмите файл my_spotify_data.zip и перетащите его сюда — распаковывать не нужно.",
	"import.stepAlt": "Шаг {n}: {title}",
	"import.backToUpload": "Назад к загрузке",
	"import.welcomeTitle": "Добро пожаловать в Wrapped",
	"import.welcomeLede":
		"Истории прослушивания пока нет. Перетащите {file} ниже, чтобы начать",
	"import.reimportLede":
		"Импортируйте экспорт Spotify, чтобы заменить всё загруженное сейчас. Это перезапишет существующие данные.",
	"import.reading": "Чтение экспорта… {pct}%",
	"import.importing": "Импорт истории… это может занять некоторое время.",
	"import.complete": "Импорт завершён — ваши данные заменены.",
	"import.dropAnother": "Перетащите другой архив, чтобы импортировать снова.",
	"import.dropHere":
		"Перетащите my_spotify_data.zip сюда или нажмите, чтобы выбрать",
	"import.onlyZip": "Только .zip — распаковывать заранее не нужно.",
	"import.learnHow": "Узнайте, как загрузить данные из Spotify",
	"import.reimportWarn":
		"Повторный импорт заменяет все загруженные сейчас данные.",
	"import.privacy":
		"Ваши данные никогда не покидают это устройство. {emph}. Всё обрабатывается прямо здесь, в вашем браузере, и ничего не загружается, не сохраняется и никуда не передаётся.",
	"import.privacyEmph": "Никакие данные не отправляются по сети",
	"import.errZip": "Пожалуйста, перетащите архив .zip.",
	"import.errFailed": "Импорт не удался.",

	// --- Track / Artist detail --------------------------------------------
	"detail.skipRate": "частота пропусков",
	"detail.rank": "ранг",
	"detail.byPlaysLifetime": "по прослушиваниям, за всё время",
	"detail.firstHeard": "впервые услышано",
	"detail.length": "длительность",
	"detail.longestPlay": "самое долгое прослушивание",
	"detail.vsAverage": "{x}× от вашего среднего",
	"track.playsPerMonth": "Прослушиваний в месяц",
	"track.whenYouPlay": "Когда вы это слушаете (час дня)",
	"track.byWeekday": "Когда вы это слушаете (день недели)",
	"track.completion": "Завершённость",
	"track.howItStarts": "Как начинается",
	"track.howItEnds": "Как заканчивается",
	"track.platforms": "Платформы",
	"track.countries": "Где вы слушали",
	"track.completionTrend": "Дослушиваете ли до конца? (по годам)",
	"track.rankByYear": "Позиция в чарте по годам",
	"track.leadsInto": "Ведёт к",
	"track.comesBefore": "Звучит перед",
	"track.segueCount": "раз",
	"track.originTitle": "С чего всё началось",
	"track.originLine": "Впервые услышано в {weekday}, {date}.",
	"track.originGateway": "Сразу после {gateway}.",
	"track.season": "сезонность",
	"track.onRepeat": "на повторе",
	"track.bingeDays": "дни запоя",
	"track.bingeDaysSub": "3+ прослушиваний за день",
	"track.fullListens": "полных прослушиваний",
	"track.fullListensSub": "эквивалент от начала до конца",
	"track.timesFinished": "раз дослушано",
	"track.timesFinishedSub": "проиграно до конца",
	"track.lastPlayed": "последний раз",
	"track.daysAgo": "{n} дн назад",
	"track.milestone": "веха",
	"track.shuffleShare": "в перемешивании",
	"track.shuffleSub": "прослушиваний в перемешивании",
	"track.skipSplit":
		"Пропускаете {shuffle} в перемешивании и {intent}, когда выбираете сами.",
	"track.comebackTitle": "Возвращение",
	"track.comebackLine": "Затихло на {gap}, потом {n} прослушиваний за 30 дней.",
	"artist.top3": "топ-3 трека = {pct} прослушиваний — {verdict}",
	"artist.liveOnHits": "вы живёте на хитах",
	"artist.wholeCatalogue": "вы прорабатываете весь каталог",
	"artist.hoursPerMonth": "Часов в месяц",
	"artist.topAlbums": "Топ альбомов по часам",
	"artist.allTracks": "Все треки",
	"artist.allTracksCount": "Все треки ({count})",
	"artist.whenYouPlay": "Когда ты их слушаешь (час суток)",
	"artist.byWeekday": "Когда ты их слушаешь (день недели)",
	"artist.peak": "пик",
	"artist.peakSub": "{plays} прослушиваний",
	"artist.loyalty": "верность",
	"artist.loyaltyYears": "{years} г.",
	"artist.loyaltySub": "{months} активных месяцев",
	"artist.gateway": "Первый трек:",
	"artist.skipVsBaseline": "против {pct} по библиотеке",

	// --- Year in review ----------------------------------------------------
	"year.inReview": "Итоги {year}",
	"year.streamsSub": "{count} ≥30с",
	"year.topTracks": "Топ треков",
	"year.topArtists": "Топ исполнителей",
	"year.busiestDay": "самый активный день",
	"year.busiestSub": "{hours} ч · {plays} прослуш.",
	"year.longestStreak": "самая длинная серия",
	"year.streakSub": "{from} → {to}",
	"year.biggestDiscovery": "главное открытие",
	"year.discoverySub": "{hours} ч, впервые услышано в этом году",
	"year.skipChampion": "чемпион по пропускам",
	"year.skipChampionSub": "{pct} пропущено из {plays} прослушиваний",

	// --- links -------------------------------------------------------------
	"links.openInSpotify": "Открыть в Spotify",
	"links.spotifyPlayer": "Плеер Spotify",
	"links.back": "Назад",
	"links.backLabel": "Вернуться на предыдущую страницу",
	"links.unknownArtist": "неизвестный исполнитель",

	// --- command palette ---------------------------------------------------
	"palette.placeholder": "Поиск треков и исполнителей…",
	"palette.artist": "исполнитель",
	"palette.track": "трек",
	"palette.noMatches": "Нет совпадений",

	// --- Story -------------------------------------------------------------
	"story.origin.eyebrow": "Как всё началось",
	"story.origin.line": "Всё началось с {track} в {weekday}, {date}.",
	"story.origin.foot": "{artist} · {years} лет назад",
	"story.time.eyebrow": "В общей сложности",
	"story.time.line":
		"Вы нажимали play {days} подряд — около {weeks} полных рабочих недель музыки.",
	"story.time.foot": "{hours} часов с {year}",
	"story.persona.eyebrow": "Кто вы",
	"story.persona.line": "Вы {loyalty} {clock}, который {skip}.",
	"story.persona.foot":
		"{night} после заката · частота пропусков {skip} · {oneshots} исполнителей попробовано лишь раз",
	"story.persona.loyal": "преданный",
	"story.persona.curious": "бесконечно любопытный",
	"story.persona.openMinded": "открытый новому",
	"story.persona.nightOwl": "ночной слушатель",
	"story.persona.daytime": "дневной слушатель",
	"story.persona.allHours": "круглосуточный слушатель",
	"story.persona.neverSkips": "почти никогда не пропускает",
	"story.persona.rarelySkips": "редко пропускает",
	"story.persona.skipsHard": "пропускает без пощады",
	"story.obsession.eyebrow": "Ваш рекорд",
	"story.obsession.line": "Однажды вы включили {track} {times}.",
	"story.obsession.times": "{count} раз",
	"story.obsession.foot": "{date} · {artist}",
	"story.faded.eyebrow": "Вы двинулись дальше",
	"story.faded.line":
		"Вы не включали {track} с {since}. Это был ваш гимн в {peak}.",
	"story.faded.foot": "{plays} прослушиваний в том году · {artist}",
	"story.crossroads.eyebrow": "Передохните",
	"story.crossroads.line":
		"Это лишь первая половина. Листайте дальше, {more} впереди.",
	"story.crossroads.more": "больше вашей истории",
	"story.crossroads.foot":
		"Или выйдите сейчас: откройте {summary} либо погрузитесь в {insights}.",
	"story.crossroads.summary": "Обзор",
	"story.crossroads.insights": "Аналитику",
	"story.companion.eyebrow": "Всё ещё рядом",
	"story.companion.line":
		"Сквозь всё это {artist} оставался с вами уже {years} и продолжает.",
	"story.companion.foot": "{plays} · в вашей ротации с {firstYear}",
	"story.comeback.eyebrow": "Вы вернулись",
	"story.comeback.line":
		"Вы оставили {track} в тишине на {gap}, а потом снова не могли остановиться.",
	"story.comeback.foot": "Возврат {date} · {plays} за месяц после · {artist}",
	"story.marathon.eyebrow": "Однажды вы не остановились",
	"story.marathon.line": "{date} вы слушали {hours}.",
	"story.marathon.foot": "{weekday} · {streams} треков · в основном {artist}",
	"story.devotion.eyebrow": "Ни разу не пропустили",
	"story.devotion.line":
		"Вы слушали {track} {times} и каждый раз давали ему доиграть до конца.",
	"story.devotion.foot": "{artist} · хотя остальное пропускали на {skip}",
	"story.closing.eyebrow": "Вот и вся история",
	"story.closing.line": "Цифры за каждым битом ждут вас в разделе {summary}.",
	"story.closing.summary": "Обзор",
	"story.closing.foot":
		"Хотите увидеть закономерности? Ваша {insights} копнёт глубже.",
	"story.closing.insights": "Аналитика",
	"story.closing.cta": "Перейти к обзору →",

	// --- completion bands --------------------------------------------------
	"completion.finished": "Дослушано",
	"completion.most": "Большую часть",
	"completion.partial": "Частично",
	"completion.bailed": "Брошено в начале",
	"completion.unknown": "Неизвестно",

	// --- reason_start codes ------------------------------------------------
	"reasonStart.trackdone": "Предыдущий трек закончился",
	"reasonStart.fwdbtn": "Перешли вперёд к нему",
	"reasonStart.backbtn": "Перешли назад к нему",
	"reasonStart.clickrow": "Выбрано из списка",
	"reasonStart.playbtn": "Нажато play",
	"reasonStart.appload": "Приложение открыто",
	"reasonStart.remote": "Удалённое / cast устройство",
	"reasonStart.trackerror": "После ошибки трека",
	"reasonStart.?": "Неизвестно",

	// --- reason_end codes --------------------------------------------------
	"reasonEnd.trackdone": "Проиграно до конца",
	"reasonEnd.fwdbtn": "Перемотано вперёд",
	"reasonEnd.backbtn": "Вернулись назад",
	"reasonEnd.endplay": "Остановлено воспроизведение",
	"reasonEnd.logout": "Выход из аккаунта",
	"reasonEnd.remote": "Удалённое / cast устройство",
	"reasonEnd.trackerror": "Ошибка трека",
	"reasonEnd.unexpected-exit": "Приложение закрыто",
	"reasonEnd.unexpected-exit-while-paused": "Закрыто на паузе",
	"reasonEnd.?": "Неизвестно",
};
