import { t, useLang } from "@/lib/i18n";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, Car, Hourglass, CheckCircle2, ArrowRight, MapPin, Wallet, Bell, FileText, ClipboardList, Activity, User, CalendarCheck } from "lucide-react";
import { AppShell } from "@/components/kc/AppShell";
import { StatusPill } from "@/components/kc/booking";
import { Card, CardTitle, InfoRow, Progress, StatusBadge, buttonVariants } from "@/components/kc/ui";
import { documents } from "@/lib/mock-data";
import { BOOKABLE_DATES, CENTRES, centreDayLeft, crowd, fmtDate, fmtDur, fmtStamp, fmtTime, getCentre, journey, payTone, upcoming, useKC, DEMO_UID, getCrop } from "@/lib/kc-store";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/")({
  head: () => pageHead("Farmer Dashboard", "Your next procurement visit, waiting time and departure advice at a glance."),
  component: Dashboard,
});

const demoDocPct = Math.round((documents.filter((d) => d.status === "Verified").length / documents.length) * 100);

function Dashboard() {
  useLang();
  const s = useKC();
  const docPct = s.uid === DEMO_UID ? demoDocPct : 0;
  const pc = s.profile.preferredCrop && getCrop(s.profile.preferredCrop) ? s.profile.preferredCrop : "";
  const b = upcoming(s);
  const c = b && getCentre(b.centreId);
  const j = b && journey(b);
  const nearby = CENTRES.filter((x) => x.open && (!pc || x.crops.includes(pc))).sort((a, z) => a.distanceKm - z.distanceKm).slice(0, 3);
  const latestPaid = s.bookings.find((x) => x.paymentStatus !== "Pending" && x.status !== "Cancelled");
  return (
    <AppShell>
      <h1 className="text-2xl font-bold sm:text-3xl">{t("Namaste,")}{" "}{t(s.profile.name.split(" ")[0])}</h1>

      {b && c && j ? (
        <section className="mt-6 overflow-hidden rounded-3xl bg-hero p-6 text-primary-foreground shadow-elevated sm:p-8">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary-foreground/80"><Compass className="size-5" /> {t("Know Before You Go")}</div>
          <div className="mt-4 grid gap-6 md:grid-cols-[1.2fr_2fr] md:items-center">
            <div>
              <p className="text-primary-foreground/80">{t("Recommended departure (estimate)")}</p>
              <p className="font-display text-5xl font-bold sm:text-6xl">{t(fmtTime(j.departure))}</p>
              <p className="mt-1 text-primary-foreground/80">{t(fmtDate(b.date))}</p>
            </div>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: Car, label: "Travel time", v: fmtDur(j.travel) },
                { icon: Hourglass, label: "Waiting time", v: fmtDur(j.wait) },
                { icon: Activity, label: "Processing", v: fmtDur(j.processing) },
                { icon: CheckCircle2, label: "Completion", v: fmtTime(j.completion) },
              ].map(({ icon: Icon, label, v }) => (
                <div key={label} className="rounded-2xl bg-primary-foreground/10 p-4">
                  <Icon className="size-5 text-primary-foreground/80" />
                  <dt className="mt-2 text-xs text-primary-foreground/75">{t(label)}</dt>
                  <dd className="font-display text-lg font-bold">{t(v)}</dd>
                </div>
              ))}
            </dl>
          </div>
          <p className="mt-4 text-xs text-primary-foreground/75">{t("Illustrative estimates from sample data — not live traffic or queue information.")}</p>
          <Link to="/know-before-you-go" search={{ id: b.id }} className={buttonVariants({ variant: "inverse", className: "mt-4" })}>{t("View Full Journey")}{" "}<ArrowRight className="size-4" /></Link>
        </section>
      ) : (
        <section className="mt-6 rounded-3xl bg-hero p-6 text-primary-foreground shadow-elevated sm:p-8">
          <p className="text-xl font-bold">{t("No upcoming procurement visit")}</p>
          <p className="text-primary-foreground/80">{t("Book a slot to get your departure plan.")}</p>
          <Link to="/apply" className={buttonVariants({ variant: "inverse", className: "mt-4" })}>{t("Book a slot")}{" "}<ArrowRight className="size-4" /></Link>
        </section>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle icon={<ClipboardList className="size-5" />} action={b ? <StatusPill b={b} /> : undefined}>{t("Next procurement")}</CardTitle>
          {b && c && j ? (
            <div className="grid gap-x-8 sm:grid-cols-2">
              <div>
                <InfoRow label={t("Procurement ID")} value={<Link to="/booking/$id" params={{ id: b.id }} className="text-primary">{t(b.id)}</Link>} />
                <InfoRow label={t("Crop")} value={b.crop} />
                <InfoRow label={t("Quantity")} value={`${b.qty} qtl`} />
                <InfoRow label={t("Centre")} value={c.name} />
              </div>
              <div>
                <InfoRow label={t("Date")} value={fmtDate(b.date)} />
                <InfoRow label={t("Slot")} value={fmtTime(b.slot)} />
                <InfoRow label={t("Centre status (demo)")} value={<StatusBadge tone={crowd(c).tone}>{t(crowd(c).label)}</StatusBadge>} />
                <InfoRow label={t("Estimated waiting")} value={fmtDur(j.wait)} />
                <InfoRow label={t("Leave home by")} value={<span className="text-primary">{t(fmtTime(j.departure))}</span>} />
              </div>
            </div>
          ) : <p className="text-sm text-muted-foreground">{t("No active bookings.")}{" "}<Link to="/apply" className="font-semibold text-primary">{t("Book a slot")}</Link></p>}
        </Card>

        <div className="space-y-6">
          <Card>
            <CardTitle icon={<FileText className="size-5" />} action={<Link to="/documents" className="text-sm font-semibold text-primary">{t("Manage")}</Link>}>{t("Documents")}</CardTitle>
            <Progress value={docPct} label={t("Profile completion")} />
            <p className="mt-3 text-sm text-muted-foreground">{t("1 document missing: passport photograph.")}</p>
          </Card>
          <Card>
            <CardTitle icon={<Bell className="size-5" />} action={<Link to="/notifications" className="text-sm font-semibold text-primary">{t("All")}</Link>}>{t("Notifications")}</CardTitle>
            {s.notices.length === 0 ? <p className="text-sm text-muted-foreground">{t("No notifications.")}</p> : (
              <ul className="space-y-3">
                {s.notices.slice(0, 2).map((n) => (
                  <li key={n.id} className="text-sm"><p className="font-semibold">{t(n.title)}</p><p className="text-muted-foreground">{t(fmtStamp(n.at))}</p></li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <Card className="mt-6">
        <CardTitle icon={<MapPin className="size-5" />} action={<Link to="/centres" search={pc ? { crop: pc } : {}} className="text-sm font-semibold text-primary">{t("Search & filter")}</Link>}>{t(pc ? `Centres for ${pc}` : "Open centres near you")}</CardTitle>
        {nearby.length === 0 ? <p className="text-sm text-muted-foreground">{t("No open centres procure")}{" "}{t(pc || "any crop")} {t("right now.")}</p> : (
          <ul className="divide-y">
            {nearby.map((x) => (
              <li key={x.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <Link to="/centres/$id" params={{ id: x.id }} className="font-semibold hover:text-primary">{t(x.name)}</Link>
                  <p className="text-sm text-muted-foreground">{t(x.distanceKm)} {t("km · wait ~")}{t(fmtDur(x.waitMin))} · {t(centreDayLeft(s, x.id, BOOKABLE_DATES[0]))} {t("slots left on")}{" "}{t(fmtDate(BOOKABLE_DATES[0]))}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge tone={crowd(x).tone}>{t(crowd(x).label)}</StatusBadge>
                  <Link to="/apply" search={pc ? { centre: x.id, crop: pc } : { centre: x.id }} className={buttonVariants({ size: "sm" })}>{t("Book")}</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { to: "/apply" as const, icon: CalendarCheck, label: "Slot booking", value: "Book a new visit" },
          { to: "/tracking" as const, icon: ClipboardList, label: "Procurement tracking", value: b ? t("{0} · {1}", b.id, b.status) : "No active booking" },
          { to: "/payments" as const, icon: Wallet, label: "Payment status (demo)", value: latestPaid ? t("{0} · {1}", latestPaid.crop, latestPaid.paymentStatus) : "No payments" },
          { to: "/profile" as const, icon: User, label: "Profile", value: "Details & crop preferences" },
        ].map(({ to, icon: Icon, label, value }) => (
          <Link key={to} to={to} className="group rounded-2xl border bg-card p-5 shadow-card transition-colors hover:border-emerald">
            <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary"><Icon className="size-5" /></span>
            <p className="mt-4 text-sm text-muted-foreground">{t(label)}</p>
            <p className="font-semibold">{t(value)}</p>
          </Link>
        ))}
      </div>
      {latestPaid && <span className="sr-only"><StatusBadge tone={payTone[latestPaid.paymentStatus]}>{t(latestPaid.paymentStatus)}</StatusBadge></span>}
      <p className="mt-6 text-xs text-muted-foreground">{t("All centre, slot and timing values are fictional demo estimates.")}</p>
    </AppShell>
  );
}
