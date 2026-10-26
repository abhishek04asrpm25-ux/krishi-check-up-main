import { t, useLang } from "@/lib/i18n";
import { Field, Select } from "@/components/kc/ui";
import { STATES, districtsOf } from "@/lib/locations";

/** Dependent State → District dropdowns (shared demo dataset).
 *  Changing the state always resets the district. */
export function StateDistrictSelect({
  state, district, onState, onDistrict, stateError, districtError, idPrefix = "loc",
}: {
  state: string;
  district: string;
  onState: (state: string) => void;
  onDistrict: (district: string) => void;
  stateError?: string | undefined;
  districtError?: string | undefined;
  idPrefix?: string;
}) {
  useLang();
  return (
    <>
      <Field label={t("State")} htmlFor={`${idPrefix}-state`}>
        <Select id={`${idPrefix}-state`} value={state} onChange={(e) => { onState(e.target.value); onDistrict(""); }}>
          <option value="">{t("Select state")}</option>
          {STATES.map((s) => <option key={s} value={s}>{t(s)}</option>)}
        </Select>
        {stateError ? <p role="alert" className="text-sm font-medium text-destructive">{t(stateError)}</p> : null}
      </Field>
      <Field label={t("District")} htmlFor={`${idPrefix}-district`}>
        <Select id={`${idPrefix}-district`} value={district} onChange={(e) => onDistrict(e.target.value)} disabled={!state}>
          <option value="">{state ? t("Select district") : t("Select a state first")}</option>
          {districtsOf(state).map((d) => <option key={d} value={d}>{t(d)}</option>)}
        </Select>
        {districtError ? <p role="alert" className="text-sm font-medium text-destructive">{t(districtError)}</p> : null}
      </Field>
    </>
  );
}
