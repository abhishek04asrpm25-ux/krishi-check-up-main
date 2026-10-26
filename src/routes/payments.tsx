import { t, useLang } from "@/lib/i18n";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/kc/AppShell";
import { Alert, Card, DataTable, PageHeader, StatusBadge } from "@/components/kc/ui";
import { amountOf, fmtDate, inr, payTone, useKC } from "@/lib/kc-store";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/payments")({
  head: () => pageHead("Payment Tracking", "Illustrative payment statuses for your demo procurements."),
  component: Payments,
});

function Payments() {
  useLang();
  const s = useKC();
  const list = s.bookings.filter((b) => b.status !== "Cancelled");
  const sum = (f: (p: string) => boolean) => list.filter((b) => f(b.paymentStatus)).reduce((a, b) => a + amountOf(b), 0);
  return (
    <AppShell>
      <PageHeader title={t("Payments")} subtitle={t("Illustrative statuses only")} />
      <Alert tone="warning" title={t("Demo payments")}>{t("This demo never initiates or confirms real payments. Amounts are estimates at MSP and no money is transferred.")}</Alert>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[["Pending", sum((p) => p === "Pending")], ["Processing", sum((p) => p === "Processing")], ["Paid (illustrative)", sum((p) => p === "Paid")]].map(([l, v]) => (
          <Card key={l as string}><p className="text-sm text-muted-foreground">{t(l)}</p><p className="mt-1 font-display text-2xl font-bold">{t(inr(v as number))}</p></Card>
        ))}
      </div>
      <h2 className="mb-3 mt-8 text-lg font-semibold">{t("Payment history")}</h2>
      {list.length === 0 ? <p className="text-sm text-muted-foreground">{t("No payments yet.")}</p> : (
        <DataTable
          head={["Procurement ID", "Crop", "Quantity", "Amount (est.)", "Date", "Status"]}
          rows={list.map((b) => [
            <Link to="/booking/$id" params={{ id: b.id }} className="font-semibold text-primary">{t(b.id)}</Link>,
            b.crop, `${b.qty} qtl`, <span className="font-semibold">{t(inr(amountOf(b)))}</span>, fmtDate(b.date),
            <StatusBadge tone={payTone[b.paymentStatus]}>{t(b.paymentStatus)}</StatusBadge>,
          ])}
        />
      )}
      <p className="mt-3 text-xs text-muted-foreground">{t("Pending = not yet procured · Processing = procurement completed, payment being prepared · Paid = marked paid by demo operator.")}</p>
    </AppShell>
  );
}
