import { describe, it, expect } from "vitest";
import { confirmEnrollmentSchema } from "./validation";

describe("confirmEnrollmentSchema", () => {
  it("menolak kode yang bukan 6 digit angka", () => {
    expect(confirmEnrollmentSchema.safeParse({ code: "12345" }).success).toBe(false);
    expect(confirmEnrollmentSchema.safeParse({ code: "abcdef" }).success).toBe(false);
    expect(confirmEnrollmentSchema.safeParse({ code: "1234567" }).success).toBe(false);
  });

  it("menerima kode 6 digit angka", () => {
    expect(confirmEnrollmentSchema.safeParse({ code: "123456" }).success).toBe(true);
  });
});
