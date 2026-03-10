#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import * as esbuild from "esbuild";

const require = createRequire(import.meta.url);
const command = process.argv[2];

function printHelp() {
  console.log(`Usage: vdl-plugin <command>

Commands:
  check   Run TypeScript type checks without emitting files
  build   Bundle the plugin from src/index.ts into dist/index.js`);
}

function runCheck() {
  console.log("Running TypeScript type checks...");

  try {
    const tscPath = require.resolve("typescript/bin/tsc");
    execFileSync(process.execPath, [tscPath, "--noEmit"], { stdio: "inherit" });
    console.log("Type checks completed successfully.");
  } catch {
    process.exit(1);
  }
}

function runBuild() {
  console.log("Building VDL plugin...");

  try {
    esbuild.buildSync({
      entryPoints: [resolve(process.cwd(), "src/index.ts")],
      bundle: true,
      outfile: resolve(process.cwd(), "dist/index.js"),
      format: "cjs",
      target: "es2015",
      platform: "neutral",
      minify: true,
      treeShaking: true,
    });

    console.log("Plugin built successfully at dist/index.js.");
  } catch (error) {
    console.error("Failed to build the plugin.");
    if (error instanceof Error && error.message) {
      console.error(error.message);
    }
    process.exit(1);
  }
}

if (command === "check") {
  runCheck();
} else if (command === "build") {
  runBuild();
} else {
  if (command) {
    console.error(`Unknown command: ${command}`);
  }
  printHelp();
  process.exit(1);
}
