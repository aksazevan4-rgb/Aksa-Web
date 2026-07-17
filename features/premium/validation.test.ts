import { describe, it, expect } from "vitest";
import { grantCreditsSchema } from "./validation";

describe("grantCreditsSchema", () => {
  it("menolak amount 0 atau negatif", () => {
    expect(
      grantCreditsSchema.safeParse({
        userId: "clx000000000000000000000",
        amount: 0,
        reason: "Bonus event ulang tahun",
      }).success
    ).toBe(false);

    expect(
      grantCreditsSchema.safeParse({
        userId: "clx000000000000000000000",
        amount: -50,
        reason: "Bonus event ulang tahun",
      }).success
    ).toBe(false);
  });

  it("menolak alasan yang terlalu pendek (docs/12 §4)", () => {
    const result = grantCreditsSchema.safeParse({
      userId: "clx000000000000000000000",
      amount: 100,
      reason: "ok",
    });
    expect(result.success).toBe(false);
  });

  it("menerima input yang valid", () => {
    const result = grantCreditsSchema.safeParse({
      userId: "clx000000000000000000000",
      amount: 500,
      reason: "Bonus event ulang tahun platform.",
    });
    expect(result.success).toBe(true);
  });
});
