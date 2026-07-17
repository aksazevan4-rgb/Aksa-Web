import { describe, it, expect } from "vitest";
import { geoRestrictionSchema, utmParamsSchema, bulkLinkIdsSchema } from "./validation";

describe("geoRestrictionSchema", () => {
  it("menerima mode allow dengan kode negara 2 huruf kapital", () => {
    const result = geoRestrictionSchema.safeParse({ mode: "allow", countries: ["ID", "SG", "MY"] });
    expect(result.success).toBe(true);
  });

  it("menolak kode negara yang bukan 2 huruf kapital", () => {
    const result = geoRestrictionSchema.safeParse({ mode: "block", countries: ["indonesia"] });
    expect(result.success).toBe(false);
  });

  it("menolak mode di luar allow/block", () => {
    const result = geoRestrictionSchema.safeParse({ mode: "deny", countries: ["ID"] });
    expect(result.success).toBe(false);
  });
});

describe("utmParamsSchema", () => {
  it("menerima objek UTM kosong (semua field opsional)", () => {
    const result = utmParamsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("menerima source/medium/campaign yang valid", () => {
    const result = utmParamsSchema.safeParse({
      source: "instagram",
      medium: "bio-link",
      campaign: "launch-2026",
    });
    expect(result.success).toBe(true);
  });
});

describe("bulkLinkIdsSchema", () => {
  it("menolak array kosong (docs/08 §5 — bulk action butuh minimal 1 id)", () => {
    const result = bulkLinkIdsSchema.safeParse({ linkIds: [] });
    expect(result.success).toBe(false);
  });

  it("menolak lebih dari 200 id sekaligus", () => {
    const ids = Array.from({ length: 201 }, (_, i) => `clx${i.toString().padStart(22, "0")}`);
    const result = bulkLinkIdsSchema.safeParse({ linkIds: ids });
    expect(result.success).toBe(false);
  });
});
