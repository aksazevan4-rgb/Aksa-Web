import { describe, it, expect } from "vitest";
import { createApiKeySchema } from "./validation";

describe("createApiKeySchema", () => {
  it("menolak nama key kosong", () => {
    const result = createApiKeySchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("menolak nama key 1 karakter (minimal 2)", () => {
    const result = createApiKeySchema.safeParse({ name: "a" });
    expect(result.success).toBe(false);
  });

  it("menerima nama key yang valid", () => {
    const result = createApiKeySchema.safeParse({ name: "Portfolio bot" });
    expect(result.success).toBe(true);
  });
});
