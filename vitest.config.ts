import { defineConfig } from "vitest/config";
import path from "path";

/**
 * vitest.config.ts
 * docs/17-testing-deployment.md §2 — target: fungsi murni (validation
 * schema, service logic yang tidak bergantung Next.js request context).
 * Alias @/ disamakan dengan tsconfig.json supaya import di file test
 * konsisten dengan kode aplikasi.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
