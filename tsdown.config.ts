import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/index.ts"],
  format: ["esm", "cjs"],
  platform: "neutral",
  target: "es2015",
  dts: true,
  clean: true,
  sourcemap: true,
});
