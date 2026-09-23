import path from "node:path";
import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

/**
 * Visual tests drive a real Chromium against a live Vite server, so they need
 * a node environment, a long timeout, and a single worker — parallel workers
 * would fight over the shared browser and make captures flaky.
 */
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { "@": path.resolve(process.cwd(), "./src") },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["tests/visual/**/*.spec.ts"],
    globalSetup: ["tests/visual/support/globalSetup.ts"],
    testTimeout: 60_000,
    hookTimeout: 60_000,
    fileParallelism: false,
    pool: "forks",
    poolOptions: { forks: { singleFork: true } },
  },
});
