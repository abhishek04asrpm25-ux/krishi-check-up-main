import { t, useLang } from "@/lib/i18n";
import { useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Home, ClipboardList, Store, BarChart3, MapPin, Compass, Wallet, Bell, User, HelpCircle, FileText, Landmark, Wheat, LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "./Logo";
import { LangSelect } from "./LangSelect";
import { signOut as kcSignOut, useKC, useSessionUid } from "@/lib/kc-store";

const main = [
  { to: "/", label: "Home", icon: Home },
  { to: "/tracking", label: "My Procurement", icon: ClipboardList },
  { to: "/centres", label: "Centres", icon: MapPin },
  { to: "/know-before-you-go", label: "Know Before You Go", icon: Compass },
  { to: "/payments", label: "Payments", icon: Wallet },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/profile", label: "Profile", icon: User },
] as const;

const more = [
  { to: "/apply", label: "New Application", icon: ClipboardList },
  { to: "/crops", label: "Crop Details", icon: Wheat },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/bank", label: "Bank Details", icon: Landmark },
  { to: "/help", label: "Help", icon: HelpCircle },
  { to: "/operator", label: "Operator (demo)", icon: Store },
  { to: "/admin", label: "Admin (demo)", icon: BarChart3 },
] as const;

const mobile = [main[0], main[1], main[3], main[4], main[6]];

const linkCls = "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground";
const activeCls = { className: "bg-secondary !text-primary-deep font-semibold" };

export function AppShell({ children }: { children: ReactNode }) {
  useLang();
  const navigate = useNavigate();
  const kc = useKC();
  const unread = kc.notices.filter((n) => !n.read).length;
  const uid = useSessionUid();
  useEffect(() => { if (uid === null) navigate({ to: "/login", replace: true }); }, [uid, navigate]);
  const signOut = () => { kcSignOut(); navigate({ to: "/login", replace: true }); };
  if (!uid) return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">{t("Loading…")}</div>;
  return (
    <div className="min-h-screen lg:flex">
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r bg-card p-5 lg:flex">
        <Logo />
        <nav aria-label={t("Main")} className="mt-8 flex-1 space-y-1 overflow-y-auto">
          {main.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className={linkCls} activeProps={activeCls} activeOptions={{ exact: true }}>
              <Icon className="size-5 shrink-0" />
              <span className="flex-1">{t(label)}</span>
              {to === "/notifications" && unread > 0 && (
                <span className="rounded-full bg-primary px-2 text-xs text-primary-foreground">{t(unread)}</span>
              )}
            </Link>
          ))}
          <p className="px-3 pb-1 pt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("More")}</p>
          {more.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className={linkCls} activeProps={activeCls}>
              <Icon className="size-5 shrink-0" />
              {t(label)}
            </Link>
          ))}
        </nav>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-card/95 px-4 py-3 backdrop-blur lg:hidden">
        <Logo />
        <div className="flex items-center gap-1">
          <button type="button" onClick={signOut} aria-label={t("Sign out")} className="grid size-11 place-items-center rounded-xl text-muted-foreground hover:bg-secondary"><LogOut className="size-5" /></button>
          <Link to="/help" aria-label={t("Help")} className="grid size-11 place-items-center rounded-xl text-muted-foreground hover:bg-secondary"><HelpCircle className="size-5" /></Link>
          <Link to="/notifications" aria-label={t("Notifications")} className="relative grid size-11 place-items-center rounded-xl text-muted-foreground hover:bg-secondary">
            <Bell className="size-5" />
            {unread > 0 && <span className="absolute right-2 top-2 size-2.5 rounded-full bg-destructive" />}
          </Link>
        </div>
      </header>

      <main className="min-w-0 flex-1 px-4 pb-28 pt-4 sm:px-6 lg:px-10 lg:pb-12 lg:pt-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-5 flex flex-wrap items-center justify-end gap-3">
            <LangSelect />
            <div className="flex min-w-0 items-center gap-3 rounded-xl bg-muted p-2 sm:p-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{t(kc.profile.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase())}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{kc.profile.name}</p>
                <p className="truncate text-xs text-muted-foreground">{t(kc.farmerId)}</p>
              </div>
              <button type="button" onClick={signOut} aria-label={t("Sign out")} className="ml-1 shrink-0 text-muted-foreground hover:text-foreground"><LogOut className="size-5" /></button>
            </div>
          </div>
          {t(children)}
        </div>
      </main>

      <nav aria-label={t("Main")} className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t bg-card pb-[env(safe-area-inset-bottom)] lg:hidden">
        {mobile.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: true }}
            className="flex flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-medium text-muted-foreground"
            activeProps={{ className: "!text-primary font-semibold" }}
          >
            <Icon className="size-5" />
            <span className="truncate">{t(label === "Know Before You Go" ? "Journey" : label === "My Procurement" ? "Procurement" : label)}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
