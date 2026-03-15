import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const currentFilePath = fileURLToPath(import.meta.url);
const gojaDirectoryPath = path.dirname(currentFilePath);
const goRunnerDirectoryPath = path.join(gojaDirectoryPath, "go");
const testEntryFilePath = path.join(gojaDirectoryPath, "test.ts");

/**
 * Bundles the TypeScript smoke test into a single self-executing script.
 *
 * Goja does not need a Node-style module system for this check. Bundling to a
 * single IIFE keeps the Go runner tiny and makes the execution environment very
 * explicit.
 */
async function bundleSmokeTest() {
  const buildResult = await build({
    entryPoints: [testEntryFilePath],
    bundle: true,
    format: "iife",
    platform: "neutral",
    target: ["es2015"],
    write: false,
    logLevel: "silent",
  });

  const bundledFile = buildResult.outputFiles[0];

  if (!bundledFile) {
    throw new Error("esbuild did not produce a bundled smoke test");
  }

  return bundledFile.text;
}

/**
 * Executes the bundled script inside the Go-based Goja runner.
 *
 * The runner prints `ok` only when the script finishes successfully and calls
 * the special `__goja_report_ok__()` callback. Any crash, timeout, or missing
 * success signal is treated as a failure.
 */
function runBundledSmokeTest(bundledScript) {
  const result = spawnSync("go", ["run", "."], {
    cwd: goRunnerDirectoryPath,
    input: bundledScript,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });

  if (result.error) {
    throw result.error;
  }

  const stdout = result.stdout.trim();
  const stderr = result.stderr.trim();

  if (result.status !== 0) {
    throw new Error(
      stderr || stdout || `go runner exited with code ${result.status}`,
    );
  }

  if (stdout !== "ok") {
    throw new Error(`unexpected Goja runner output: ${stdout || "<empty>"}`);
  }
}

async function main() {
  const bundledScript = await bundleSmokeTest();
  runBundledSmokeTest(bundledScript);
  process.stdout.write("e2e: goja ok\n");
}

await main();
