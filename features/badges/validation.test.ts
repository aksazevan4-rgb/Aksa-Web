import { describe, it, expect } from "vitest";
import { createBadgeSchema, grantBadgeSchema, badgeRequirementSchema } from "./validation";

describe("createBadgeSchema", () => {
  it("menerima input badge yang valid", () => {
    const result = createBadgeSchema.safeParse({
      key: "early-supporter",
      name: "Early Supporter",
      description: "Bergabung di masa awal AKSA AboutMe.",
      category: "early-supporter",
      icon: "star",
      rarity: "RARE",
      isAnimated: false,
      isPurchasable: false,
    });
    expect(result.success).toBe(true);
  });

  it("menolak key yang mengandung huruf besar/spasi", () => {
    const result = createBadgeSchema.safeParse({
      key: "Early Supporter",
      name: "Early Supporter",
      description: "Bergabung di masa awal AKSA AboutMe.",
      category: "early-supporter",
      icon: "star",
    });
    expect(result.success).toBe(false);
  });

  it("menolak category di luar daftar BADGE_CATEGORIES", () => {
    const result = createBadgeSchema.safeParse({
      key: "mystery",
      name: "Mystery",
      description: "Kategori tidak dikenal.",
      category: "kategori-ngasal",
      icon: "star",
    });
    expect(result.success).toBe(false);
  });
});

describe("grantBadgeSchema", () => {
  it("menolak grant tanpa alasan (docs/10 §5, docs/14 §2)", () => {
    const result = grantBadgeSchema.safeParse({
      userId: "clx000000000000000000000",
      badgeId: "clx000000000000000000001",
      reason: "ok",
    });
    expect(result.success).toBe(false);
  });

  it("menerima grant dengan alasan yang cukup panjang", () => {
    const result = grantBadgeSchema.safeParse({
      userId: "clx000000000000000000000",
      badgeId: "clx000000000000000000001",
      reason: "Kontribusi laporan bug kritis di production.",
    });
    expect(result.success).toBe(true);
  });
});

describe("badgeRequirementSchema", () => {
  it("menerima tipe requirement yang dikenal", () => {
    const result = badgeRequirementSchema.safeParse({
      type: "linkClicksTotal",
      threshold: 1000,
    });
    expect(result.success).toBe(true);
  });

  it("menolak tipe requirement yang tidak terdaftar", () => {
    const result = badgeRequirementSchema.safeParse({
      type: "unknownRuleType",
      threshold: 1000,
    });
    expect(result.success).toBe(false);
  });
});
