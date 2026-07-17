import { describe, it, expect } from "vitest";
import { hashToPercentBucket, isInRollout } from "./feature-flag-rollout";

describe("hashToPercentBucket", () => {
  it("selalu menghasilkan angka 0-99", () => {
    for (const input of ["user-1", "user-2", "abc", "", "some-long-user-id-string"]) {
      const bucket = hashToPercentBucket(input);
      expect(bucket).toBeGreaterThanOrEqual(0);
      expect(bucket).toBeLessThan(100);
    }
  });

  it("deterministik — input yang sama selalu hasil yang sama", () => {
    expect(hashToPercentBucket("user-123")).toBe(hashToPercentBucket("user-123"));
  });

  it("input berbeda cenderung menghasilkan bucket berbeda", () => {
    // Tidak dijamin selalu beda (hash collision mungkin), tapi untuk 5
    // input acak yang jelas berbeda, seharusnya tidak semuanya sama.
    const buckets = new Set(
      ["user-a", "user-b", "user-c", "user-d", "user-e"].map(hashToPercentBucket)
    );
    expect(buckets.size).toBeGreaterThan(1);
  });
});

describe("isInRollout", () => {
  it("selalu true kalau rolloutPercentage 100", () => {
    expect(isInRollout("any-user", "flag-x", 100)).toBe(true);
  });

  it("selalu false kalau rolloutPercentage 0", () => {
    expect(isInRollout("any-user", "flag-x", 0)).toBe(false);
  });

  it("konsisten untuk user & flag yang sama di rollout parsial", () => {
    const first = isInRollout("user-42", "flag-y", 50);
    const second = isInRollout("user-42", "flag-y", 50);
    expect(first).toBe(second);
  });
});
