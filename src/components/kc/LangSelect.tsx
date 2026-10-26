import { Globe } from "lucide-react";
import { LANGUAGES, setLang, t, useLang, type Lang } from "@/lib/i18n";

export function LangSelect({ className = "" }: { className?: string }) {
  const lang = useLang();
  return (
    <label className={`flex items-center gap-2 text-sm ${className}`}>
      <Globe className="size-4 text-muted-foreground" aria-hidden />
      <span className="sr-only">{t("Language")}</span>
      <select aria-label={t("Language")} value={lang} onChange={(e) => setLang(e.target.value as Lang)} className="rounded-lg border bg-card px-2 py-1.5 text-sm">
        {LANGUAGES.map((l) => <option key={l.code} value={l.code} lang={l.code}>{l.label}</option>)}
      </select>
    </label>
  );
}
