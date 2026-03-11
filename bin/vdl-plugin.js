#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import * as esbuild from "esbuild";

const require = createRequire(import.meta.url);
const args = process.argv.slice(2);
const command = args[0];
const flags = new Set(args.slice(1));

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";

const log = {
  info: (msg) => console.log(`${CYAN}[i]${RESET} ${msg}`),
  ok: (msg) => console.log(`${GREEN}[✓]${RESET} ${msg}`),
  error: (msg) => console.error(`${RED}[✗]${RESET} ${msg}`),
};

function printHelp() {
  console.log(`Usage: vdl-plugin <command> [options]

Commands:
  check          Run TypeScript type checks without emitting files
  build          Bundle the plugin from src/index.ts into dist/index.js

Build options:
  --no-minify    Disable minification (minification is enabled by default)`);
}

function runCheck() {
  log.info("Running TypeScript type checks...");

  try {
    const tscPath = require.resolve("typescript/bin/tsc");

    log.info("Checking production code...");
    execFileSync(
      process.execPath,
      [tscPath, "-p", "tsconfig.json", "--noEmit"],
      { stdio: "inherit" },
    );

    const vitestTsConfig = resolve(process.cwd(), "tsconfig.vitest.json");
    if (existsSync(vitestTsConfig)) {
      log.info("Checking test code...");
      execFileSync(
        process.execPath,
        [tscPath, "-p", "tsconfig.vitest.json", "--noEmit"],
        { stdio: "inherit" },
      );
    }

    log.ok("Type checks completed successfully.");
  } catch {
    log.error("Type checks failed.");
    process.exit(1);
  }
}

function runBuild() {
  const minify = !flags.has("--no-minify");

  log.info(`Building VDL plugin${minify ? "" : " (minification disabled)"}...`);

  try {
    esbuild.buildSync({
      entryPoints: [resolve(process.cwd(), "src/index.ts")],
      outfile: resolve(process.cwd(), "dist/index.js"),
      format: "cjs",
      platform: "neutral",
      target: "es2015",
      bundle: true,
      minify,
      treeShaking: true,
    });

    log.ok("Plugin built successfully at dist/index.js.");
  } catch (error) {
    log.error("Failed to build the plugin.");
    if (error instanceof Error && error.message) {
      log.error(error.message);
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
    log.error(`Unknown command: ${command}`);
  }
  printHelp();
  process.exit(1);
}
