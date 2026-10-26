import { t, useLang } from "@/lib/i18n";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MapPin, Clock, Search, Hourglass, SearchX } from "lucide-react";
import { AppShell } from "@/components/kc/AppShell";
import { Button, Card, Field, Input, PageHeader, Progress, Select, StatusBadge, buttonVariants } from "@/components/kc/ui";
import { BOOKABLE_DATES, CENTRES, CROPS, centreDayCapacity, centreDayLeft, crowd, fmtDur, useKC } from "@/lib/kc-store";
import { STATES, districtsOf } from "@/lib/locations";
import { pageHead } from "@/lib/head";

type S = { q?: string; crop?: string; state?: string; district?: string; maxKm?: number; maxWait?: number; avail?: string };

export const Route = createFileRoute("/centres/")({
  validateSearch: (s: Record<string, unknown>): S => ({
    q: typeof s.q === "string" && s.q ? s.q : undefined,
    crop: typeof s.crop === "string" && s.crop ? s.crop : undefined,
    state: typeof s.state === "string" && s.state ? s.state : undefined,
    district: typeof s.district === "string" && s.district ? s.district : undefined,
    maxKm: Number(s.maxKm) > 0 ? Number(s.maxKm) : undefined,
    maxWait: Number(s.maxWait) > 0 ? Number(s.maxWait) : undefined,
    avail: s.avail === "slots" ? "slots" : undefined,
  }),
  head: () => pageHead("Procurement Centres", "Compare nearby procurement centres by crowd, waiting time and distance."),
  component: Centres,
});

function Centres() {
  useLang();
  const s = useKC();
  const { q = "", crop = "", state = "", district = "", maxKm, maxWait, avail } = Route.useSearch();
  const navigate = useNavigate({ from: "/centres/" });
  const upd = (p: Partial<S>) => navigate({ search: (prev) => ({ ...prev, ...p }), replace: true });
  const day = BOOKABLE_DATES[0];
  const norm = (x: string) => x.toLowerCase().replace(/\s+/g, " ").trim();
  const nq = norm(q);
  const list = CENTRES.filter((c) =>
    (!nq || norm(`${c.name} ${c.address} ${c.crops.join(" ")}`).includes(nq)) &&
    (!crop || c.crops.some((x) => norm(x) === norm(crop))) &&
    (!state || norm(c.state) === norm(state)) &&
    (!district || norm(c.district) === norm(district)) &&
    (!avail || (c.open && centreDayLeft(s, c.id, day) > 0)) &&
    (!maxKm || c.distanceKm <= maxKm) &&
    (!maxWait || (c.open && c.waitMin <= maxWait)),
  );
  return (
    <AppShell>
      <PageHeader title={t("Procurement Centres")} subtitle={t("Sample crowd and waiting estimates (demo data, not live)")} />
      <Card className="mb-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label={t("State")} htmlFor="st">
            <Select id="st" value={state} onChange={(e) => upd({ state: e.target.value || undefined, district: undefined })}>
              <option value="">{t("All states")}</option>
              {STATES.map((x) => <option key={x} value={x}>{t(x)}</option>)}
            </Select>
          </Field>
          <Field label={t("District")} htmlFor="di">
            <Select id="di" value={district} onChange={(e) => upd({ district: e.target.value || undefined })} disabled={!state}>
              <option value="">{state ? t("All districts") : t("Select a state first")}</option>
              {districtsOf(state).map((x) => <option key={x} value={x}>{t(x)}</option>)}
            </Select>
          </Field>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-1">
            <Field label={t("Search")} htmlFor="q">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                <Input id="q" value={q} onChange={(e) => upd({ q: e.target.value || undefined })} placeholder={t("Centre name or place")} className="pl-12" />
              </div>
            </Field>
          </div>
          <Field label={t("Crop")} htmlFor="crop">
            <Select id="crop" value={crop} onChange={(e) => upd({ crop: e.target.value || undefined })}>
              <option value="">{t("All crops")}</option>
              {CROPS.map((c) => <option key={c.crop}>{t(c.crop)}</option>)}
            </Select>
          </Field>
          <Field label={t("Max distance")} htmlFor="km">
            <Select id="km" value={maxKm ?? ""} onChange={(e) => upd({ maxKm: Number(e.target.value) || undefined })}>
              <option value="">{t("Any distance")}</option>
              {[20, 30, 45].map((k) => <option key={k} value={k}>{t("Within")}{" "}{t(k)} {t("km")}</option>)}
            </Select>
          </Field>
          <Field label={t("Max waiting")} htmlFor="w">
            <Select id="w" value={maxWait ?? ""} onChange={(e) => upd({ maxWait: Number(e.target.value) || undefined })}>
              <option value="">{t("Any wait")}</option>
              {[15, 30, 60].map((k) => <option key={k} value={k}>{t("Up to")}{" "}{t(k)} {t("min")}</option>)}
            </Select>
          </Field>
          <Field label={t("Availability")} htmlFor="av">
            <Select id="av" value={avail ?? ""} onChange={(e) => upd({ avail: e.target.value || undefined })}>
              <option value="">{t("All centres")}</option>
              <option value="slots">{t("Open with free slots")}</option>
            </Select>
          </Field>
        </div>
      </Card>
      {list.length === 0 ? (
        <Card className="py-12 text-center">
          <SearchX className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-3 font-semibold">{t("No centres match your filters")}</p>
          <p className="text-sm text-muted-foreground">{t("Try a different crop, clear the search box, set Availability to All centres, or widen distance and waiting limits.")}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate({ search: {}, replace: true })}>{t("Clear filters")}</Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((c) => {
            const cr = crowd(c);
            const cap = centreDayCapacity(c.id);
            const left = centreDayLeft(s, c.id, day);
            return (
              <Card key={c.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link to="/centres/$id" params={{ id: c.id }} className="font-semibold hover:text-primary">{t(c.name)}</Link>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="size-4 shrink-0" />{t(c.address)} · {t(c.district)}, {t(c.state)} · {t(c.distanceKm)} {t("km")}</p>
                  </div>
                  <StatusBadge tone={cr.tone}>{t(cr.label)}</StatusBadge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-muted p-3"><Hourglass className="mb-1 size-4 text-primary" /><p className="text-muted-foreground">{t("Est. wait (demo)")}</p><p className="font-semibold">{t(c.open ? fmtDur(c.waitMin) : "—")}</p></div>
                  <div className="rounded-xl bg-muted p-3"><Clock className="mb-1 size-4 text-primary" /><p className="text-muted-foreground">{t("Hours")}</p><p className="font-semibold">{t(c.hours)}</p></div>
                </div>
                <div className="mt-4">
                  {cap ? <Progress value={Math.round(((cap - left) / cap) * 100)} label={t(`Slots booked · next day (${left} of ${cap} left)`)} /> : <p className="text-sm text-muted-foreground">{t("No slots — centre closed.")}</p>}
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5">{c.crops.map((x) => <span key={x} className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">{t(x)}</span>)}</div>
                  <div className="flex gap-2">
                    <Link to="/centres/$id" params={{ id: c.id }} className={buttonVariants({ size: "sm", variant: "outline" })}>{t("Details")}</Link>
                    {c.open && <Link to="/apply" search={{ centre: c.id, crop: crop || undefined }} className={buttonVariants({ size: "sm" })}>{t("Book slot")}</Link>}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
