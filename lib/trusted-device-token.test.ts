import { describe, it, expect } from "vitest";
import {
  parseTrustedDeviceToken,
  formatTrustedDeviceToken,
  extractCookieValue,
} from "./trusted-device-token";

describe("parseTrustedDeviceToken", () => {
  it("mem-parse token valid jadi deviceId dan secret", () => {
    const result = parseTrustedDeviceToken("abc123.def456secret");
    expect(result).toEqual({ deviceId: "abc123", secret: "def456secret" });
  });

  it("menangani secret yang mengandung titik tambahan", () => {
    const result = parseTrustedDeviceToken("abc123.def.456");
    // Split hanya di titik PERTAMA — sisanya jadi bagian secret.
    expect(result).toEqual({ deviceId: "abc123", secret: "def.456" });
  });

  it("return null untuk input null/undefined/kosong", () => {
    expect(parseTrustedDeviceToken(null)).toBeNull();
    expect(parseTrustedDeviceToken(undefined)).toBeNull();
    expect(parseTrustedDeviceToken("")).toBeNull();
  });

  it("return null kalau tidak ada titik pemisah sama sekali", () => {
    expect(parseTrustedDeviceToken("tidakadatitik")).toBeNull();
  });

  it("return null kalau deviceId atau secret kosong", () => {
    expect(parseTrustedDeviceToken(".secretsaja")).toBeNull();
    expect(parseTrustedDeviceToken("deviceidsaja.")).toBeNull();
  });
});

describe("formatTrustedDeviceToken round-trip", () => {
  it("hasil format bisa di-parse ulang jadi nilai yang sama", () => {
    const token = formatTrustedDeviceToken("device-xyz", "supersecret123");
    const parsed = parseTrustedDeviceToken(token);
    expect(parsed).toEqual({ deviceId: "device-xyz", secret: "supersecret123" });
  });
});

describe("extractCookieValue", () => {
  it("mengambil nilai cookie yang ada di antara beberapa cookie lain", () => {
    const header = "session=xyz; aksa_trusted_device=abc.def; theme=dark";
    expect(extractCookieValue(header, "aksa_trusted_device")).toBe("abc.def");
  });

  it("return null kalau cookie tidak ada", () => {
    const header = "session=xyz; theme=dark";
    expect(extractCookieValue(header, "aksa_trusted_device")).toBeNull();
  });

  it("return null kalau header null", () => {
    expect(extractCookieValue(null, "aksa_trusted_device")).toBeNull();
  });

  it("mendekode nilai yang di-encode URI", () => {
    const header = "aksa_trusted_device=abc%2Edef";
    expect(extractCookieValue(header, "aksa_trusted_device")).toBe("abc.def");
  });

  it("tidak salah cocok dengan nama cookie yang jadi substring", () => {
    const header = "aksa_trusted_device_v2=notreal; aksa_trusted_device=real";
    expect(extractCookieValue(header, "aksa_trusted_device")).toBe("real");
  });
});
