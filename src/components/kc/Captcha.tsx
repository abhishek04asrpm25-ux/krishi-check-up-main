import { t, useLang } from "@/lib/i18n";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Field, Input } from "@/components/kc/ui";
import { DEMO_CAPTCHA, newCaptcha } from "@/lib/demo-auth";

/** Demo captcha state. Starts with a fixed code for SSR, then randomises after hydration. */
export function useCaptcha() {
  const [code, setCode] = useState(DEMO_CAPTCHA);
  const [answer, setAnswer] = useState("");
  useEffect(() => setCode((c) => newCaptcha(c)), []);
  const refresh = () => { setCode((c) => newCaptcha(c)); setAnswer(""); };
  return { code, answer, setAnswer, refresh };
}

export function CaptchaField({ cap, error, onRefresh }: { cap: ReturnType<typeof useCaptcha>; error?: string | undefined; onRefresh?: () => void }) {
  useLang();
  return (
    <Field label={t("Enter the characters shown (DEMO captcha)")} htmlFor="cap" hint={t("Client-side demo check only — not real bot protection.")}>
      <div className="flex gap-3">
        <div className="relative flex h-12 shrink-0 select-none items-center gap-2 rounded-xl border border-dashed bg-surface px-4 font-mono text-lg font-bold tracking-[0.3em] text-primary-deep">
          <span className="absolute -top-2 left-2 rounded bg-warning-soft px-1 font-sans text-[10px] tracking-normal text-warning-foreground">{t("DEMO")}</span>
          <span data-testid="captcha-code">{t(cap.code)}</span>
          <button type="button" onClick={() => { cap.refresh(); onRefresh?.(); }} aria-label={t("Refresh captcha")} className="text-muted-foreground"><RefreshCw className="size-4" /></button>
        </div>
        <Input id="cap" value={cap.answer} onChange={(e) => cap.setAnswer(e.target.value)} placeholder={t("Captcha")} autoComplete="off" aria-invalid={!!error} />
      </div>
      {error && <p role="alert" className="text-sm font-medium text-destructive">{t(error)}</p>}
    </Field>
  );
}
