// Centralised translations. Keys are the English UI strings; `{0}`, `{1}` mark dynamic values.
// To add a language: add it to LANGUAGES and add a dictionary file in src/lib/i18n/.
import { useSyncExternalStore } from "react";
import { hi } from "@/lib/i18n/hi";

export const LANGUAGES = [
  { code: "en", label: "English", locale: "en-IN" },
  { code: "hi", label: "हिंदी", locale: "hi-IN" },
] as const;
export type Lang = (typeof LANGUAGES)[number]["code"];
const DICTS: Record<Lang, Record<string, string>> = { en: {}, hi };

const KEY = "kc-lang";
let lang: Lang = "en"; // stays "en" until hydration so server and client markup match
const listeners = new Set<() => void>();
const isLang = (x: unknown): x is Lang => LANGUAGES.some((l) => l.code === x);

export function getLang() { return lang; }
export const getLocale = () => LANGUAGES.find((l) => l.code === lang)?.locale ?? "en-IN";
export function setLang(next: Lang) {
  if (!isLang(next) || next === lang) return;
  lang = next;
  try { localStorage.setItem(KEY, next); } catch { /* storage unavailable */ }
  if (typeof document !== "undefined") document.documentElement.lang = next;
  listeners.forEach((l) => l());
}
/** Call once after hydration (root component) to restore the saved language. */
export function initLang() {
  try { const s = localStorage.getItem(KEY); if (isLang(s)) setLang(s); } catch { /* ignore */ }
}
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
/** Subscribes the calling component to language changes. */
export function useLang() { return useSyncExternalStore(subscribe, () => lang, () => "en" as Lang); }

/* ---------- pattern matching for runtime-built English strings ---------- */
type Pat = { re: RegExp; tpl: string; order: number[] };
const patCache: Partial<Record<Lang, Pat[]>> = {};
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function patterns(l: Lang): Pat[] {
  const cached = patCache[l];
  if (cached) return cached;
  const out: Pat[] = [];
  for (const [k, v] of Object.entries(DICTS[l])) {
    if (!/\{\d\}/.test(k)) continue;
    const order: number[] = [];
    const src = k.split(/(\{\d\})/).map((p) => { const m = /^\{(\d)\}$/.exec(p); if (m) { order.push(Number(m[1])); return "(.+?)"; } return esc(p); }).join("");
    out.push({ re: new RegExp(`^${src}$`, "s"), tpl: v, order });
  }
  out.sort((a, b) => b.re.source.length - a.re.source.length); // most specific first
  return (patCache[l] = out);
}
const fill = (tpl: string, params: unknown[]) => tpl.replace(/\{(\d)\}/g, (_, i) => { const p = params[Number(i)]; return typeof p === "string" ? word(p) : String(p ?? ""); });
function word(s: string): string { const d = DICTS[lang]; return d[s] ?? d[s.trim()] ?? s; }

/**
 * Translate a UI string. Non-strings (numbers, elements) pass through unchanged, so it is safe to
 * wrap any rendered value. `t("Hello {0}", name)` fills placeholders; strings already built in
 * English at runtime are matched against `{n}` patterns in the dictionary.
 */
export function t<T>(s: T, ...params: unknown[]): T {
  if (typeof s !== "string") return s;
  if (params.length) return (lang === "en" ? s.replace(/\{(\d)\}/g, (_, i) => String(params[Number(i)] ?? "")) : fill(DICTS[lang][s] ?? s, params)) as T;
  if (lang === "en" || !s.trim()) return s;
  const d = DICTS[lang];
  const exact = d[s] ?? d[s.trim()];
  if (exact !== undefined) return exact as T;
  for (const p of patterns(lang)) {
    const m = p.re.exec(s);
    if (m) return fill(p.tpl, (() => { const a: unknown[] = []; p.order.forEach((n, i) => { a[n] = m[i + 1]; }); return a; })()) as T;
  }
  return s;
}
