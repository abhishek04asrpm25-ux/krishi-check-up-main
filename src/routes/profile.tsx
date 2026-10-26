import { t, useLang } from "@/lib/i18n";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Landmark, Wheat, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/kc/AppShell";
import { Alert, Button, Card, CardTitle, Field, InfoRow, Input, PageHeader, Select, StatusBadge } from "@/components/kc/ui";
import { farmer } from "@/lib/mock-data";
import { CROPS, DEMO_UID, docRows, resetDemo, updateProfile, useKC, type Profile as P } from "@/lib/kc-store";
import { normalizeMobile } from "@/lib/demo-auth";
import { StateDistrictSelect } from "@/components/kc/StateDistrictSelect";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/profile")({
  head: () => pageHead("Farmer Profile", "Your demo personal details and crop preferences."),
  component: Profile,
});

function validate(p: P) {
  const e: Record<string, string> = {};
  if (!p.name.trim()) e.name = "Enter your name.";
  if (!/^[6-9]\d{9}$/.test(normalizeMobile(p.mobile))) e.mobile = "Enter a valid 10-digit mobile number.";
  if (p.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) e.email = "Enter a valid email.";
  if (!p.village.trim()) e.village = "Enter your village.";
  if (!p.state) e.state = "Select your state.";
  if (!p.district) e.district = "Select your district.";
  if (p.preferredCrop && !p.cropPrefs.includes(p.preferredCrop)) e.preferredCrop = "Selected crop must be one of your crop preferences.";
  return e;
}

function Profile() {
  useLang();
  const s = useKC();
  const { profile } = s;
  const [edit, setEdit] = useState<P | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit) return;
    const errs = validate(edit);
    setErrors(errs);
    if (Object.keys(errs).length) { toast.error(t("Please fix the highlighted fields.")); return; }
    updateProfile({ ...edit, name: edit.name.trim() });
    setEdit(null);
    toast.success(t("Profile saved (demo)"));
  };
  const err = (k: string) => errors[k] ? <p role="alert" className="text-sm font-medium text-destructive">{t(errors[k])}</p> : null;
  const f = (k: keyof P) => ({ id: k, value: (edit?.[k] as string) ?? "", onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setEdit((p) => p && { ...p, [k]: e.target.value }) });

  return (
    <AppShell>
      <PageHeader title={t("Profile")} action={!edit && <Button variant="outline" onClick={() => { setEdit(profile); setErrors({}); }}>{t("Edit profile")}</Button>} />
      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-hero font-display text-xl font-bold text-primary-foreground">{t(profile.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase())}</span>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold">{t(profile.name)}</h2>
          <p className="text-sm text-muted-foreground">{t(s.farmerId)}{t(s.uid === DEMO_UID ? ` · ${farmer.category}` : "")}</p>
        </div>
        <StatusBadge tone="info">{t("Demo account")}</StatusBadge>
      </Card>

      {edit ? (
        <Card className="mt-6">
          <form onSubmit={save} noValidate className="grid gap-5 sm:grid-cols-2">
            <Field label={t("Full name")} htmlFor="name"><Input {...f("name")} />{t(err("name"))}</Field>
            <Field label={t("Mobile")} htmlFor="mobile"><Input {...f("mobile")} inputMode="tel" />{t(err("mobile"))}</Field>
            <Field label={t("Email (optional)")} htmlFor="email"><Input {...f("email")} type="email" />{t(err("email"))}</Field>
            <Field label={t("Language")} htmlFor="language"><Select {...f("language")}>{["Hindi", "English", "Punjabi", "Haryanvi"].map((l) => <option key={l}>{t(l)}</option>)}</Select></Field>
            <Field label={t("Village")} htmlFor="village"><Input {...f("village")} />{t(err("village"))}</Field>
            <Field label={t("Block")} htmlFor="block"><Input {...f("block")} /></Field>
            <StateDistrictSelect
              state={edit.state}
              district={edit.district}
              onState={(state) => setEdit((p) => p && { ...p, state, district: "" })}
              onDistrict={(district) => setEdit((p) => p && { ...p, district })}
              stateError={errors.state}
              districtError={errors.district}
              idPrefix="profile"
            />
            <fieldset className="sm:col-span-2">
              <legend className="mb-2 text-sm font-semibold">{t("Crop preferences")}</legend>
              <div className="flex flex-wrap gap-3">
                {CROPS.map((c) => (
                  <label key={c.crop} className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                    <input type="checkbox" className="size-4 accent-primary" checked={edit.cropPrefs.includes(c.crop)}
                      onChange={(e) => { const cropPrefs = e.target.checked ? [...edit.cropPrefs, c.crop] : edit.cropPrefs.filter((x) => x !== c.crop); setEdit({ ...edit, cropPrefs, preferredCrop: cropPrefs.includes(edit.preferredCrop) ? edit.preferredCrop : "" }); }} />
                    {t(c.crop)}
                  </label>
                ))}
              </div>
              {t(err("cropPrefs"))}
            </fieldset>
            <Field label={t("Selected crop for next sale")} htmlFor="preferredCrop">
              <Select {...f("preferredCrop")}><option value="">{t("Select crop")}</option>{edit.cropPrefs.map((c) => <option key={c}>{t(c)}</option>)}</Select>{t(err("preferredCrop"))}
            </Field>
            <div className="flex gap-3 sm:col-span-2">
              <Button type="submit">{t("Save changes")}</Button>
              <Button type="button" variant="outline" onClick={() => setEdit(null)}>{t("Cancel")}</Button>
            </div>
          </form>
        </Card>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardTitle>{t("Personal details")}</CardTitle>
            <InfoRow label={t("Mobile")} value={profile.mobile} />
            <InfoRow label={t("Email")} value={profile.email || "—"} />
            <InfoRow label={t("Aadhaar (fictional, masked)")} value={s.uid === DEMO_UID ? farmer.aadhaarMasked : "Not collected in demo"} />
            <InfoRow label={t("Language")} value={profile.language} />
          </Card>
          <Card>
            <CardTitle>{t("Address & crops")}</CardTitle>
            <InfoRow label={t("Village")} value={profile.village} />
            <InfoRow label={t("Block")} value={profile.block || "—"} />
            <InfoRow label={t("District")} value={profile.district} />
            <InfoRow label={t("State")} value={profile.state} />
            <InfoRow label={t("Crop preferences")} value={profile.cropPrefs.map((c) => t(c)).join(", ") || t("None yet")} />
            <InfoRow label={t("Selected crop")} value={t(profile.preferredCrop || "Not selected")} />
          </Card>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { to: "/documents" as const, icon: FileText, l: "Documents", d: `${docRows(s).filter((x) => x.status !== "Missing").length} of ${docRows(s).length} provided` },
          { to: "/bank" as const, icon: Landmark, l: "Bank details", d: "Sample data" },
          { to: "/crops" as const, icon: Wheat, l: "Crop details", d: `${profile.cropPrefs.length} crops preferred` },
        ].map(({ to, icon: Icon, l, d }) => (
          <Link key={to} to={to} className="flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-card hover:border-emerald">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary"><Icon className="size-5" /></span>
            <div className="min-w-0 flex-1"><p className="font-semibold">{t(l)}</p><p className="text-sm text-muted-foreground">{t(d)}</p></div>
            <ChevronRight className="size-5 text-muted-foreground" />
          </Link>
        ))}
      </div>
      <div className="mt-8">
        <Alert tone="info" title={t("Demo data on this device")}>{t("Bookings, statuses and preferences are saved only in this browser. No passwords or sensitive data are stored.")}</Alert>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => { if (window.confirm(t("Reset all demo bookings and preferences?"))) { resetDemo(); toast.success(t("Demo data reset")); } }}>{t("Reset demo data")}</Button>
      </div>
    </AppShell>
  );
}
