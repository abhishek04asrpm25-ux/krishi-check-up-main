import { describe, expect, it } from "vitest";
import { resolveDraft, validateBooking } from "@/lib/kc-store";

const s = {
  v: 2 as const, uid: "t", farmerId: "t", crops: [], bookings: [], notices: [],
  profile: { name: "", mobile: "", email: "", village: "", block: "", district: "", state: "", language: "", preferredCrop: "Wheat", cropPrefs: ["Wheat", "Paddy"] },
};

describe("centre selection", () => {
  it("does not auto-select a crop when the farmer has no saved preference", () => {
    const n = { ...s, profile: { ...s.profile, preferredCrop: "", cropPrefs: [] } };
    expect(resolveDraft(n, { centre: "gohana-3" })).toMatchObject({ centreId: "gohana-3", crop: "" });
  });
  it("ignores a saved preference the centre doesn't procure", () => {
    expect(resolveDraft(s, { centre: "rai-coop" }).crop).toBe("Wheat");
    expect(resolveDraft({ ...s, profile: { ...s.profile, preferredCrop: "Paddy" } }, { centre: "gohana-3" })).toMatchObject({ centreId: "gohana-3", crop: "" });
  });
  it("drops a closed centre", () => {
    expect(resolveDraft(s, { centre: "rai-coop" }).centreId).toBe("");
  });
  it("drops an unknown centre id", () => {
    expect(resolveDraft(s, { centre: "nope" }).centreId).toBe("");
  });
  it("picks a crop the chosen centre supports", () => {
    const d = resolveDraft(s, { centre: "gohana-3" });
    expect(d).toMatchObject({ centreId: "gohana-3", crop: "Wheat" });
  });
  it("clears the centre when the crop is unsupported there", () => {
    expect(resolveDraft(s, { centre: "kharkhoda", crop: "Paddy" }).centreId).toBe("");
  });
  it("drops an invalid saved slot", () => {
    expect(resolveDraft(s, { centre: "ganaur", date: "2026-10-12", slot: 999 }).slot).toBeUndefined();
  });
  it("rejects booking a crop the centre doesn't procure", () => {
    expect(validateBooking(s, { crop: "Paddy", qty: 10, centreId: "gohana-3", date: "2026-10-12", slot: 510 }).centreId).toBeTruthy();
  });
});
