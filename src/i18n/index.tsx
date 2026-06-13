import { Fragment, type ReactNode, useMemo } from "react";
import { getSetting, useSetting } from "../settings";
import { type Catalog, en } from "./en";
import { ro } from "./ro";
import { ru } from "./ru";
import { uk } from "./uk";

// Tiny dependency-free i18n. English (./en) is the source of truth; other
// languages supply a subset and fall back to it per key. Plurals resolve through
// Intl.PluralRules (so Slavic one/few/many forms work once translated) and
// "{name}" placeholders interpolate at render time — into strings via t(), or
// into React nodes (links etc.) via fillNodes().

export const LANGUAGES = [
	{ code: "en", label: "English", locale: "en-US" },
	{ code: "uk", label: "Українська", locale: "uk-UA" },
	{ code: "ru", label: "Русский", locale: "ru-RU" },
	{ code: "ro", label: "Română", locale: "ro-RO" },
] as const;

export type Lang = (typeof LANGUAGES)[number]["code"];

/** Stored preference: a concrete language, or "auto" to follow the system. */
export type LanguageSetting = Lang | "auto";

const LOCALE: Record<Lang, string> = Object.fromEntries(
	LANGUAGES.map((l) => [l.code, l.locale]),
) as Record<Lang, string>;

const CODES = LANGUAGES.map((l) => l.code);

type PluralCategory = "zero" | "one" | "two" | "few" | "many" | "other";

type CatalogKey = keyof Catalog;
// Base keys of pluralised entries ("count.plays" from "count.plays_one"/…),
// which is what callers pass alongside { count }. Each category is stripped
// explicitly — inference through a single union-suffix pattern doesn't resolve.
type StripPlural<K> = K extends `${infer B}_one`
	? B
	: K extends `${infer B}_other`
		? B
		: K extends `${infer B}_few`
			? B
			: K extends `${infer B}_many`
				? B
				: K extends `${infer B}_two`
					? B
					: K extends `${infer B}_zero`
						? B
						: never;
type PluralBase = StripPlural<CatalogKey>;

export type TKey = CatalogKey | PluralBase;

// A non-English catalog: any English key is optional (missing → English), plus
// the extra plural forms ("_few"/"_many") that some languages need.
export type Translation = Partial<Record<CatalogKey, string>> &
	Partial<Record<`${PluralBase}_${PluralCategory}`, string>>;

export type TParams = Record<string, string | number>;
export type TFunction = (key: TKey, params?: TParams) => string;

const CATALOGS: Record<Lang, Translation> = { en, uk, ru, ro };

function lookup(
	cat: Record<string, string | undefined>,
	key: string,
	count: number | undefined,
	locale: string,
): string | undefined {
	if (count !== undefined) {
		const category = new Intl.PluralRules(locale).select(count);
		return cat[`${key}_${category}`] ?? cat[`${key}_other`] ?? cat[key];
	}
	return cat[key];
}

function interpolate(template: string, params?: TParams): string {
	if (!params) return template;
	return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
		name in params ? String(params[name]) : whole,
	);
}

function translate(lang: Lang, key: TKey, params?: TParams): string {
	const count =
		params && typeof params.count === "number" ? params.count : undefined;
	const raw =
		lookup(CATALOGS[lang], key, count, LOCALE[lang]) ??
		lookup(en, key, count, LOCALE.en) ??
		key;
	return interpolate(raw, params);
}

/** Best-matching supported language from the browser's preference list. */
function detect(): Lang {
	const prefs = navigator.languages ?? [navigator.language];
	for (const pref of prefs) {
		const code = pref.toLowerCase().split("-")[0];
		const hit = CODES.find((c) => c === code);
		if (hit) return hit;
	}
	return "en";
}

export function resolveLang(setting: LanguageSetting): Lang {
	return setting === "auto" ? detect() : setting;
}

/** Reactive: the active language, resolving "auto" against the system. */
export function useLang(): Lang {
	return resolveLang(useSetting("language"));
}

/** Reactive: BCP-47 locale string for Intl APIs. */
export function useLocale(): string {
	return LOCALE[useLang()];
}

/** Non-reactive locale, for code outside React (e.g. format.ts). */
export function getLocale(): string {
	return LOCALE[resolveLang(getSetting("language"))];
}

/** Reactive translator bound to the active language. */
export function useT(): TFunction {
	const lang = useLang();
	return useMemo<TFunction>(
		() => (key, params) => translate(lang, key, params),
		[lang],
	);
}

// Splits a translated template on "{name}" placeholders and substitutes React
// nodes for them, so a sentence with embedded links stays one translatable
// string with translatable word order. String params should already be filled
// by t(); only node placeholders remain for this pass.
export function fillNodes(
	template: string,
	values: Record<string, ReactNode>,
): ReactNode {
	const parts = template.split(/(\{\w+\})/g);
	return parts.map((part, i) => {
		const m = /^\{(\w+)\}$/.exec(part);
		if (m && m[1] in values)
			// biome-ignore lint/suspicious/noArrayIndexKey: positional segments of a fixed split, never reordered
			return <Fragment key={i}>{values[m[1]]}</Fragment>;
		return part;
	});
}

// Resolves an optional, backend-supplied code (completion band, reason_start)
// to its translated label, falling back to the raw code for unknown values.
const EN_KEYS = new Set(Object.keys(en));
export function tEnum(t: TFunction, prefix: string, code: string): string {
	const key = `${prefix}.${code}`;
	return EN_KEYS.has(key) ? t(key as TKey) : code;
}
