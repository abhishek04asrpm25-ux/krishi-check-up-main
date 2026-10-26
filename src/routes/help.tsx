import { t, useLang } from "@/lib/i18n";
import { createFileRoute } from "@tanstack/react-router";
import { Phone, MessageCircle, Mail, ChevronDown } from "lucide-react";
import { AppShell } from "@/components/kc/AppShell";
import { Card, PageHeader } from "@/components/kc/ui";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/help")({
  head: () => pageHead("Help & Support", "Answers to common questions and ways to contact the KrishiConnect helpline."),
  component: Help,
});

const faqs = [
  ["How is the recommended departure time calculated?", "We combine your travel distance, the centre's current crowd and your appointment slot to suggest when to leave."],
  ["What if I miss my appointment?", "You can reschedule once from My Procurement. A new slot is given based on availability."],
  ["When will I receive payment?", "Payments are usually credited within 72 hours of procurement completion."],
  ["Which documents do I need to carry?", "Aadhaar, appointment token, land record copy and bank passbook. See Know Before You Go for your list."],
];

function Help() {
  useLang();
  return (
    <AppShell>
      <PageHeader title={t("Help & Support")} subtitle={t("We're here Monday to Saturday, 8 AM – 8 PM")} />
      <div className="grid gap-4 sm:grid-cols-3">
        {[[Phone, "Call helpline", "1800-180-1551"], [MessageCircle, "WhatsApp", "+91 90000 12345"], [Mail, "Email", "help@krishiconnect.in"]].map(([Icon, l, v]) => {
          const I = Icon as typeof Phone;
          return (
            <Card key={l as string}>
              <span className="grid size-11 place-items-center rounded-xl bg-secondary text-primary"><I className="size-5" /></span>
              <p className="mt-3 text-sm text-muted-foreground">{t(l as string)}</p>
              <p className="font-semibold">{t(v as string)}</p>
            </Card>
          );
        })}
      </div>
      <h2 className="mb-3 mt-8 text-lg font-semibold">{t("Frequently asked questions")}</h2>
      <div className="space-y-3">
        {faqs.map(([q, a]) => (
          <details key={q} className="group rounded-2xl border bg-card p-4 shadow-card">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold">
              {t(q)}<ChevronDown className="size-5 shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm text-muted-foreground">{t(a)}</p>
          </details>
        ))}
      </div>
    </AppShell>
  );
}
