import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/*.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  platform: "neutral",
  target: "es2015",
  sourcemap: true,
});
