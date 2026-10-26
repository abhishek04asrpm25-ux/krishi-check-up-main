import { t, useLang } from "@/lib/i18n";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/kc/AppShell";
import { Alert, Card, DataTable, PageHeader, StatusBadge } from "@/components/kc/ui";
import { BOOKABLE_DATES, CENTRES, FLOW, centreDayCapacity, centreDayLeft, crowd, fmtDate, fmtDur, statusTone, useKC, type Status } from "@/lib/kc-store";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/admin")({
  head: () => pageHead("Demo Admin Overview", "Aggregated demo statistics for centres, bookings and statuses."),
  component: Admin,
});

function Admin() {
  useLang();
  const s = useKC();
  const statuses: Status[] = [...FLOW, "Cancelled"];
  const count = (st: Status) => s.bookings.filter((b) => b.status === st).length;
  const open = CENTRES.filter((c) => c.open);
  const avgWait = Math.round(open.reduce((a, c) => a + c.waitMin, 0) / (open.length || 1));
  const day = BOOKABLE_DATES[0];
  return (
    <AppShell>
      <PageHeader title={t("Admin Overview (Demo)")} subtitle={t("Read-only aggregated demo statistics")} />
      <Alert tone="warning" title={t("Demo admin view")}>{t("Not protected by real authorization. Figures come from fictional sample data in this browser.")}</Alert>
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {[["Centres", `${open.length} open / ${CENTRES.length}`], ["Bookings (this device)", String(s.bookings.length)], ["Avg. est. wait", fmtDur(avgWait)], ["Active", String(s.bookings.filter((b) => b.status !== "Completed" && b.status !== "Cancelled").length)]].map(([l, v]) => (
          <Card key={l}><p className="text-sm text-muted-foreground">{t(l)}</p><p className="mt-1 font-display text-2xl font-bold">{t(v)}</p></Card>
        ))}
      </div>
      <h2 className="mb-3 mt-8 text-lg font-semibold">{t("Status distribution")}</h2>
      <div className="flex flex-wrap gap-3">{statuses.map((st) => <StatusBadge key={st} tone={statusTone[st]}>{t(st)}: {t(count(st))}</StatusBadge>)}</div>
      <h2 className="mb-3 mt-8 text-lg font-semibold">{t("Centres ·")}{" "}{t(fmtDate(day))}</h2>
      <DataTable
        head={["Centre", "Crowd", "Est. wait", "Queue", "Slots left"]}
        rows={CENTRES.map((c) => [c.name, <StatusBadge tone={crowd(c).tone}>{t(crowd(c).label)}</StatusBadge>, c.open ? fmtDur(c.waitMin) : "—", c.open ? c.queue : "—", centreDayCapacity(c.id) ? `${centreDayLeft(s, c.id, day)} / ${centreDayCapacity(c.id)}` : "—"])}
      />
    </AppShell>
  );
}
