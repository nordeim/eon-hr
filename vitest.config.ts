import { defineConfig } from "vitest/config";
import path from "node:path";

// Unit-test layer for the pure domain seams (db-path resolution, auth
// crypto/session, money & date utils, design tokens, validation, and
// the session-5..52 parity recipe pins). Browser/E2E coverage lives in
// tests/e2e/*.spec.ts (Playwright — never picked up by this config,
// which matches *.test.ts only) plus scripts/smoke-test.sh.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
});
