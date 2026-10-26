import { t as tr, useLang } from "@/lib/i18n";
import { Home, Car, MapPin, Hourglass, Scale, CheckCircle2 } from "lucide-react";
import { Alert, Card, CardTitle, StatusBadge, Timeline, type TimelineStep } from "./ui";
import { CHECKLIST, FLOW, fmtDate, fmtDur, fmtStamp, fmtTime, getCentre, journey, statusTone, type Booking } from "@/lib/kc-store";

export function StatusPill({ b }: { b: Booking }) {
  useLang();
  return <StatusBadge tone={statusTone[b.status]}>{tr(b.status)}</StatusBadge>;
}

export function EstimateNote() {
  useLang();
  return (
    <Alert tone="info" title={tr("Illustrative estimates only")}>
      {tr("Times are calculated from your slot, the centre's sample distance and sample waiting time. No live GPS, traffic or queue data is used — actual conditions may differ.")}
    </Alert>
  );
}

export function JourneyPlan({ b }: { b: Booking }) {
  useLang();
  const c = getCentre(b.centreId);
  if (!c) return <Alert tone="danger" title={tr("Centre not found")}>{tr("This booking refers to an unknown centre.")}</Alert>;
  const j = journey(b);
  const steps = [
    { icon: Home, t: fmtTime(j.departure), title: "Recommended departure", d: "Leave home by this time" },
    { icon: Car, t: fmtDur(j.travel), title: "Estimated travel", d: `${j.distanceKm} km (sample distance)` },
    { icon: MapPin, t: fmtTime(j.arrive), title: "Arrive & gate entry", d: `${j.buffer} min before your ${fmtTime(b.slot)} slot` },
    { icon: Hourglass, t: fmtDur(j.wait) === "—" ? "No wait" : `~${fmtDur(j.wait)}`, title: "Estimated waiting", d: "Sample queue estimate" },
    { icon: Scale, t: `~${fmtDur(j.processing)}`, title: "Estimated processing", d: `Quality check & weighing for ${b.qty} qtl` },
    { icon: CheckCircle2, t: fmtTime(j.completion), title: "Estimated completion", d: `${fmtTime(b.slot)} + wait + processing` },
  ];
  return (
    <div className="space-y-6">
      <Card>
        <CardTitle>{tr("Your journey ·")}{" "}{tr(fmtDate(b.date))}</CardTitle>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map(({ icon: Icon, t, title, d }, i) => (
            <li key={title} className="flex gap-4 rounded-2xl bg-muted p-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"><Icon className="size-5" /></span>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{tr("Step")}{" "}{tr(i + 1)}</p>
                <p className="font-semibold">{tr(title)}</p>
                <p className="font-display text-lg font-bold text-primary">{tr(t)}</p>
                <p className="text-sm text-muted-foreground">{tr(d)}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>
      <Card>
        <CardTitle icon={<CheckCircle2 className="size-5" />}>{tr("Bring these documents & items")}</CardTitle>
        <ul className="grid gap-3 text-sm sm:grid-cols-2">
          {CHECKLIST.map((d) => <li key={d} className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald" />{tr(d)}</li>)}
        </ul>
      </Card>
      <EstimateNote />
    </div>
  );
}

export function StatusTimeline({ b }: { b: Booking }) {
  useLang();
  if (b.status === "Cancelled") {
    return <Timeline steps={b.history.map((h) => ({ title: h.status, time: fmtStamp(h.at), detail: `By ${h.by}`, state: "done" as const }))} />;
  }
  const idx = FLOW.indexOf(b.status);
  const steps: TimelineStep[] = FLOW.map((s, i) => {
    const h = b.history.find((x) => x.status === s);
    return {
      title: s,
      time: h ? fmtStamp(h.at) : undefined,
      detail: h ? `Updated by ${h.by}` : "Awaiting demo update",
      state: i < idx || (i === idx && s === "Completed") ? "done" : i === idx ? "current" : "upcoming",
    };
  });
  return <Timeline steps={steps} />;
}
