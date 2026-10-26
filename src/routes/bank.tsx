import { t, useLang } from "@/lib/i18n";
import { createFileRoute } from "@tanstack/react-router";
import { Landmark } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/kc/AppShell";
import { Alert, Button, Card, CardTitle, Field, InfoRow, Input, PageHeader, StatusBadge } from "@/components/kc/ui";
import { bank } from "@/lib/mock-data";
import { pageHead } from "@/lib/head";
import { DEMO_UID, useKC } from "@/lib/kc-store";

export const Route = createFileRoute("/bank")({
  head: () => pageHead("Bank Details", "The bank account where your procurement payments are credited."),
  component: Bank,
});

function Bank() {
  useLang();
  const kc = useKC();
  const isDemo = kc.uid === DEMO_UID;
  const [v, setV] = useState({ an: "", an2: "", ifsc: "" });
  const [err, setErr] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const x: Record<string, string> = {};
    if (!/^\d{9,18}$/.test(v.an)) x.an = "Enter a 9–18 digit account number.";
    if (v.an2 !== v.an) x.an2 = "Account numbers do not match.";
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(v.ifsc.toUpperCase())) x.ifsc = "Enter a valid 11-character IFSC (e.g. SBIN0001234).";
    setErr(x);
    if (Object.keys(x).length) return;
    setV({ an: "", an2: "", ifsc: "" }); setSent(true);
    toast.success(t("Bank details change request submitted for demo verification"));
  };
  const E = ({ k }: { k: string }) => err[k] ? <p role="alert" className="text-sm font-medium text-destructive">{t(err[k])}</p> : null;
  return (
    <AppShell>
      <PageHeader title={t("Bank Details")} subtitle={t("Payments are credited directly to this account")} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle icon={<Landmark className="size-5" />} action={<StatusBadge tone={isDemo ? "success" : "neutral"}>{t(isDemo ? bank.status : "Not linked")}</StatusBadge>}>{t("Linked account")}</CardTitle>
          {isDemo ? (<>
          <InfoRow label={t("Account holder")} value={bank.holder} />
          <InfoRow label={t("Bank")} value={bank.bank} />
          <InfoRow label={t("Branch")} value={bank.branch} />
          <InfoRow label={t("Account number")} value={bank.account} />
          <InfoRow label={t("IFSC")} value={bank.ifsc} />
          <InfoRow label={t("Account type")} value={bank.type} />
          </>) : (
            <Alert tone="info" title={t("No bank account linked yet")}>{t(`${kc.profile.name}, submit your account details for demo verification. Nothing is stored or sent.`)}</Alert>
          )}
        </Card>
        <Card>
          <CardTitle>{t("Request a change")}</CardTitle>
          <form className="space-y-4" onSubmit={submit} noValidate>
            <Field label={t("Account number")} htmlFor="an"><Input id="an" inputMode="numeric" value={v.an} onChange={(e) => setV({ ...v, an: e.target.value.trim() })} /><E k="an" /></Field>
            <Field label={t("Confirm account number")} htmlFor="an2"><Input id="an2" inputMode="numeric" value={v.an2} onChange={(e) => setV({ ...v, an2: e.target.value.trim() })} /><E k="an2" /></Field>
            <Field label={t("IFSC code")} htmlFor="if"><Input id="if" placeholder={t("e.g. SBIN0001234")} value={v.ifsc} onChange={(e) => setV({ ...v, ifsc: e.target.value.trim() })} /><E k="ifsc" /></Field>
            {sent && <Alert tone="success" title={t("Request submitted (demo)")}>{t("Pending demo verification. Nothing is sent or stored — this is fictional.")}</Alert>}
            <Alert tone="warning" title={t("Changes need re-verification")}>{t("Payments may be delayed until the new account is verified.")}</Alert>
            <Button type="submit" className="w-full">{t("Submit for verification")}</Button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
