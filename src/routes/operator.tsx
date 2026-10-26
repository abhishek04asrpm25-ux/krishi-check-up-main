import { t, useLang } from "@/lib/i18n";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/kc/AppShell";
import { StatusPill } from "@/components/kc/booking";
import { Alert, Button, Card, DataTable, Field, PageHeader, Select, StatusBadge } from "@/components/kc/ui";
import { BOOKABLE_DATES, CENTRES, advanceStatus, centreDayCapacity, centreDayLeft, fmtDur, getCentre, fmtDate, fmtTime, markPaid, nextStatus, payTone, useKC } from "@/lib/kc-store";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/operator")({
  head: () => pageHead("Demo Centre Operator", "Demo operator queue to update procurement booking statuses."),
  component: Operator,
});

function Operator() {
  useLang();
  const s = useKC();
  const [centre, setCentre] = useState("gohana-3");
  const rows = s.bookings.filter((b) => b.centreId === centre && b.status !== "Cancelled");
  return (
    <AppShell>
      <PageHeader title={t("Centre Operator (Demo)")} subtitle={t("Demo workflow — not secure authorization")} />
      <Alert tone="warning" title={t("Demo operator view")}>{t("Anyone using this demo can open this page. Status changes here are fictional and only update this browser's demo data.")}</Alert>
      <div className="my-6 max-w-md">
        <Field label={t("Centre")} htmlFor="oc">
          <Select id="oc" value={centre} onChange={(e) => setCentre(e.target.value)}>
            {CENTRES.map((c) => <option key={c.id} value={c.id}>{t(c.name)}</option>)}
          </Select>
        </Field>
      </div>
      {(() => { const c = getCentre(centre); const d = BOOKABLE_DATES[0]; const cap = centreDayCapacity(centre); const m: [string, string][] = [
        ["Vehicles in queue (demo)", c?.open ? String(c.queue) : "Closed"],
        ["Est. wait (simulated)", c?.open ? fmtDur(c.waitMin) : "—"],
        [`Slots left · ${fmtDate(d)}`, cap ? `${centreDayLeft(s, centre, d)} / ${cap}` : "—"],
        ["Active bookings", String(rows.filter((b) => b.status !== "Completed").length)],
      ]; return <div className="mb-6 grid gap-4 grid-cols-2 sm:grid-cols-4">{m.map(([l, v]) => <Card key={l}><p className="text-sm text-muted-foreground">{t(l)}</p><p className="mt-1 font-display text-2xl font-bold">{t(v)}</p></Card>)}</div>; })()}
      {rows.length === 0 ? <p className="text-sm text-muted-foreground">{t("No bookings in this centre's demo queue.")}</p> : (
        <DataTable
          head={["Procurement ID", "Crop", "Date & slot", "Status", "Payment", "Action"]}
          rows={rows.map((b) => {
            const nx = nextStatus(b);
            return [
              <Link to="/tracking" search={{ id: b.id }} className="font-semibold text-primary">{t(b.id)}</Link>,
              `${b.crop} · ${b.qty} qtl`, `${fmtDate(b.date)}, ${fmtTime(b.slot)}`, <StatusPill b={b} />,
              <StatusBadge tone={payTone[b.paymentStatus]}>{t(b.paymentStatus)}</StatusBadge>,
              nx ? <Button size="sm" onClick={() => { if (advanceStatus(b.id)) toast.success(t(`${b.id} → ${nx}`)); }}>{t("Mark")}{" "}{t(nx)}</Button>
                : b.paymentStatus === "Processing" ? <Button size="sm" variant="outline" onClick={() => { if (markPaid(b.id)) toast.success(t("Marked Paid (illustrative)")); }}>{t("Mark Paid (demo)")}</Button>
                : <span className="text-muted-foreground">—</span>,
            ];
          })}
        />
      )}
      <p className="mt-3 text-xs text-muted-foreground">{t("Allowed transitions: Booked → In Queue → Processing → Completed. Completed is never set automatically.")}</p>
    </AppShell>
  );
}
