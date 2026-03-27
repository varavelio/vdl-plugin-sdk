/// <reference types="node" />

import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "tsdown";

const currentFilePath = fileURLToPath(import.meta.url);
const workspaceRootPath = path.dirname(currentFilePath);
const utilsRootPath = path.join(workspaceRootPath, "src", "utils");

function getUtilityCategoryEntries() {
  return readdirSync(utilsRootPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => `./src/utils/${entry.name}/index.ts`)
    .filter((entryPath) => {
      return existsSync(path.join(workspaceRootPath, entryPath.slice(2)));
    })
    .sort();
}

export default defineConfig({
  entry: [
    "./src/core/index.ts",
    "./src/testing/index.ts",
    ...getUtilityCategoryEntries(),
  ],
  format: ["esm", "cjs"],
  unbundle: true,
  platform: "neutral",
  target: "es2015",
  dts: true,
  clean: true,
  sourcemap: true,
});
