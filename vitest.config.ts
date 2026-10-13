import { defineConfig } from "vitest/config";

/** Vitest project configuration for unit tests under `src`. */
export default defineConfig({
  test: {
    exclude: ["**/node_modules/**", "**/dist/**", "docs/dist/**", "site/**"],
    include: ["src/**/*.test.ts"],
  },
});
