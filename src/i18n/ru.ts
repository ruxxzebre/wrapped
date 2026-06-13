import type { Translation } from "./index";

// Russian — Русский. Typed against the English keys in ./en; anything omitted
// falls back to the English string.
export const ru: Translation = {
	// --- app shell ---------------------------------------------------------
	"app.openMenu": "Открыть меню",
	"app.closeMenu": "Закрыть меню",
	"app.search": "поиск",
	"app.footer.about":
		"self-hosted анализатор истории прослушивания Spotify. Импортируйте расширенный экспорт истории стримов, чтобы исследовать тренды, любимые треки и исполнителей, а также вкусы во времени. Все данные остаются на вашем устройстве.",
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
	"import.importing": "Импорт истории… это может занять момент.",
	"import.complete": "Импорт завершён — ваши данные заменены.",
	"import.dropAnother": "Перетащите другой архив, чтобы импортировать снова.",
	"import.dropHere":
		"Перетащите my_spotify_data.zip сюда или нажмите, чтобы выбрать",
	"import.onlyZip": "Только .zip — распаковывать заранее не нужно.",
	"import.learnHow": "Узнайте, как загрузить данные из Spotify",
	"import.reimportWarn":
		"Повторный импорт заменяет все загруженные сейчас данные.",
	"import.errZip": "Пожалуйста, перетащите архив .zip.",
	"import.errFailed": "Импорт не удался.",

	// --- Track / Artist detail --------------------------------------------
	"detail.skipRate": "частота пропусков",
	"detail.rank": "ранг",
	"detail.byPlaysLifetime": "по прослушиваниям, за всё время",
	"detail.firstHeard": "впервые услышано",
	"detail.length": "длительность",
	"detail.longestPlay": "самое долгое прослушивание",
	"track.playsPerMonth": "Прослушиваний в месяц",
	"track.whenYouPlay": "Когда вы это слушаете (час дня)",
	"track.completion": "Завершённость",
	"track.howItStarts": "Как начинается",
	"track.platforms": "Платформы",
	"artist.top3": "топ-3 трека = {pct} прослушиваний — {verdict}",
	"artist.liveOnHits": "вы живёте на хитах",
	"artist.wholeCatalogue": "вы прорабатываете весь каталог",
	"artist.hoursPerMonth": "Часов в месяц",
	"artist.topAlbums": "Топ альбомов по часам",
	"artist.allTracks": "Все треки",
	"artist.allTracksCount": "Все треки ({count})",

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
	"story.closing.eyebrow": "Вот и вся история",
	"story.closing.line": "Цифры за каждым битом ждут вас в разделе {summary}.",
	"story.closing.summary": "Обзор",
	"story.closing.cta": "Перейти к обзору →",

	// --- completion bands --------------------------------------------------
	"completion.finished": "Дослушано",
	"completion.most": "Большую часть",
	"completion.partial": "Частично",
	"completion.bailed": "Брошено в начале",
	"completion.unknown": "Неизвестно",

	// --- reason_start codes ------------------------------------------------
	"reasonStart.trackdone": "Предыдущий трек закончился",
	"reasonStart.fwdbtn": "Перемотка вперёд к нему",
	"reasonStart.backbtn": "Перемотка назад к нему",
	"reasonStart.clickrow": "Выбрано из списка",
	"reasonStart.playbtn": "Нажато play",
	"reasonStart.appload": "Приложение открыто",
	"reasonStart.remote": "Удалённое / cast устройство",
	"reasonStart.trackerror": "После ошибки трека",
	"reasonStart.?": "Неизвестно",
};
