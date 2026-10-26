import { t, useLang } from "@/lib/i18n";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/kc/AppShell";
import { JourneyPlan } from "@/components/kc/booking";
import { Alert, Field, PageHeader, Select, buttonVariants } from "@/components/kc/ui";
import { fmtDate, fmtTime, getCentre, isActive, upcoming, useKC } from "@/lib/kc-store";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/know-before-you-go")({
  validateSearch: (s: Record<string, unknown>): { id?: string } => ({ id: typeof s.id === "string" && s.id ? s.id : undefined }),
  head: () => pageHead("Know Before You Go", "Your procurement journey: departure, travel, waiting and processing estimates."),
  component: KBYG,
});

function KBYG() {
  useLang();
  const s = useKC();
  const { id } = Route.useSearch();
  const navigate = useNavigate({ from: "/know-before-you-go" });
  const active = s.bookings.filter(isActive);
  const b = (id && active.find((x) => x.id === id)) || upcoming(s);
  return (
    <AppShell>
      <PageHeader title={t("Know Before You Go")} subtitle={t(b ? `${getCentre(b.centreId)?.name} · ${fmtDate(b.date)}, ${fmtTime(b.slot)}` : "Plan your visit")} />
      {!b ? (
        <Alert tone="info" title={t("No upcoming booking")}>{t("Book a procurement slot to get your journey plan.")}{" "}<Link to="/apply" className="font-semibold underline">{t("Book now")}</Link></Alert>
      ) : (
        <>
          {active.length > 1 && (
            <div className="mb-6 max-w-md">
              <Field label={t("Booking")} htmlFor="bk">
                <Select id="bk" value={b.id} onChange={(e) => navigate({ search: { id: e.target.value } })}>
                  {active.map((x) => <option key={x.id} value={x.id}>{t(x.id)} · {t(x.crop)} · {t(fmtDate(x.date))}</option>)}
                </Select>
              </Field>
            </div>
          )}
          <JourneyPlan b={b} />
          <Link to="/booking/$id" params={{ id: b.id }} className={buttonVariants({ variant: "outline", className: "mt-6" })}>{t("View booking")}</Link>
        </>
      )}
    </AppShell>
  );
}
