import { t, useLang } from "@/lib/i18n";
import { createFileRoute } from "@tanstack/react-router";
import { FileText, Upload } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/kc/AppShell";
import { Button, Card, PageHeader, Progress, StatusBadge } from "@/components/kc/ui";
import { documents } from "@/lib/mock-data";
import { pageHead } from "@/lib/head";
import { docRows, markDocUploaded, useKC } from "@/lib/kc-store";

export const Route = createFileRoute("/documents")({
  head: () => pageHead("Documents", "Upload and track verification of your procurement documents."),
  component: Documents,
});

function Documents() {
  useLang();
  const kc = useKC();
  const docs = docRows(kc);
  const input = useRef<HTMLInputElement>(null);
  const target = useRef<string>("");
  const pick = (name: string) => { target.current = name; input.current?.click(); };
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; e.target.value = "";
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error(t("File must be under 5 MB.")); return; }
    markDocUploaded(target.current);
    toast.success(t(`${f.name} uploaded for demo verification`));
  };
  const ok = docs.filter((d) => d.status === "Verified").length;
  return (
    <AppShell>
      <PageHeader title={t("Documents")} subtitle={t("Keep these ready before every procurement visit")} />
      <Card className="mb-6"><Progress value={Math.round((ok / docs.length) * 100)} label={t(`${ok} of ${docs.length} verified`)} /><p className="mt-2 text-xs text-muted-foreground">{t("Demo only — files stay in your browser and are not uploaded anywhere.")}</p></Card>
      <ul className="space-y-3">
        {docs.map((d) => (
          <li key={d.name} className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-2xl border bg-card p-4 shadow-card sm:grid-cols-[auto_minmax(0,1fr)_auto_auto]">
            <span className="grid size-11 place-items-center rounded-xl bg-secondary text-primary"><FileText className="size-5" /></span>
            <div className="min-w-0"><p className="truncate font-semibold">{t(d.name)}</p><p className="text-sm text-muted-foreground">{t("Updated")}{" "}{t(d.updated)}</p></div>
            <div className="col-start-2 sm:col-start-auto"><StatusBadge tone={d.tone}>{t(d.status)}</StatusBadge></div>
            <Button variant={d.status === "Missing" ? "primary" : "outline"} size="sm" onClick={() => pick(d.name)} className="col-start-2 justify-self-start sm:col-start-auto">
              <Upload className="size-4" />{t(d.status === "Missing" ? "Upload" : "Replace")}
            </Button>
          </li>
        ))}
      </ul>
      <input ref={input} type="file" accept=".pdf,image/*" className="hidden" onChange={onFile} />
    </AppShell>
  );
}
