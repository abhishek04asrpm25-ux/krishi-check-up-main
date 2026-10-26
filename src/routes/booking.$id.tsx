import { t, useLang } from "@/lib/i18n";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/kc/AppShell";
import { JourneyPlan, StatusPill, StatusTimeline } from "@/components/kc/booking";
import { Alert, Button, Card, CardTitle, InfoRow, PageHeader, StatusBadge, buttonVariants } from "@/components/kc/ui";
import { amountOf, canCancel, cancelBooking, fmtDate, fmtTime, getCentre, inr, payTone, useKC } from "@/lib/kc-store";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/booking/$id")({
  validateSearch: (s: Record<string, unknown>): { new?: boolean } => ({ new: s.new === true || s.new === "true" ? true : undefined }),
  head: ({ params }) => ({ ...pageHead(`Booking ${params.id}`, "Demo booking details, status and Know Before You Go plan."), }),
  component: BookingPage,
});

function BookingPage() {
  useLang();
  const { id } = Route.useParams();
  const { new: isNew } = Route.useSearch();
  const s = useKC();
  const [confirming, setConfirming] = useState(false);
  const b = s.bookings.find((x) => x.id === id);
  if (!b) {
    return <AppShell><Alert tone="danger" title={t("Booking not found")}>{t("No demo booking with ID")}{" "}{t(id)}. <Link to="/tracking" className="font-semibold underline">{t("Go to My Procurement")}</Link></Alert></AppShell>;
  }
  const c = getCentre(b.centreId);
  return (
    <AppShell>
      {isNew && b.status === "Booked" && <div className="mb-6"><Alert tone="success" title={t("Booking confirmed (demo)")}>{t("Your demo procurement ID is")}{" "}<strong>{t(b.id)}</strong>{t(". Save it to track your booking.")}</Alert></div>}
      <PageHeader title={t(b.id)} subtitle={t(`${b.crop} · ${b.qty} qtl · ${c?.name ?? "Unknown centre"}`)}
        action={<div className="flex flex-wrap gap-2">
          <Link to="/tracking" search={{ id: b.id }} className={buttonVariants({ variant: "outline" })}>{t("Track")}</Link>
          {canCancel(b) && !confirming && <Button variant="outline" onClick={() => setConfirming(true)}>{t("Cancel booking")}</Button>}
        </div>} />
      {confirming && (
        <div className="mb-6 rounded-2xl border border-destructive bg-danger-soft p-4">
          <p className="font-semibold">{t("Cancel")}{" "}{t(b.id)}?</p>
          <p className="text-sm text-muted-foreground">{t("The demo slot will be released for other farmers.")}</p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={() => { if (cancelBooking(b.id)) toast.success(t("Booking cancelled")); else toast.error(t("This booking can no longer be cancelled.")); setConfirming(false); }}>{t("Yes, cancel")}</Button>
            <Button size="sm" variant="outline" onClick={() => setConfirming(false)}>{t("Keep booking")}</Button>
          </div>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <Card>
          <CardTitle>{t("Booking details")}</CardTitle>
          <InfoRow label={t("Status")} value={<StatusPill b={b} />} />
          <InfoRow label={t("Crop")} value={b.crop} />
          <InfoRow label={t("Quantity")} value={`${b.qty} qtl`} />
          <InfoRow label={t("Centre")} value={c ? <Link to="/centres/$id" params={{ id: c.id }} className="text-primary">{t(c.name)}</Link> : "—"} />
          <InfoRow label={t("Date & slot")} value={`${fmtDate(b.date)}, ${fmtTime(b.slot)}`} />
          <InfoRow label={t("Estimated value (illustrative)")} value={inr(amountOf(b))} />
          <InfoRow label={t("Payment status (demo)")} value={<StatusBadge tone={payTone[b.paymentStatus]}>{t(b.status === "Cancelled" ? "Not applicable" : b.paymentStatus)}</StatusBadge>} />
        </Card>
        <Card className="self-start"><CardTitle>{t("Status history")}</CardTitle><StatusTimeline b={b} /></Card>
      </div>
      {b.status !== "Cancelled" && b.status !== "Completed" && (
        <div className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">{t("Know Before You Go")}</h2>
          <JourneyPlan b={b} />
        </div>
      )}
    </AppShell>
  );
}
