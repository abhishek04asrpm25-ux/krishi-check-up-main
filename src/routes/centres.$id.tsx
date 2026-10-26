import { t as tr, useLang } from "@/lib/i18n";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, CalendarCheck } from "lucide-react";
import { AppShell } from "@/components/kc/AppShell";
import { Alert, Card, CardTitle, DataTable, InfoRow, PageHeader, StatusBadge, buttonVariants } from "@/components/kc/ui";
import { BOOKABLE_DATES, SLOT_TIMES, centreDayLeft, crowd, fmtDate, fmtDur, fmtTime, getCentre, slotInfo, useKC } from "@/lib/kc-store";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/centres/$id")({
  loader: ({ params }) => {
    const c = getCentre(params.id);
    if (!c) throw notFound();
    return { id: c.id, name: c.name };
  },
  head: ({ loaderData }) => loaderData ? pageHead(loaderData.name, `Demo details, hours, waiting estimate and slots for ${loaderData.name}.`) : { meta: [{ title: "Centre not found — KrishiConnect" }, { name: "robots", content: "noindex" }] },
  component: CentreDetail,
  notFoundComponent: () => (
    <AppShell><Alert tone="danger" title={tr("Centre not found")}>{tr("This centre does not exist.")}{" "}<Link to="/centres" className="font-semibold underline">{tr("Back to centres")}</Link></Alert></AppShell>
  ),
  errorComponent: ({ error }) => <AppShell><Alert tone="danger" title={tr("Could not load centre")}>{tr((error as Error).message)}</Alert></AppShell>,
});

function CentreDetail() {
  useLang();
  const { id } = Route.useLoaderData();
  const s = useKC();
  const c = getCentre(id)!;
  const cr = crowd(c);
  return (
    <AppShell>
      <Link to="/centres" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-primary"><ArrowLeft className="size-4" />{tr("All centres")}</Link>
      <PageHeader title={tr(c.name)} subtitle={tr(c.address)}
        action={c.open ? <Link to="/apply" search={{ centre: c.id }} className={buttonVariants({ size: "lg" })}><CalendarCheck className="size-5" />{tr("Book Procurement Slot")}</Link> : undefined} />
      <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <Card className="self-start">
          <CardTitle action={<StatusBadge tone={cr.tone}>{tr(c.open ? "Procuring" : "Not procuring today")}</StatusBadge>}>{tr("Centre overview")}</CardTitle>
          <InfoRow label={tr("Supported crops")} value={c.crops.join(", ")} />
          <InfoRow label={tr("Working hours")} value={c.hours} />
          <InfoRow label={tr("Distance (sample)")} value={`${c.distanceKm} km`} />
          <InfoRow label={tr("Crowd level (demo)")} value={cr.label} />
          <InfoRow label={tr("Estimated waiting (demo)")} value={c.open ? fmtDur(c.waitMin) : "—"} />
          <InfoRow label={tr("Queue length (demo)")} value={c.open ? `${c.queue} vehicles` : "—"} />
          <InfoRow label={tr("Capacity per slot")} value={c.open ? `${c.slotCapacity} farmers` : "—"} />
          <p className="mt-4 text-xs text-muted-foreground">{tr("All values are demo estimates, not live government procurement data.")}</p>
        </Card>
        <Card>
          <CardTitle>{tr("Available demo slots")}</CardTitle>
          {!c.open ? <Alert tone="warning" title={tr("Closed")}>{tr("This centre has no bookable slots right now.")}</Alert> : (
            <DataTable
              head={["Date", ...SLOT_TIMES.map(fmtTime), "Left"]}
              rows={BOOKABLE_DATES.map((d) => [
                <span className="font-semibold">{tr(fmtDate(d))}</span>,
                ...SLOT_TIMES.map((t) => {
                  const i = slotInfo(s, c.id, d, t);
                  return i.left > 0
                    ? <Link to="/apply" search={{ centre: c.id, date: d, slot: t }} className="font-semibold text-primary underline-offset-2 hover:underline">{tr(i.left)} {tr("free")}</Link>
                    : <span className="text-muted-foreground">{tr("Full")}</span>;
                }),
                centreDayLeft(s, c.id, d),
              ])}
            />
          )}
        </Card>
      </div>
    </AppShell>
  );
}
