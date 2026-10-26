import { describe, it, expect } from "vitest";
import { journey } from "@/lib/kc-store";
describe("journey", () => {
  it("falls back to 20 km / 15 min wait for an unknown centre", () => {
    const j = journey({ centreId: "nope", slot: 600, qty: 20 });
    expect(j.distanceKm).toBe(20);
    expect(j.wait).toBe(15);
  });
});
