import { t, useLang } from "@/lib/i18n";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { LangSelect } from "@/components/kc/LangSelect";
import { useState } from "react";
import hero from "@/assets/login-hero.jpg";
import { Logo } from "@/components/kc/Logo";
import { Alert, Button, Field, Input, buttonVariants } from "@/components/kc/ui";
import { pageHead } from "@/lib/head";
import { DEMO_ACCOUNT, isDemoCredentials, validateLogin, type Errors } from "@/lib/demo-auth";
import { CaptchaField, useCaptcha } from "@/components/kc/Captcha";
import { DEMO_UID, checkRegistered, signInAs } from "@/lib/kc-store";

export const Route = createFileRoute("/login")({
  head: () => pageHead("Sign In", "Sign in to KrishiConnect to plan your procurement visit."),
  component: Login,
});

function Err({ msg }: { msg?: string | undefined }) {
  useLang();
  return msg ? <p role="alert" className="text-sm font-medium text-destructive">{t(msg)}</p> : null;
}

function Login() {
  useLang();
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [forgot, setForgot] = useState(false);
  const [busy, setBusy] = useState(false);
  const cap = useCaptcha();

  const enter = (uid: string) => { signInAs(uid); setPassword(""); navigate({ to: "/" }); };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const errs = validateLogin({ user, password, captcha: cap.answer }, cap.code);
    if (errs.captcha) cap.refresh();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setBusy(true);
    const uid = isDemoCredentials(user, password) ? DEMO_UID : await checkRegistered(user, password);
    setBusy(false);
    if (!uid) { cap.refresh(); setErrors({ form: "Username or password is incorrect. Use “Continue with Demo Account” or an account you registered in this browser." }); return; }
    setErrors({});
    enter(uid);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden lg:block">
        <img src={hero} alt={t("Farmer holding wheat in a field at sunrise")} width={1024} height={1280} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-deep via-primary-deep/40 to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo inverse />
          <div className="max-w-md text-primary-foreground">
            <h1 className="text-5xl font-bold leading-tight">{t("Know Before You Go")}</h1>
            <p className="mt-4 text-lg text-primary-foreground/85">{t("Plan your procurement visit with confidence.")}</p>
          </div>
        </div>
      </section>

      <section className="flex flex-col px-5 py-8 sm:px-10">
        <div className="flex items-center justify-between">
          <div className="lg:invisible"><Logo /></div>
          <LangSelect />
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <h2 className="text-3xl font-bold">{t("Welcome back")}</h2>
          <p className="mt-2 text-muted-foreground">{t("Sign in to view your procurement journey.")}</p>

          <form noValidate className="mt-6 space-y-5" onSubmit={submit}>
            {errors.form && <Alert tone="danger" title={t(errors.form)} />}
            <Field label={t("Username or mobile number")} htmlFor="user">
              <Input id="user" value={user} onChange={(e) => setUser(e.target.value)} placeholder={t("e.g. demo.farmer")} autoComplete="username" aria-invalid={!!errors.user} />
              <Err msg={errors.user} />
            </Field>
            <Field label={t("Password")} htmlFor="pw">
              <div className="relative">
                <Input id="pw" type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("Enter password")} autoComplete="current-password" aria-invalid={!!errors.password} className="pr-12" />
                <button type="button" onClick={() => setShow(!show)} aria-label={t(show ? "Hide password" : "Show password")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
              <Err msg={errors.password} />
            </Field>
            <CaptchaField cap={cap} error={errors.captcha} onRefresh={() => setErrors((e) => ({ ...e, captcha: undefined }))} />
            <div className="flex items-center justify-between text-sm">
              <span className="text-xs text-muted-foreground">{t("Demo session stays signed in on this browser until you sign out.")}</span>
              <button type="button" onClick={() => setForgot(true)} className="font-semibold text-primary hover:underline">{t("Forgot password?")}</button>
            </div>
            {forgot && (
              <Alert tone="warning" title={t("Password reset is not available in this demo")}>
                {t("No email or OTP is sent. Use “Continue with Demo Account”, or call the helpline in the real service.")}
              </Alert>
            )}
            <Button type="submit" size="lg" className="w-full" disabled={busy}>{t(busy ? "Signing in…" : "Sign In")}</Button>
            <Button type="button" variant="outline" size="lg" className="w-full" onClick={() => enter(DEMO_UID)}>{t("Continue with Demo Account")}</Button>
          </form>
          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />{t("New to KrishiConnect?")}<span className="h-px flex-1 bg-border" /></div>
          <Link to="/register" className={buttonVariants({ variant: "outline", size: "lg", className: "w-full" })}>{t("Create Farmer Account")}</Link>
        </div>
        <p className="text-center text-xs text-muted-foreground">{t("Helpline 1800-180-1551 · Demo interface")}</p>
      </section>
    </div>
  );
}
