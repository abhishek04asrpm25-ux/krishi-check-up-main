import { t, useLang } from "@/lib/i18n";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/kc/Logo";
import { Alert, Button, Card, Field, Input, Select } from "@/components/kc/ui";
import { pageHead } from "@/lib/head";
import { DEMO_ACCOUNT, checkCaptcha, normalizeMobile, validateRegister, type Errors, type RegisterValues } from "@/lib/demo-auth";
import { CaptchaField, useCaptcha } from "@/components/kc/Captcha";
import { StateDistrictSelect } from "@/components/kc/StateDistrictSelect";
import { registerAccount, signInAs } from "@/lib/kc-store";

export const Route = createFileRoute("/register")({
  head: () => pageHead("Farmer Registration", "Create a demo KrishiConnect farmer account."),
  component: Register,
});

const empty: RegisterValues = { name: "", mobile: "", username: "", password: "", confirm: "", village: "", district: "", state: "", language: "Hindi" };

function Err({ msg }: { msg?: string | undefined }) {
  useLang();
  return msg ? <p role="alert" className="text-sm font-medium text-destructive">{t(msg)}</p> : null;
}

function Register() {
  useLang();
  const navigate = useNavigate();
  const [v, setV] = useState(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState<{ id: string; name: string; farmerId: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const cap = useCaptcha();
  const set = (k: keyof RegisterValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setV({ ...v, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const errs = validateRegister(v);
    const capErr = checkCaptcha(cap.answer, cap.code);
    if (capErr) { errs.captcha = capErr; cap.refresh(); }
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    const r = await registerAccount({ ...v, mobile: normalizeMobile(v.mobile) }, DEMO_ACCOUNT.username);
    setBusy(false);
    if (!r.ok) { setErrors({ [r.field]: r.error }); cap.refresh(); return; }
    setDone({ id: r.account.id, name: r.account.name, farmerId: r.account.farmerId });
    setV(empty); // drop passwords from memory immediately
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <Logo />
          <Link to="/login" className="text-sm font-semibold text-primary">{t("Sign in")}</Link>
        </div>
        <h1 className="mt-10 text-3xl font-bold">{t("Create Farmer Account")}{" "}<span className="ml-2 rounded-lg bg-warning-soft px-2 py-1 align-middle text-sm text-warning-foreground">{t("DEMO")}</span></h1>
        <p className="mt-2 text-muted-foreground">{t("Demo registration only. Do not enter real Aadhaar, bank or identity details — only non-sensitive demo data is kept in this browser.")}</p>

        <Card className="mt-6 p-6">
          {done ? (
            <div className="space-y-5">
              <Alert tone="success" title={t(`Welcome, ${done.name}! Demo account created.`)}>
                {t("Demo farmer ID")}{" "}{t(done.farmerId)}{t(". This account exists only in this browser for the demo — it is not saved on any server and is not secure.")}
              </Alert>
              <Button className="w-full" onClick={() => { signInAs(done.id); navigate({ to: "/" }); }}>{t("Continue to Dashboard")}</Button>
            </div>
          ) : (
            <form noValidate className="grid gap-5 sm:grid-cols-2" onSubmit={submit}>
              <div className="sm:col-span-2"><Field label={t("Full name")} htmlFor="n"><Input id="n" value={v.name} onChange={set("name")} /><Err msg={errors.name} /></Field></div>
              <Field label={t("Mobile number")} htmlFor="m" hint={t("10 digits, e.g. 98765 43210")}><Input id="m" inputMode="tel" value={v.mobile} onChange={set("mobile")} /><Err msg={errors.mobile} /></Field>
              <Field label={t("Username")} htmlFor="u"><Input id="u" autoComplete="username" value={v.username} onChange={set("username")} /><Err msg={errors.username} /></Field>
              <Field label={t("Create password")} htmlFor="pw" hint={t("At least 8 characters")}><Input id="pw" type="password" autoComplete="new-password" value={v.password} onChange={set("password")} /><Err msg={errors.password} /></Field>
              <Field label={t("Confirm password")} htmlFor="pw2"><Input id="pw2" type="password" autoComplete="new-password" value={v.confirm} onChange={set("confirm")} /><Err msg={errors.confirm} /></Field>
              <Field label={t("Village")} htmlFor="v"><Input id="v" value={v.village} onChange={set("village")} /><Err msg={errors.village} /></Field>
              <StateDistrictSelect
                state={v.state}
                district={v.district}
                onState={(state) => setV((p) => ({ ...p, state, district: "" }))}
                onDistrict={(district) => setV((p) => ({ ...p, district }))}
                stateError={errors.state}
                districtError={errors.district}
              />
              <Field label={t("Preferred language")} htmlFor="l">
                <Select id="l" value={v.language} onChange={set("language")}><option>{t("Hindi")}</option><option>{t("English")}</option><option>{t("Punjabi")}</option></Select>
                <Err msg={errors.language} />
              </Field>
              <div className="sm:col-span-2"><CaptchaField cap={cap} error={errors.captcha} /></div>
              <div className="sm:col-span-2"><Button type="submit" className="w-full" disabled={busy}>{t(busy ? "Creating…" : "Create Demo Account")}</Button></div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
