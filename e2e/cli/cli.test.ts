import { execSync } from "node:child_process";
import fs from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cliPath = resolve(__dirname, "../../bin/vdl-plugin.js");
const fixtureDir = resolve(__dirname, "fixtures/raw-imports");

describe("vdl-plugin cli", () => {
  it("should bundle ?raw imports correctly", () => {
    // Run the build command
    execSync(`node ${cliPath} build`, { cwd: fixtureDir });

    const distIndex = resolve(fixtureDir, "dist/index.js");
    expect(fs.existsSync(distIndex)).toBe(true);

    const bundledCode = fs.readFileSync(distIndex, "utf8");

    // Basic ?raw imports
    expect(bundledCode).toContain("This is a text file!");
    expect(bundledCode).toContain(
      "With some special chars: \\\\ \\\" ' ` \\\\n",
    );

    // Relative path resolution
    expect(bundledCode).toContain('<div class="test">');
    expect(bundledCode).toContain('"Hello World!" \\\\');

    // Normal imports shouldn't be affected
    expect(bundledCode).toContain("var normal = true;");
    expect(bundledCode).toContain("isNormal = normal;");

    // Cleanup
    fs.rmSync(resolve(fixtureDir, "dist"), { recursive: true, force: true });
  });
});
