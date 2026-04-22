#!/usr/bin/env node

/**
 * VDL Plugin CLI
 *
 * Provides command-line utilities for building and type-checking VDL plugins.
 * Uses esbuild to bundle plugins into a single CommonJS file and tsc for type-checking.
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import { isAbsolute, resolve } from "node:path";
import * as esbuild from "esbuild";

const require = createRequire(import.meta.url);
const args = process.argv.slice(2);
const command = args[0];

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";

const log = {
  info: (msg) => console.log(`${CYAN}[i]${RESET} ${msg}`),
  ok: (msg) => console.log(`${GREEN}[✓]${RESET} ${msg}`),
  error: (msg) => console.error(`${RED}[✗]${RESET} ${msg}`),
};

/**
 * esbuild plugin to universally handle `?raw` imports.
 *
 * Intercepts any import path ending in `?raw`, resolves its true absolute path
 * on the filesystem, and forces esbuild to load its content strictly as plaintext
 * (using the 'text' loader). This allows plugins to easily bundle raw files like
 * templates, SQL queries, or HTML without additional loaders.
 *
 * @type {import('esbuild').Plugin}
 */
const universalRawPlugin = {
  name: "universal-raw",
  setup(build) {
    build.onResolve({ filter: /\?raw$/ }, (args) => {
      const cleanPath = args.path.replace(/\?raw$/, "");
      const absolutePath = isAbsolute(cleanPath)
        ? cleanPath
        : resolve(args.resolveDir, cleanPath);

      return {
        path: absolutePath,
        namespace: "raw-file",
      };
    });

    build.onLoad({ filter: /.*/, namespace: "raw-file" }, (args) => {
      const text = fs.readFileSync(args.path, "utf8");
      return {
        contents: text,
        loader: "text",
      };
    });
  },
};

/**
 * Prints the available CLI commands and options to standard output.
 */
function printHelp() {
  console.log(`Usage: vdl-plugin <command> [options]

Commands:
  check          Run TypeScript type checks without emitting files
  build          Bundle the plugin into a single file
                 Options:
                   --entry <path>   Entry file (default: src/index.ts)
                   --out <path>     Output file (default: dist/index.js)`);
}

/**
 * Executes a full TypeScript type check across the plugin's source code and tests.
 *
 * Uses the locally installed `tsc` compiler via `node:child_process` and builds
 * the project based on the top-level `tsconfig.json`. This acts as a strict verification
 * step before compiling or publishing a plugin.
 */
function runCheck() {
  log.info("Running TypeScript type checks...");

  try {
    const tscPath = require.resolve("typescript/bin/tsc");

    // The "-b" flag tells tsc to build the project with all it's sub-projects
    // which are the plugin itself and the test suite.
    execFileSync(process.execPath, [tscPath, "-b", "tsconfig.json"], {
      stdio: "inherit",
    });

    log.ok("Type checks completed successfully.");
  } catch {
    log.error("Type checks failed.");
    process.exit(1);
  }
}

/**
 * Compiles and bundles the VDL plugin using esbuild.
 *
 * Takes a specified entry point (defaulting to `src/index.ts`), applies standard
 * bundling configuration (CommonJS, ES2015, tree shaking), injects the universal
 * `?raw` plugin, and outputs a self-contained Javascript bundle at the specified
 * output path (defaulting to `dist/index.js`).
 *
 * @param {string} entryPath - The relative path to the entry file.
 * @param {string} outPath - The relative path to the output bundle file.
 * @returns {Promise<void>}
 */
async function runBuild(entryPath, outPath) {
  log.info(`Building VDL plugin from ${entryPath} to ${outPath}...`);

  try {
    await esbuild.build({
      entryPoints: [resolve(process.cwd(), entryPath)],
      outfile: resolve(process.cwd(), outPath),
      format: "cjs",
      platform: "neutral",
      target: "es2015",
      bundle: true,
      minify: false,
      keepNames: true,
      treeShaking: true,
      plugins: [universalRawPlugin],
    });

    log.ok(`Plugin built successfully at ${outPath}.`);
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
  let entry = "src/index.ts";
  let out = "dist/index.js";

  for (let i = 1; i < args.length; i++) {
    if (args[i] === "--entry" && args[i + 1]) {
      entry = args[i + 1];
      i++;
    } else if (args[i] === "--out" && args[i + 1]) {
      out = args[i + 1];
      i++;
    }
  }

  runBuild(entry, out);
} else {
  if (command) {
    log.error(`Unknown command: ${command}`);
  }
  printHelp();
  process.exit(1);
}
