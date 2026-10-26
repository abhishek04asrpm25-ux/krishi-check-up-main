import { t as tr, useLang } from "@/lib/i18n";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/kc/AppShell";
import { Alert, Button, Card, CardTitle, Field, InfoRow, Input, PageHeader, Select } from "@/components/kc/ui";
import { BOOKABLE_DATES, CENTRES, CROPS, SLOT_TIMES, amountOf, createBooking, fmtDate, fmtTime, fmtDur, getCentre, getCrop, inr, journey, resolveDraft, setSelectedCentre, slotInfo, useKC, validateBooking } from "@/lib/kc-store";
import { StateDistrictSelect } from "@/components/kc/StateDistrictSelect";
import { pageHead } from "@/lib/head";
import { cn } from "@/lib/utils";

type S = { centre?: string; crop?: string; date?: string; slot?: number };

export const Route = createFileRoute("/apply")({
  validateSearch: (s: Record<string, unknown>): S => ({
    centre: typeof s.centre === "string" ? s.centre : undefined,
    crop: typeof s.crop === "string" ? s.crop : undefined,
    date: typeof s.date === "string" ? s.date : undefined,
    slot: Number(s.slot) > 0 ? Number(s.slot) : undefined,
  }),
  head: () => pageHead("Book Procurement Slot", "Choose crop, centre, date and time slot to book a demo procurement visit."),
  component: Apply,
});

// Wait for the client store to load, and remount when the URL selection changes,
// so the form never keeps a stale centre from a previous visit or the server snapshot.
function Apply() {
  useLang();
  const search = Route.useSearch();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return <AppShell><PageHeader title={tr("Book Procurement Slot")} subtitle={tr("Loading…")} /></AppShell>;
  return <ApplyForm key={JSON.stringify(search)} />;
}

function ApplyForm() {
  useLang();
  const s = useKC();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [init] = useState(() => resolveDraft(s, { ...search, centre: search.centre ?? s.selectedCentreId }));
  const [crop, setCrop] = useState(init.crop);
  const [qty, setQty] = useState(init.crop ? String(s.crops.find((x) => x.crop === init.crop)?.expectedQtl ?? getCrop(init.crop)?.expectedQtl ?? "") : "");
  const qtyFor = (name: string) => (name ? String(s.crops.find((x) => x.crop === name)?.expectedQtl ?? getCrop(name)?.expectedQtl ?? "") : "");
  const [centreId, setCentreRaw] = useState(init.centreId);
  const [locState, setLocState] = useState(() => getCentre(init.centreId)?.state ?? "");
  const [locDistrict, setLocDistrict] = useState(() => getCentre(init.centreId)?.district ?? "");
  const setCentreId = (id: string) => { setCentreRaw(id); setSelectedCentre(id || undefined); };
  const [date, setDate] = useState(init.date);
  const [slot, setSlot] = useState<number | undefined>(init.slot);
  useEffect(() => { if (search.centre && init.dropped) toast.warning(tr("The selected centre is closed or doesn't procure this crop. Please choose another centre.")); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [review, setReview] = useState(false);
  const [busy, setBusy] = useState(false);

  const input = { crop, qty: Number(qty), centreId, date, slot };
  const c = getCentre(centreId);
  // Crops offered = those the selected centre procures (all known crops when no centre is chosen).
  const cropOptions = c ? CROPS.filter((x) => c.crops.includes(x.crop)) : CROPS;
  const changeCentre = (id: string) => {
    setCentreId(id); setSlot(undefined); setErrors({});
    const nc = getCentre(id);
    if (nc && crop && !nc.crops.includes(crop)) { toast.info(tr(`${nc.name} doesn't procure ${crop}. Please select a crop it supports.`)); setCrop(""); setQty(""); }
  };
  // Centres offered = those in the selected state/district (all centres when no location is chosen).
  const centreOptions = CENTRES.filter((x) => (!locState || x.state === locState) && (!locDistrict || x.district === locDistrict));
  const changeLocState = (st: string) => {
    setLocState(st); setLocDistrict("");
    if (centreId && getCentre(centreId)?.state !== st) { changeCentre(""); }
  };
  const changeLocDistrict = (di: string) => {
    setLocDistrict(di);
    if (centreId && di && getCentre(centreId)?.district !== di) { changeCentre(""); }
  };

  const toReview = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateBooking(s, input);
    setErrors(errs);
    if (Object.keys(errs).length === 0) setReview(true);
  };
  const confirm = () => {
    if (busy || slot === undefined) return;
    setBusy(true);
    const r = createBooking({ ...input, slot });
    if (!r.ok) { setErrors(r.errors); setReview(false); setBusy(false); toast.error(tr("Booking could not be completed.")); return; }
    toast.success(tr(`Booked! Demo procurement ID ${r.id}`));
    navigate({ to: "/booking/$id", params: { id: r.id }, search: { new: true } });
  };

  if (review && c && slot !== undefined) {
    const j = journey({ centreId, slot, qty: Number(qty) });
    return (
      <AppShell>
        <PageHeader title={tr("Review your booking")} subtitle={tr("Check the details before confirming")} />
        <Card className="max-w-2xl">
          <CardTitle>{tr("Booking summary")}</CardTitle>
          <InfoRow label={tr("Crop")} value={`${crop} (${getCrop(crop)?.variety})`} />
          <InfoRow label={tr("Quantity")} value={`${qty} qtl`} />
          <InfoRow label={tr("Centre")} value={c.name} />
          <InfoRow label={tr("Date & slot")} value={`${fmtDate(date)}, ${fmtTime(slot)}`} />
          <InfoRow label={tr("Estimated value at MSP (illustrative)")} value={inr(amountOf({ crop, qty: Number(qty) } as never))} />
          <InfoRow label={tr("Recommended departure (estimate)")} value={fmtTime(j.departure)} />
          <InfoRow label={tr(`Travel time (~${j.distanceKm} km)`)} value={`${fmtDur(j.travel)} · arrive by ${fmtTime(j.arrive)}`} />
          <InfoRow label={tr("Sample queue wait")} value={fmtDur(j.wait)} />
          <InfoRow label={tr("Processing (estimate)")} value={fmtDur(j.processing)} />
          <InfoRow label={tr("Estimated completion")} value={fmtTime(j.completion)} />
          <p className="mt-3 text-xs text-muted-foreground">{tr("Simulated estimates for demo planning — not live traffic or queue data.")}</p>
          {errors.form && <div className="mt-4"><Alert tone="danger" title={tr("Cannot book")}>{tr(errors.form)}</Alert></div>}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={confirm} disabled={busy} size="lg">{tr(busy ? "Confirming…" : "Confirm booking")}</Button>
            <Button variant="outline" size="lg" onClick={() => setReview(false)} disabled={busy}>{tr("Edit details")}</Button>
          </div>
        </Card>
      </AppShell>
    );
  }

  const err = (k: string) => errors[k] ? <p role="alert" className="text-sm font-medium text-destructive">{tr(errors[k])}</p> : null;

  return (
    <AppShell>
      <PageHeader title={tr("Book Procurement Slot")} subtitle={tr("Demo booking — no real government booking is made")} />
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="p-6">
          <form className="grid gap-5 sm:grid-cols-2" onSubmit={toReview} noValidate>
            <Field label={tr("Crop")} htmlFor="c">
              <Select id="c" value={crop} onChange={(e) => { setCrop(e.target.value); setQty(qtyFor(e.target.value)); setSlot(undefined); if (c && !c.crops.includes(e.target.value)) { setCentreId(""); setSlot(undefined); toast.info(tr(`${c.name} doesn't procure ${e.target.value}. Please choose another centre.`)); } setErrors({}); }}>
                <option value="">{tr("Select crop")}</option>
                {cropOptions.map((x) => <option key={x.crop} value={x.crop}>{tr(x.crop)} ({tr(x.variety)})</option>)}
              </Select>
              {tr(err("crop"))}
            </Field>
            <Field label={tr("Quantity (quintals)")} htmlFor="q">
              <Input id="q" inputMode="decimal" value={qty} onChange={(e) => setQty(e.target.value)} />
              {tr(err("qty"))}
            </Field>
            <StateDistrictSelect
              state={locState}
              district={locDistrict}
              onState={changeLocState}
              onDistrict={changeLocDistrict}
              idPrefix="apply"
            />
            <div className="sm:col-span-2">
              <Field label={tr("Procurement centre")} htmlFor="ce">
                <Select id="ce" value={centreId} onChange={(e) => changeCentre(e.target.value)}>
                  <option value="">{tr("Select centre")}</option>
                  {centreOptions.filter((x) => x.open).map((x) => { const no = !!crop && !x.crops.includes(crop); return <option key={x.id} value={x.id} disabled={no}>{tr(x.name)} — {tr(x.district)}, {tr(x.state)} · {tr(x.distanceKm)} {tr("km")}{no ? ` (${tr("does not procure")} ${tr(crop)})` : ""}</option>; })}
                </Select>
                {locState && centreOptions.filter((x) => x.open).length === 0 && <p className="text-sm text-muted-foreground">{tr("No demo centres in this location yet — sample data covers only a few districts.")}</p>}
                {tr(err("centreId"))}
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label={tr("Date")} htmlFor="d">
                <Select id="d" value={date} onChange={(e) => { setDate(e.target.value); setSlot(undefined); }}>
                  <option value="">{tr("Select date")}</option>
                  {BOOKABLE_DATES.map((d) => <option key={d} value={d}>{tr(fmtDate(d))}</option>)}
                </Select>
                {tr(err("date"))}
              </Field>
            </div>
            <fieldset className="sm:col-span-2">
              <legend className="mb-1.5 text-sm font-semibold">{tr("Time slot")}</legend>
              {!c || !date || !crop ? <p className="text-sm text-muted-foreground">{tr("Select a crop, centre and date to see available slots.")}</p> : SLOT_TIMES.every((t) => slotInfo(s, c.id, date, t).left <= 0) ? <Alert tone="warning" title={tr("No slots left on this date")}>{tr("Choose another date or a different centre.")}</Alert> : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {SLOT_TIMES.map((t) => {
                    const i = slotInfo(s, c.id, date, t);
                    const full = i.left <= 0;
                    return (
                      <button key={t} type="button" disabled={full} aria-pressed={slot === t} onClick={() => setSlot(t)}
                        className={cn("rounded-xl border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                          slot === t ? "border-primary bg-secondary ring-2 ring-ring/30" : "bg-card hover:border-emerald")}>
                        <p className="font-semibold">{tr(fmtTime(t))}</p>
                        <p className="text-xs text-muted-foreground">{tr(full ? "Full" : `${i.left} of ${i.capacity} left`)}</p>
                      </button>
                    );
                  })}
                </div>
              )}
              {tr(err("slot"))}
            </fieldset>
            {errors.form && <div className="sm:col-span-2"><Alert tone="danger" title={tr("Duplicate booking")}>{tr(errors.form)}</Alert></div>}
            <div className="sm:col-span-2"><Button type="submit" size="lg" className="w-full sm:w-auto">{tr("Review booking")}</Button></div>
          </form>
        </Card>
        <div className="space-y-4">
          {c ? (
            <Card data-testid="selected-centre">
              <CardTitle>{tr("Selected centre")}</CardTitle>
              <p className="font-semibold">{tr(c.name)}</p>
              <p className="text-sm text-muted-foreground">{tr(c.address)}</p>
              <InfoRow label={tr("Crops procured")} value={c.crops.join(", ")} />
              <InfoRow label={tr("Hours")} value={c.hours} />
              <InfoRow label={tr("Sample waiting time")} value={fmtDur(c.waitMin)} />
              <InfoRow label={tr("Distance")} value={`${c.distanceKm} km`} />
              {date && <InfoRow label={tr(`Slots left on ${fmtDate(date)}`)} value={String(SLOT_TIMES.reduce((a, t) => a + slotInfo(s, c.id, date, t).left, 0))} />}
              <p className="mt-2 text-xs text-muted-foreground">{tr("Demo sample data.")}</p>
            </Card>
          ) : <Alert tone="info" title={tr("No centre selected")}>{tr("Choose a centre that procures")}{" "}{tr(crop || "your crop")}.</Alert>}
          {crop && Number(qty) > 0 && <Alert tone="info" title={tr("Estimated amount (illustrative)")}>{tr(qty)} {tr("qtl ×")}{" "}{tr(inr(getCrop(crop)?.msp ?? 0))} {tr("MSP =")}{" "}{tr(inr(Number(qty) * (getCrop(crop)?.msp ?? 0)))}</Alert>}
          <Alert tone="warning" title={tr("Demo only")}>{tr("Slots and availability are fictional sample data.")}</Alert>
        </div>
      </div>
    </AppShell>
  );
}
