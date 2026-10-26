import { t, useLang } from "@/lib/i18n";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2, Wheat } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/kc/AppShell";
import { Alert, Button, Card, CardTitle, DataTable, Field, Input, PageHeader, Select } from "@/components/kc/ui";
import { CROPS, deleteCrop, getCrop, inr, saveCrop, useKC, type CropEntry } from "@/lib/kc-store";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/crops")({
  head: () => pageHead("Crop Details", "Crops, area and expected yield registered for procurement."),
  component: Crops,
});

const SEASONS = ["Rabi 2025–26", "Kharif 2026", "Rabi 2026–27"];
type Draft = { crop: string; variety: string; areaAcres: string; season: string; expectedQtl: string };
const blank: Draft = { crop: "", variety: "", areaAcres: "", season: SEASONS[0]!, expectedQtl: "" };

function Crops() {
  useLang();
  const s = useKC();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const totalArea = s.crops.reduce((a, c) => a + c.areaAcres, 0);

  const open = (c?: CropEntry) => {
    setErrors({});
    setEditingId(c?.id);
    setDraft(c ? { crop: c.crop, variety: c.variety, areaAcres: String(c.areaAcres), season: c.season, expectedQtl: String(c.expectedQtl) } : blank);
  };
  const upd = (k: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const v = e.target.value;
    setDraft((d) => d && { ...d, [k]: v, ...(k === "crop" && !d.variety ? { variety: getCrop(v)?.variety ?? "" } : {}) });
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    const r = saveCrop({ crop: draft.crop, variety: draft.variety, areaAcres: Number(draft.areaAcres), season: draft.season, expectedQtl: Number(draft.expectedQtl) }, editingId);
    if (!r.ok) { setErrors(r.errors); return; }
    toast.success(t(editingId ? "Crop updated (demo)" : `${draft.crop} added to your crops (demo)`));
    setDraft(null); setEditingId(undefined);
  };
  const remove = (c: CropEntry) => {
    if (!window.confirm(t(`Remove ${c.crop} (${c.season}) from your crops?`))) return;
    deleteCrop(c.id);
    toast.success(t(`${c.crop} removed`));
  };
  const err = (k: string) => errors[k] ? <p role="alert" className="text-sm font-medium text-destructive">{t(errors[k])}</p> : null;

  return (
    <AppShell>
      <PageHeader title={t("Crop Details")} subtitle={t(`Total land: ${totalArea ? `${totalArea} acres` : "—"} · ${s.crops.length} crop${s.crops.length === 1 ? "" : "s"}`)}
        action={!draft && <Button onClick={() => open()}><Plus className="size-4" />{t("Add crop")}</Button>} />

      {draft && (
        <Card className="mb-6 max-w-2xl p-6">
          <CardTitle>{t(editingId ? "Edit crop" : "Add crop")}</CardTitle>
          <form noValidate onSubmit={submit} className="mt-2 grid gap-4 sm:grid-cols-2">
            {errors.form && <div className="sm:col-span-2"><Alert tone="danger" title={t(errors.form)} /></div>}
            <Field label={t("Crop")} htmlFor="cr">
              <Select id="cr" value={draft.crop} onChange={upd("crop")}>
                <option value="">{t("Select crop")}</option>
                {CROPS.map((c) => <option key={c.crop} value={c.crop}>{t(c.crop)}</option>)}
              </Select>{t(err("crop"))}
            </Field>
            <Field label={t("Variety")} htmlFor="va"><Input id="va" value={draft.variety} onChange={upd("variety")} />{t(err("variety"))}</Field>
            <Field label={t("Area (acres)")} htmlFor="ar"><Input id="ar" inputMode="decimal" value={draft.areaAcres} onChange={upd("areaAcres")} />{t(err("areaAcres"))}</Field>
            <Field label={t("Season")} htmlFor="se">
              <Select id="se" value={draft.season} onChange={upd("season")}>{SEASONS.map((x) => <option key={x}>{t(x)}</option>)}</Select>{t(err("season"))}
            </Field>
            <Field label={t("Expected yield (quintals)")} htmlFor="ex"><Input id="ex" inputMode="decimal" value={draft.expectedQtl} onChange={upd("expectedQtl")} />{t(err("expectedQtl"))}</Field>
            <div className="flex gap-3 sm:col-span-2">
              <Button type="submit">{t(editingId ? "Save changes" : "Save crop")}</Button>
              <Button type="button" variant="outline" onClick={() => { setDraft(null); setEditingId(undefined); }}>{t("Cancel")}</Button>
            </div>
          </form>
        </Card>
      )}

      {s.crops.length === 0 ? (
        <Alert tone="info" title={t("No crops added yet")}>{t("Use “Add crop” to register what you grow. Your crops are saved only in this browser for this demo account.")}</Alert>
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            {s.crops.map((c) => (
              <Card key={c.id}>
                <div className="flex items-start justify-between">
                  <span className="grid size-11 place-items-center rounded-xl bg-warning-soft text-warning-foreground"><Wheat className="size-5" /></span>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => open(c)} aria-label={t(`Edit ${c.crop}`)} className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-secondary"><Pencil className="size-4" /></button>
                    <button type="button" onClick={() => remove(c)} aria-label={t(`Delete ${c.crop}`)} className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-secondary"><Trash2 className="size-4" /></button>
                  </div>
                </div>
                <p className="mt-3 font-display text-lg font-bold">{t(c.crop)}</p>
                <p className="text-sm text-muted-foreground">{t(c.variety)} · {t(c.season)}</p>
                <p className="mt-3 text-sm">{t("Expected")}{" "}<span className="font-semibold">{t(c.expectedQtl)} {t("qtl")}</span></p>
              </Card>
            ))}
          </div>
          <DataTable head={["Crop", "Variety", "Area", "Season", "Expected", "MSP"]}
            rows={s.crops.map((c) => [<span className="font-semibold">{t(c.crop)}</span>, c.variety, t("{0} acres", c.areaAcres), c.season, `${c.expectedQtl} qtl`, `${inr(getCrop(c.crop)?.msp ?? 0)} / qtl`])} />
        </>
      )}
    </AppShell>
  );
}
