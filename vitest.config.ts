import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    globals: false,
    // Integration tests spin up an in-memory MongoDB per file (see
    // tests/setup/db.ts) — that download/boot is slow the first time, so
    // give them more headroom than vitest's 5s default.
    testTimeout: 20_000,
    hookTimeout: 30_000,
  },
});
