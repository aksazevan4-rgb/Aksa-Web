import { describe, it, expect } from "vitest";
import { submitTemplateReviewSchema } from "./validation";

describe("submitTemplateReviewSchema", () => {
  it("menolak rating di luar rentang 1-5", () => {
    expect(
      submitTemplateReviewSchema.safeParse({
        templateId: "clx000000000000000000000",
        rating: 0,
      }).success
    ).toBe(false);

    expect(
      submitTemplateReviewSchema.safeParse({
        templateId: "clx000000000000000000000",
        rating: 6,
      }).success
    ).toBe(false);
  });

  it("menerima rating valid tanpa komentar (komentar opsional)", () => {
    const result = submitTemplateReviewSchema.safeParse({
      templateId: "clx000000000000000000000",
      rating: 5,
    });
    expect(result.success).toBe(true);
  });

  it("menolak komentar lebih dari 280 karakter", () => {
    const result = submitTemplateReviewSchema.safeParse({
      templateId: "clx000000000000000000000",
      rating: 4,
      comment: "a".repeat(281),
    });
    expect(result.success).toBe(false);
  });
});
