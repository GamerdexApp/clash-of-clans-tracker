import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    include: ["tests/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@/service": path.resolve(import.meta.dirname, "src/lib/services"),
      "@/comps": path.resolve(import.meta.dirname, "src/components"),
      "@/lib": path.resolve(import.meta.dirname, "src/lib"),
      "@/types": path.resolve(import.meta.dirname, "src/types"),
      "@/data": path.resolve(import.meta.dirname, "src/data"),
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
});
