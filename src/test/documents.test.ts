import { describe, expect, it } from "vitest";
import { docRows } from "@/lib/kc-store";

const base = {
  v: 2 as const, uid: "user-new", farmerId: "t", crops: [], bookings: [], notices: [],
  profile: { name: "", mobile: "", email: "", village: "", block: "", district: "", state: "", language: "", preferredCrop: "", cropPrefs: [] },
};

describe("documents", () => {
  it("a newly registered farmer starts with every document missing", () => {
    expect(docRows(base).every((d) => d.status === "Missing")).toBe(true);
  });
  it("an uploaded document shows as pending review", () => {
    const rows = docRows({ ...base, docUploads: { "Aadhaar card": "2026-10-10T05:00:00Z" } });
    expect(rows.find((d) => d.name === "Aadhaar card")?.status).toBe("Pending review");
  });
});
