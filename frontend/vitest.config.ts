import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests for the plain TypeScript in src/lib (tracking, cookies, the
// inline pixel bootstrap). jsdom gives them window, document and cookies.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts"],
  },
});
