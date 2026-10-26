import { t, useLang } from "@/lib/i18n";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/kc/AppShell";
import { StatusPill, StatusTimeline } from "@/components/kc/booking";
import { Alert, Button, Card, CardTitle, DataTable, InfoRow, Input, PageHeader, buttonVariants } from "@/components/kc/ui";
import { fmtDate, fmtTime, getCentre, upcoming, useKC } from "@/lib/kc-store";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/tracking")({
  validateSearch: (s: Record<string, unknown>): { id?: string } => ({ id: typeof s.id === "string" && s.id ? s.id : undefined }),
  head: () => pageHead("Procurement Tracking", "Track every demo procurement booking by its procurement ID."),
  component: Tracking,
});

function Tracking() {
  useLang();
  const s = useKC();
  const { id } = Route.useSearch();
  const navigate = useNavigate({ from: "/tracking" });
  const [q, setQ] = useState(id ?? "");
  const b = id ? s.bookings.find((x) => x.id.toLowerCase() === id.trim().toLowerCase()) : upcoming(s) ?? s.bookings[0];
  const c = b && getCentre(b.centreId);
  return (
    <AppShell>
      <PageHeader title={t("My Procurement")} subtitle={t("Track demo bookings and status updates")}
        action={<Link to="/apply" className={buttonVariants({})}><Plus className="size-4" />{t("New booking")}</Link>} />
      <form className="mb-6 flex gap-3" onSubmit={(e) => { e.preventDefault(); navigate({ search: { id: q.trim() || undefined } }); }}>
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input aria-label={t("Procurement ID")} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Enter procurement ID, e.g. PRC-HR-2026-118734")} className="pl-12" />
        </div>
        <Button type="submit">{t("Track")}</Button>
      </form>
      {!b ? (
        <Alert tone={id ? "danger" : "info"} title={t(id ? "No booking found" : "No bookings yet")}>
          {t(id ? `No demo booking matches "${id}". Check the ID and try again.` : "Book a slot to start tracking.")}
        </Alert>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          <Card><CardTitle action={<StatusPill b={b} />}>{t("Progress ·")}{" "}{t(b.id)}</CardTitle><StatusTimeline b={b} /></Card>
          <Card className="self-start">
            <CardTitle>{t("Summary")}</CardTitle>
            <InfoRow label={t("Crop")} value={b.crop} />
            <InfoRow label={t("Quantity")} value={`${b.qty} qtl`} />
            <InfoRow label={t("Centre")} value={c?.name ?? "—"} />
            <InfoRow label={t("Booking date")} value={fmtDate(b.date)} />
            <InfoRow label={t("Slot")} value={fmtTime(b.slot)} />
            <Link to="/booking/$id" params={{ id: b.id }} className={buttonVariants({ variant: "outline", size: "sm", className: "mt-4" })}>{t("View booking details")}</Link>
          </Card>
        </div>
      )}
      <h2 className="mb-3 mt-8 text-lg font-semibold">{t("Booking history")}</h2>
      {s.bookings.length === 0 ? <p className="text-sm text-muted-foreground">{t("No bookings yet.")}</p> : (
        <DataTable
          head={["Procurement ID", "Crop", "Quantity", "Date & slot", "Status"]}
          rows={s.bookings.map((x) => [
            <Link to="/booking/$id" params={{ id: x.id }} className="font-semibold text-primary">{t(x.id)}</Link>,
            x.crop, `${x.qty} qtl`, `${fmtDate(x.date)}, ${fmtTime(x.slot)}`, <StatusPill b={x} />,
          ])}
        />
      )}
    </AppShell>
  );
}
