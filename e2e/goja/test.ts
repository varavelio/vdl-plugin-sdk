/**
 * End-to-end smoke test for the SDK utilities inside Goja.
 *
 * This file intentionally does not use Vitest. Instead, it runs a compact set
 * of synchronous assertions against the public utility modules that matter for
 * runtime compatibility. The file is bundled into one script and executed by a
 * tiny Go runner backed by Goja.
 *
 * Extend this file by adding more suites or more checks to existing suites.
 * Keep the checks deterministic, synchronous, and focused on observable runtime
 * behavior.
 */

import { irb } from "../../src/testing";
import type { LiteralValue } from "../../src/types";
import { ir, options, strings } from "../../src/utils";

/**
 * Global callback injected by the Go runner.
 *
 * The bundled script calls this once all smoke-test suites pass so the Go side
 * can distinguish success from a script that merely exited without throwing.
 */
declare function __goja_report_ok__(): void;

/**
 * Represents one named smoke check.
 */
type SmokeCheck = {
  name: string;
  run: () => void;
};

/**
 * Groups related smoke checks under one suite name.
 */
type SmokeSuite = {
  name: string;
  checks: SmokeCheck[];
};

/**
 * Fails the current smoke test with a descriptive error.
 */
function fail(message: string): never {
  throw new Error(message);
}

/**
 * Formats a runtime value for use in assertion error messages.
 */
function formatValue(value: unknown): string {
  if (value === undefined) {
    return "undefined";
  }

  if (typeof value === "string") {
    return JSON.stringify(value);
  }

  return JSON.stringify(value);
}

/**
 * Normalizes arrays and plain objects so deep comparisons produce stable,
 * readable error messages even when object key order differs.
 */
function normalizeValue(value: unknown): unknown {
  if (value === null || typeof value !== "object") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeValue(item));
  }

  const normalizedRecord: Record<string, unknown> = {};

  for (const key of Object.keys(value).sort()) {
    normalizedRecord[key] = normalizeValue(
      (value as Record<string, unknown>)[key],
    );
  }

  return normalizedRecord;
}

/**
 * Asserts that a condition is truthy.
 */
function assert(condition: boolean, message: string): void {
  if (!condition) {
    fail(message);
  }
}

/**
 * Asserts that two primitive values are equal using `Object.is` semantics.
 */
function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (!Object.is(actual, expected)) {
    fail(
      `${message}: expected ${formatValue(expected)}, received ${formatValue(actual)}`,
    );
  }
}

/**
 * Asserts that a value is exactly `undefined`.
 */
function assertUndefined(actual: unknown, message: string): void {
  if (actual !== undefined) {
    fail(`${message}: expected undefined, received ${formatValue(actual)}`);
  }
}

/**
 * Asserts that two values are deeply equal after stable normalization.
 *
 * This keeps array ordering intact while normalizing object key ordering so the
 * serialized comparison remains deterministic and easy to debug.
 */
function assertDeepEqual(
  actual: unknown,
  expected: unknown,
  message: string,
): void {
  const normalizedActual = normalizeValue(actual);
  const normalizedExpected = normalizeValue(expected);
  const serializedActual = JSON.stringify(normalizedActual);
  const serializedExpected = JSON.stringify(normalizedExpected);

  if (serializedActual !== serializedExpected) {
    fail(
      `${message}: expected ${formatValue(normalizedExpected)}, received ${formatValue(normalizedActual)}`,
    );
  }
}

/**
 * Runs all checks in a suite and prefixes any thrown error with suite and check
 * names so Goja failures are easy to locate.
 */
function runSuite(suite: SmokeSuite): void {
  for (const smokeCheck of suite.checks) {
    try {
      smokeCheck.run();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      fail(`[${suite.name}] ${smokeCheck.name}: ${message}`);
    }
  }
}

/**
 * Creates the smoke-test suites executed inside Goja.
 *
 * Each suite focuses on a small public area of the SDK so runtime failures can
 * be attributed quickly without mirroring the full unit-test suite.
 */
function createSuites(): SmokeSuite[] {
  const sharedOptions = {
    enabled: " yes ",
    retries: " 3 ",
    features: "api, core , v1",
    mode: "strict",
  };

  return [
    {
      name: "strings.words",
      checks: [
        {
          name: "splits mixed identifiers and separators",
          run: () => {
            assertDeepEqual(
              strings.words("HTTPServer_URL-v2"),
              ["HTTP", "Server", "URL", "v2"],
              "words output",
            );
          },
        },
        {
          name: "returns an empty array for separator-only input",
          run: () => {
            assertDeepEqual(
              strings.words("__---...__"),
              [],
              "words blank output",
            );
          },
        },
      ],
    },
    {
      name: "strings.case-conversion",
      checks: [
        {
          name: "converts to camelCase",
          run: () => {
            assertEqual(
              strings.camelCase("user_profile-name"),
              "userProfileName",
              "camelCase output",
            );
          },
        },
        {
          name: "converts to PascalCase",
          run: () => {
            assertEqual(
              strings.pascalCase("user_profile-name"),
              "UserProfileName",
              "pascalCase output",
            );
          },
        },
        {
          name: "converts to kebab-case with optional uppercase output",
          run: () => {
            assertEqual(
              strings.kebabCase("HTTPServerURL"),
              "http-server-url",
              "kebabCase lowercase output",
            );
            assertEqual(
              strings.kebabCase("HTTPServerURL", true),
              "HTTP-SERVER-URL",
              "kebabCase uppercase output",
            );
          },
        },
        {
          name: "converts to snake_case with optional uppercase output",
          run: () => {
            assertEqual(
              strings.snakeCase("HTTPServerURL"),
              "http_server_url",
              "snakeCase lowercase output",
            );
            assertEqual(
              strings.snakeCase("HTTPServerURL", true),
              "HTTP_SERVER_URL",
              "snakeCase uppercase output",
            );
          },
        },
        {
          name: "converts to spaced upper and lower case",
          run: () => {
            assertEqual(
              strings.upperCase("userProfileName"),
              "USER PROFILE NAME",
              "upperCase output",
            );
            assertEqual(
              strings.lowerCase("userProfileName"),
              "user profile name",
              "lowerCase output",
            );
          },
        },
      ],
    },
    {
      name: "strings.trim",
      checks: [
        {
          name: "trims whitespace by default",
          run: () => {
            assertEqual(
              strings.trim("\n  hello world \t"),
              "hello world",
              "trim output",
            );
            assertEqual(
              strings.trimStart("\n  hello"),
              "hello",
              "trimStart output",
            );
            assertEqual(
              strings.trimEnd("hello\t  "),
              "hello",
              "trimEnd output",
            );
          },
        },
        {
          name: "trims custom character sets from the requested side only",
          run: () => {
            assertEqual(
              strings.trim("_-hello-_", ["_", "-"]),
              "hello",
              "trim custom output",
            );
            assertEqual(
              strings.trimStart("_-hello-_", ["_", "-"]),
              "hello-_",
              "trimStart custom output",
            );
            assertEqual(
              strings.trimEnd("_-hello-_", ["_", "-"]),
              "_-hello",
              "trimEnd custom output",
            );
          },
        },
        {
          name: "preserves internal matches and respects empty trim sets",
          run: () => {
            assertEqual(
              strings.trim("__he_ll-o__", ["_", "-"]),
              "he_ll-o",
              "trim preserves internal characters",
            );
            assertEqual(
              strings.trim("  hello  ", ""),
              "  hello  ",
              "trim empty set output",
            );
          },
        },
      ],
    },
    {
      name: "strings.pad",
      checks: [
        {
          name: "pads both sides and biases the extra character to the right",
          run: () => {
            assertEqual(
              strings.pad("cat", 7),
              "  cat  ",
              "pad even distribution output",
            );
            assertEqual(
              strings.pad("cat", 6, "_"),
              "_cat__",
              "pad right bias output",
            );
          },
        },
        {
          name: "pads left and right with repeated custom patterns",
          run: () => {
            assertEqual(
              strings.padLeft("cat", 8, "_-"),
              "_-_-_cat",
              "padLeft output",
            );
            assertEqual(
              strings.padRight("cat", 8, "_-"),
              "cat_-_-_",
              "padRight output",
            );
          },
        },
        {
          name: "returns the original string when padding is unnecessary or impossible",
          run: () => {
            assertEqual(strings.pad("cat", 2), "cat", "pad no-op output");
            assertEqual(
              strings.padLeft("cat", 6, ""),
              "cat",
              "padLeft empty pattern output",
            );
            assertEqual(
              strings.padRight("cat", Number.NaN, "0"),
              "cat",
              "padRight NaN output",
            );
          },
        },
      ],
    },
    {
      name: "options",
      checks: [
        {
          name: "returns stored strings and defaults",
          run: () => {
            assertEqual(
              options.getOptionString({ prefix: "Api" }, "prefix", "Model"),
              "Api",
              "getOptionString stored value",
            );
            assertEqual(
              options.getOptionString(undefined, "prefix", "Model"),
              "Model",
              "getOptionString default value",
            );
          },
        },
        {
          name: "parses booleans and falls back for invalid values",
          run: () => {
            assertEqual(
              options.getOptionBool(sharedOptions, "enabled", false),
              true,
              "getOptionBool truthy value",
            );
            assertEqual(
              options.getOptionBool({ enabled: "maybe" }, "enabled", false),
              false,
              "getOptionBool invalid fallback",
            );
          },
        },
        {
          name: "parses numbers and falls back for invalid values",
          run: () => {
            assertEqual(
              options.getOptionNumber(sharedOptions, "retries", 1),
              3,
              "getOptionNumber parsed value",
            );
            assertEqual(
              options.getOptionNumber({ retries: "Infinity" }, "retries", 1),
              1,
              "getOptionNumber invalid fallback",
            );
          },
        },
        {
          name: "splits arrays and honors defaults",
          run: () => {
            assertDeepEqual(
              options.getOptionArray(sharedOptions, "features"),
              ["api", "core", "v1"],
              "getOptionArray parsed value",
            );
            assertDeepEqual(
              options.getOptionArray(undefined, "features", ["default"]),
              ["default"],
              "getOptionArray default value",
            );
          },
        },
        {
          name: "accepts only allowed enum values",
          run: () => {
            assertEqual(
              options.getOptionEnum(
                sharedOptions,
                "mode",
                ["strict", "loose"] as const,
                "loose",
              ),
              "strict",
              "getOptionEnum accepted value",
            );
            assertEqual(
              options.getOptionEnum(
                { mode: "other" },
                "mode",
                ["strict", "loose"] as const,
                "loose",
              ),
              "loose",
              "getOptionEnum fallback value",
            );
          },
        },
      ],
    },
    {
      name: "ir",
      checks: [
        {
          name: "finds annotations and returns undefined when missing",
          run: () => {
            const annotations = [
              irb.annotation("deprecated"),
              irb.annotation("route", irb.stringLiteral("/users")),
            ];

            assertDeepEqual(
              ir.getAnnotation(annotations, "route"),
              annotations[1],
              "getAnnotation match",
            );
            assertUndefined(
              ir.getAnnotation(annotations, "missing"),
              "getAnnotation missing value",
            );
          },
        },
        {
          name: "returns raw annotation literal arguments",
          run: () => {
            const routeLiteral = irb.stringLiteral("/users");
            const annotations = [irb.annotation("route", routeLiteral)];

            assertDeepEqual(
              ir.getAnnotationArg(annotations, "route"),
              routeLiteral,
              "getAnnotationArg output",
            );
          },
        },
        {
          name: "unwraps nested literals",
          run: () => {
            const literal = irb.objectLiteral({
              path: irb.stringLiteral("/users"),
              methods: irb.arrayLiteral([
                irb.stringLiteral("GET"),
                irb.stringLiteral("POST"),
              ]),
            });

            assertDeepEqual(
              ir.unwrapLiteral(literal),
              {
                path: "/users",
                methods: ["GET", "POST"],
              },
              "unwrapLiteral nested output",
            );
          },
        },
        {
          name: "keeps malformed literals non-throwing",
          run: () => {
            const malformedStringLiteral = {
              position: irb.position(),
              kind: "string",
            } as LiteralValue;

            const unknownLiteral = {
              position: irb.position(),
              kind: "unknown",
            } as unknown as LiteralValue;

            assertUndefined(
              ir.unwrapLiteral(malformedStringLiteral),
              "unwrapLiteral malformed string payload",
            );
            assertEqual(
              ir.unwrapLiteral(unknownLiteral),
              null,
              "unwrapLiteral unknown kind fallback",
            );
          },
        },
      ],
    },
  ];
}

/**
 * Executes every Goja smoke-test suite and reports success back to the Go
 * runner when all checks pass.
 */
export function runGojaSmokeTest(): void {
  const suites = createSuites();

  assert(suites.length > 0, "expected at least one smoke-test suite");

  for (const suite of suites) {
    runSuite(suite);
  }

  __goja_report_ok__();
}

runGojaSmokeTest();
