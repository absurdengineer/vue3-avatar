import path from "node:path";
import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./src"),
      "vue3-avatar": path.resolve(process.cwd(), "./src/entry.esm.ts"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    // Visual tests drive a real browser and are run separately by
    // `npm run test:visual`; they would otherwise fail under jsdom.
    exclude: ["**/node_modules/**", "**/dist/**", "tests/visual/**"],
  },
});
