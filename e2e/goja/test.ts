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

import {
  assert as assertPlugin,
  fail as failPlugin,
  PluginError,
} from "../../src/core";
import type { LiteralValue } from "../../src/core/types";
import * as irb from "../../src/testing";
import * as arrays from "../../src/utils/arrays";
import * as codegen from "../../src/utils/codegen";
import * as crypto from "../../src/utils/crypto";
import * as functionUtils from "../../src/utils/functions";
import * as ir from "../../src/utils/ir";
import * as maps from "../../src/utils/maps";
import * as markdown from "../../src/utils/markdown";
import * as math from "../../src/utils/math";
import * as objects from "../../src/utils/objects";
import * as options from "../../src/utils/options";
import * as paths from "../../src/utils/paths";
import * as predicates from "../../src/utils/predicates";
import * as rpc from "../../src/utils/rpc";
import * as sets from "../../src/utils/sets";
import * as strings from "../../src/utils/strings";
import * as toml from "../../src/utils/toml";
import * as yaml from "../../src/utils/yaml";

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
 * Converts a `Map` into a serializable array of entries for comparisons.
 */
function toEntries<Key, Value>(map: Map<Key, Value>): Array<[Key, Value]> {
  return Array.from(map.entries());
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
 * Creates smoke-test suites for the string helpers implemented by the SDK.
 */
function createStringSuites(): SmokeSuite[] {
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
            assertEqual(
              strings.slugify("Canción Número 1"),
              "cancion-numero-1",
              "slugify output",
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
        {
          name: "dedents multi-line template output",
          run: () => {
            assertEqual(
              strings.dedent(`
                export interface User {
                  id: string;
                }
              `),
              "export interface User {\n  id: string;\n}",
              "dedent output",
            );
          },
        },
        {
          name: "indents non-blank lines with configurable prefixes",
          run: () => {
            assertEqual(
              strings.indent("id: string;\nname: string;"),
              "  id: string;\n  name: string;",
              "indent default prefix output",
            );
            assertEqual(
              strings.indent("field string\n\nfield int", "\t"),
              "\tfield string\n\n\tfield int",
              "indent custom prefix output",
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
      ],
    },
    {
      name: "strings.truncate",
      checks: [
        {
          name: "truncates by characters from both ends",
          run: () => {
            assertEqual(
              strings.firstNChars("Hello world", 5),
              "Hello...",
              "firstNChars output",
            );
            assertEqual(
              strings.lastNChars("Hello world", 5, false),
              "world",
              "lastNChars output",
            );
          },
        },
        {
          name: "truncates by normalized words from both ends",
          run: () => {
            assertEqual(
              strings.firstNWords("HTTPServer_URL-v2", 2),
              "HTTP Server...",
              "firstNWords output",
            );
            assertEqual(
              strings.lastNWords("HTTPServer_URL-v2", 2, false),
              "URL v2",
              "lastNWords output",
            );
          },
        },
      ],
    },
    {
      name: "strings.limit-blank-lines",
      checks: [
        {
          name: "limits consecutive blank lines to specified amount",
          run: () => {
            assertEqual(
              strings.limitBlankLines("line1\n\n\nline2", 0),
              "line1\nline2",
              "limitBlankLines max=0 output",
            );
            assertEqual(
              strings.limitBlankLines("line1\n\n\nline2", 1),
              "line1\n\nline2",
              "limitBlankLines max=1 output",
            );
            assertEqual(
              strings.limitBlankLines("line1\n\n\n\n\nline2", 2),
              "line1\n\n\nline2",
              "limitBlankLines max=2 output",
            );
          },
        },
      ],
    },
    {
      name: "strings.pluralize",
      checks: [
        {
          name: "pluralizes and singularizes based on count",
          run: () => {
            assertEqual(
              strings.pluralize("test"),
              "tests",
              "pluralize singular input",
            );
            assertEqual(
              strings.pluralize("test", 1),
              "test",
              "pluralize count 1",
            );
            assertEqual(
              strings.pluralize("test", 5),
              "tests",
              "pluralize count 5",
            );
            assertEqual(
              strings.pluralize("test", 5, true),
              "5 tests",
              "pluralize inclusive",
            );
            assertEqual(
              strings.pluralize("person", 2),
              "people",
              "pluralize irregular",
            );
          },
        },
      ],
    },
    {
      name: "strings.ensure",
      checks: [
        {
          name: "ensures prefix and suffix correctly",
          run: () => {
            assertEqual(
              strings.ensurePrefix("User", "I"),
              "IUser",
              "ensurePrefix add",
            );
            assertEqual(
              strings.ensurePrefix("IUser", "I"),
              "IUser",
              "ensurePrefix exists",
            );
            assertEqual(
              strings.ensureSuffix("User", "Error"),
              "UserError",
              "ensureSuffix add",
            );
            assertEqual(
              strings.ensureSuffix("UserError", "Error"),
              "UserError",
              "ensureSuffix exists",
            );
          },
        },
        {
          name: "runs fuzzy search with structural ranking and deterministic fuzz coverage",
          run: () => {
            const rankedResult = strings.fuzzySearch(
              ["MyUserHelper", "SuperUser", "UserService", "User", "Usr"],
              "User",
            );

            assertDeepEqual(
              rankedResult,
              {
                matches: ["User", "UserService", "SuperUser"],
                exactMatchFound: true,
              },
              "fuzzySearch ranking output",
            );

            const normalizedResult = strings.fuzzySearch(
              ["cafe", "café", "CAFÉ", "Cafe"],
              "cafe",
            );

            assertDeepEqual(
              normalizedResult,
              {
                matches: ["cafe", "café", "CAFÉ"],
                exactMatchFound: true,
              },
              "fuzzySearch normalization output",
            );
          },
        },
        {
          name: "escapes string characters",
          run: () => {
            assertEqual(
              strings.escapeHtml("<script>"),
              "&lt;script&gt;",
              "escapeHtml output",
            );
            assertEqual(
              strings.escapeScriptTag("</script>"),
              "\\u003c/script\\u003e",
              "escapeScriptTag output",
            );
          },
        },
      ],
    },
  ];
}

/**
 * Creates smoke-test suites for the option-parsing helpers.
 */
function createOptionSuites(): SmokeSuite[] {
  const sharedOptions = {
    enabled: " yes ",
    retries: " 3 ",
    features: "api, core , v1",
    mode: "strict",
  };

  return [
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
  ];
}

/**
 * Creates smoke-test suites for the IR helpers.
 */
function createIrSuites(): SmokeSuite[] {
  return [
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
        {
          name: "hoists anonymous object types into named top-level types",
          run: () => {
            const schema = irb.schema({
              types: [
                irb.typeDef(
                  "Api",
                  irb.objectType([
                    irb.field(
                      "request",
                      irb.objectType([
                        irb.field(
                          "payload",
                          irb.objectType([
                            irb.field("id", irb.primitiveType("string")),
                          ]),
                        ),
                      ]),
                    ),
                  ]),
                ),
              ],
            });

            const flatSchema = ir.hoistAnonymousTypes(schema);

            assertDeepEqual(
              flatSchema.types.map((typeDef) => typeDef.name),
              ["Api", "ApiRequest", "ApiRequestPayload"],
              "hoistAnonymousTypes generated names",
            );
            assertDeepEqual(
              flatSchema.types[0]?.typeRef,
              irb.objectType([
                irb.field("request", irb.namedType("ApiRequest")),
              ]),
              "hoistAnonymousTypes rewritten root type",
            );
          },
        },
      ],
    },
  ];
}

/**
 * Creates smoke-test suites for VDL source generation helpers.
 */
function createCodegenSuites(): SmokeSuite[] {
  return [
    {
      name: "codegen",
      checks: [
        {
          name: "reconstructs canonical VDL from IR nodes",
          run: () => {
            const userType = irb.typeDef(
              "User",
              irb.objectType([
                irb.field("id", irb.primitiveType("string")),
                irb.field("tags", irb.arrayType(irb.primitiveType("string"))),
              ]),
            );
            userType.position = irb.position({ line: 10, column: 1 });

            const defaultStatus = irb.constantDef(
              "defaultStatus",
              irb.stringLiteral("active"),
            );
            defaultStatus.position = irb.position({ line: 20, column: 1 });

            const schema = irb.schema({
              docs: [
                {
                  position: irb.position({ line: 1, column: 1 }),
                  content: "Schema overview",
                },
              ],
              types: [userType],
              constants: [defaultStatus],
            });

            assertEqual(
              typeof codegen.generateVdl,
              "function",
              "generateVdl is exported",
            );
            assertEqual(
              codegen.generateVdl(schema),
              '"""\nSchema overview\n"""\n\n' +
                "type User {\n  id string\n  tags string[]\n}\n\n" +
                'const defaultStatus = "active"',
              "generateVdl schema output",
            );
          },
        },
      ],
    },
  ];
}

/**
 * Creates smoke-test suites for RPC-specific IR validation helpers.
 */
function createRpcSuites(): SmokeSuite[] {
  return [
    {
      name: "rpc",
      checks: [
        {
          name: "does not throw when there are no @rpc types",
          run: () => {
            const schema = irb.schema({
              types: [
                irb.typeDef(
                  "User",
                  irb.objectType([
                    irb.field("id", irb.primitiveType("string")),
                  ]),
                ),
              ],
            });

            assertEqual(
              typeof rpc.assertValidIrForRpc,
              "function",
              "assertValidIrForRpc is exported",
            );
            rpc.assertValidIrForRpc(schema);
          },
        },
        {
          name: "throws PluginError for invalid RPC schemas",
          run: () => {
            const badType = irb.typeDef(
              "BrokenService",
              irb.primitiveType("string"),
              {
                annotations: [irb.annotation("rpc")],
              },
            );

            try {
              rpc.assertValidIrForRpc(irb.schema({ types: [badType] }));
              fail("assertValidIrForRpc should throw for invalid RPC schema");
            } catch (error) {
              if (!(error instanceof PluginError)) {
                fail("assertValidIrForRpc error type");
              }

              assertEqual(
                error.message,
                'Type "BrokenService" is annotated with @rpc and must be an object type.',
                "assertValidIrForRpc message",
              );
              assertDeepEqual(
                error.position,
                badType.position,
                "assertValidIrForRpc position",
              );
            }
          },
        },
      ],
    },
  ];
}

/**
 * Creates smoke-test suites for the path helpers backed by pathe.
 */
function createPathSuites(): SmokeSuite[] {
  return [
    {
      name: "paths",
      checks: [
        {
          name: "joins and normalizes forward-slash paths",
          run: () => {
            assertEqual(
              paths.join("generated", "models", "user.ts"),
              "generated/models/user.ts",
              "paths.join output",
            );
            assertEqual(
              paths.normalize("generated\\models/../types/user.ts"),
              "generated/types/user.ts",
              "paths.normalize output",
            );
          },
        },
        {
          name: "resolves absolute paths deterministically",
          run: () => {
            assertEqual(
              paths.resolve("/workspace/plugin", "src", "../dist/index.js"),
              "/workspace/plugin/dist/index.js",
              "paths.resolve output",
            );
            assertEqual(
              paths.relative("generated/models", "generated/types/user.ts"),
              "../types/user.ts",
              "paths.relative output",
            );
          },
        },
        {
          name: "extracts common path segments",
          run: () => {
            const path = "generated/models/user.test.ts";

            assertEqual(
              paths.dirname(path),
              "generated/models",
              "paths.dirname output",
            );
            assertEqual(
              paths.basename(path),
              "user.test.ts",
              "paths.basename output",
            );
            assertEqual(
              paths.basename(path, ".ts"),
              "user.test",
              "paths.basename with extension output",
            );
            assertEqual(paths.extname(path), ".ts", "paths.extname output");
            assertEqual(
              paths.filename(path),
              "user.test",
              "paths.filename output",
            );
            assertEqual(
              paths.isAbsolute("/generated/models/user.ts"),
              true,
              "paths.isAbsolute absolute output",
            );
            assertEqual(
              paths.isAbsolute("generated/models/user.ts"),
              false,
              "paths.isAbsolute relative output",
            );
          },
        },
      ],
    },
  ];
}

/**
 * Creates smoke-test suites for YAML parse/stringify helpers.
 */
function createYamlSuites(): SmokeSuite[] {
  return [
    {
      name: "yaml",
      checks: [
        {
          name: "parse reads nested YAML values",
          run: () => {
            const output = yaml.parse<{
              service: {
                enabled: boolean;
                name: string;
                ports: number[];
              };
            }>(`
service:
  enabled: true
  name: users
  ports:
    - 8080
    - 8081
`);

            assertDeepEqual(
              output,
              {
                service: {
                  enabled: true,
                  name: "users",
                  ports: [8080, 8081],
                },
              },
              "yaml.parse output",
            );
          },
        },
        {
          name: "stringify supports round-tripping",
          run: () => {
            const input = {
              retries: 3,
              service: {
                enabled: true,
                name: "billing",
              },
              tags: ["core", "payments"],
            };

            assertDeepEqual(
              yaml.parse(yaml.stringify(input)),
              input,
              "yaml stringify round-trip",
            );
          },
        },
      ],
    },
  ];
}

/**
 * Creates smoke-test suites for TOML parse/stringify helpers.
 */
function createTomlSuites(): SmokeSuite[] {
  return [
    {
      name: "toml",
      checks: [
        {
          name: "parse reads nested TOML values",
          run: () => {
            const output = toml.parse<{
              database: {
                enabled: boolean;
                ports: number[];
              };
            }>(`
[database]
enabled = true
ports = [8000, 8001]
`);

            assertDeepEqual(
              output,
              {
                database: {
                  enabled: true,
                  ports: [8000, 8001],
                },
              },
              "toml.parse output",
            );
          },
        },
        {
          name: "stringify supports round-tripping",
          run: () => {
            const input: Record<string, unknown> = {
              retries: 2,
              service: {
                enabled: true,
                name: "users",
              },
              tags: ["core", "users"],
            };

            assertDeepEqual(
              toml.parse(toml.stringify(input)),
              input,
              "toml stringify round-trip",
            );
          },
        },
      ],
    },
  ];
}

/**
 * Creates smoke-test suites for deterministic hashing helpers.
 */
function createCryptoSuites(): SmokeSuite[] {
  return [
    {
      name: "crypto",
      checks: [
        {
          name: "hashes equal inputs deterministically",
          run: () => {
            const first = crypto.hash({ foo: "bar", nested: [1, 2, 3] });
            const second = crypto.hash({ foo: "bar", nested: [1, 2, 3] });

            assertEqual(first, second, "crypto.hash deterministic output");
            assertEqual(
              first,
              "xQ6Bpf9NjDF4RYMq_fze2qhU7xCCP1vegvPcoUpwCvg",
              "crypto.hash expected output",
            );
          },
        },
        {
          name: "changes when input changes",
          run: () => {
            const left = crypto.hash({ foo: "bar" });
            const right = crypto.hash({ foo: "baz" });

            assert(left !== right, "crypto.hash distinct output");
          },
        },
        {
          name: "creates stable short fingerprints",
          run: () => {
            const first = crypto.fingerprint({ foo: "bar", nested: [1, 2, 3] });
            const second = crypto.fingerprint({
              foo: "bar",
              nested: [1, 2, 3],
            });

            assertEqual(
              first,
              second,
              "crypto.fingerprint deterministic output",
            );
            assertEqual(
              first,
              "1c1b0e66",
              "crypto.fingerprint expected output",
            );
          },
        },
      ],
    },
  ];
}

/**
 * Creates smoke-test suites for lightweight Markdown helpers.
 */
function createMarkdownSuites(): SmokeSuite[] {
  return [
    {
      name: "markdown",
      checks: [
        {
          name: "extracts the first title or falls back to Untitled",
          run: () => {
            assertEqual(
              markdown.title("Intro\n\n## SDK Overview\n\nBody"),
              "SDK Overview",
              "markdown.title heading output",
            );
            assertEqual(
              markdown.title("Body only"),
              "Untitled",
              "markdown.title fallback output",
            );
          },
        },
        {
          name: "wraps fenced code blocks",
          run: () => {
            assertEqual(
              markdown.wrapCode("const snippet = `value`;\n```nested```", "ts"),
              "```ts\nconst snippet = \\`value\\`;\n\\`\\`\\`nested\\`\\`\\`\n```",
              "markdown.wrapCode output",
            );
          },
        },
        {
          name: "extracts the first non-heading paragraph line",
          run: () => {
            assertEqual(
              markdown.firstParagraph(
                "# Title\n\nFirst paragraph\n\nSecond paragraph",
              ),
              "First paragraph",
              "markdown.firstParagraph output",
            );
            assertUndefined(
              markdown.firstParagraph("# Title\n\n## Section"),
              "markdown.firstParagraph missing paragraph",
            );
          },
        },
      ],
    },
  ];
}

/**
 * Creates smoke-test suites for deterministic array helpers re-exported from
 * es-toolkit.
 */
function createArraySuites(): SmokeSuite[] {
  return [
    {
      name: "arrays",
      checks: [
        {
          name: "at",
          run: () => {
            assertDeepEqual(
              arrays.at(["a", "b", "c"], [0, 2]),
              ["a", "c"],
              "arrays.at output",
            );
          },
        },
        {
          name: "chunk",
          run: () => {
            assertDeepEqual(
              arrays.chunk([1, 2, 3, 4, 5], 2),
              [[1, 2], [3, 4], [5]],
              "arrays.chunk output",
            );
          },
        },
        {
          name: "compact",
          run: () => {
            assertDeepEqual(
              arrays.compact([0, 1, false, 2, "", 3, null, undefined]),
              [1, 2, 3],
              "arrays.compact output",
            );
          },
        },
        {
          name: "countBy",
          run: () => {
            assertDeepEqual(
              arrays.countBy(["one", "two", "three"], (item) => item.length),
              { 3: 2, 5: 1 },
              "arrays.countBy output",
            );
          },
        },
        {
          name: "difference",
          run: () => {
            assertDeepEqual(
              arrays.difference([1, 2, 3], [2, 4]),
              [1, 3],
              "arrays.difference output",
            );
          },
        },
        {
          name: "differenceBy",
          run: () => {
            assertDeepEqual(
              arrays.differenceBy(
                [{ id: 1 }, { id: 2 }],
                [{ id: 2 }],
                (item) => item.id,
              ),
              [{ id: 1 }],
              "arrays.differenceBy output",
            );
          },
        },
        {
          name: "differenceWith",
          run: () => {
            assertDeepEqual(
              arrays.differenceWith(
                [{ id: 1 }, { id: 2 }],
                [{ id: 2 }],
                (left, right) => left.id === right.id,
              ),
              [{ id: 1 }],
              "arrays.differenceWith output",
            );
          },
        },
        {
          name: "drop",
          run: () => {
            assertDeepEqual(
              arrays.drop([1, 2, 3, 4], 2),
              [3, 4],
              "arrays.drop output",
            );
          },
        },
        {
          name: "dropRight",
          run: () => {
            assertDeepEqual(
              arrays.dropRight([1, 2, 3, 4], 2),
              [1, 2],
              "arrays.dropRight output",
            );
          },
        },
        {
          name: "dropRightWhile",
          run: () => {
            assertDeepEqual(
              arrays.dropRightWhile([1, 2, 3, 4], (item) => item > 2),
              [1, 2],
              "arrays.dropRightWhile output",
            );
          },
        },
        {
          name: "dropWhile",
          run: () => {
            assertDeepEqual(
              arrays.dropWhile([1, 2, 3, 4], (item) => item < 3),
              [3, 4],
              "arrays.dropWhile output",
            );
          },
        },
        {
          name: "flatMap",
          run: () => {
            assertDeepEqual(
              arrays.flatMap([1, 2, 3], (item) => [item, item * 10]),
              [1, 10, 2, 20, 3, 30],
              "arrays.flatMap output",
            );
          },
        },
        {
          name: "flatMapDeep",
          run: () => {
            assertDeepEqual(
              arrays.flatMapDeep([1, 2], (item) => [[item, [item * 10]]]),
              [1, 10, 2, 20],
              "arrays.flatMapDeep output",
            );
          },
        },
        {
          name: "flatten",
          run: () => {
            assertDeepEqual(
              arrays.flatten([
                [1, 2],
                [3, 4],
              ]),
              [1, 2, 3, 4],
              "arrays.flatten output",
            );
          },
        },
        {
          name: "flattenDeep",
          run: () => {
            assertDeepEqual(
              arrays.flattenDeep([1, [2, [3, [4]]]]),
              [1, 2, 3, 4],
              "arrays.flattenDeep output",
            );
          },
        },
        {
          name: "groupBy",
          run: () => {
            assertDeepEqual(
              arrays.groupBy(["ant", "bear", "bat"], (item) => item[0] ?? ""),
              { a: ["ant"], b: ["bear", "bat"] },
              "arrays.groupBy output",
            );
          },
        },
        {
          name: "head",
          run: () => {
            assertEqual(arrays.head([1, 2, 3]), 1, "arrays.head output");
          },
        },
        {
          name: "initial",
          run: () => {
            assertDeepEqual(
              arrays.initial([1, 2, 3]),
              [1, 2],
              "arrays.initial output",
            );
          },
        },
        {
          name: "intersection",
          run: () => {
            assertDeepEqual(
              arrays.intersection([1, 2, 3], [2, 3, 4]),
              [2, 3],
              "arrays.intersection output",
            );
          },
        },
        {
          name: "intersectionBy",
          run: () => {
            assertDeepEqual(
              arrays.intersectionBy(
                [{ id: 1 }, { id: 2 }],
                [{ id: 2 }],
                (item) => item.id,
              ),
              [{ id: 2 }],
              "arrays.intersectionBy output",
            );
          },
        },
        {
          name: "intersectionWith",
          run: () => {
            assertDeepEqual(
              arrays.intersectionWith(
                [{ id: 1 }, { id: 2 }],
                [{ id: 2 }],
                (left, right) => left.id === right.id,
              ),
              [{ id: 2 }],
              "arrays.intersectionWith output",
            );
          },
        },
        {
          name: "isSubset",
          run: () => {
            assertEqual(
              arrays.isSubset([1, 2, 3], [1, 2]),
              true,
              "arrays.isSubset output",
            );
          },
        },
        {
          name: "isSubsetWith",
          run: () => {
            assertEqual(
              arrays.isSubsetWith(
                [{ id: 1 }, { id: 2 }, { id: 3 }],
                [{ id: 1 }, { id: 2 }],
                (left, right) => left.id === right.id,
              ),
              true,
              "arrays.isSubsetWith output",
            );
          },
        },
        {
          name: "keyBy",
          run: () => {
            assertDeepEqual(
              arrays.keyBy(
                [
                  { id: "a", value: 1 },
                  { id: "b", value: 2 },
                ],
                (item) => item.id,
              ),
              {
                a: { id: "a", value: 1 },
                b: { id: "b", value: 2 },
              },
              "arrays.keyBy output",
            );
          },
        },
        {
          name: "last",
          run: () => {
            assertEqual(arrays.last([1, 2, 3]), 3, "arrays.last output");
          },
        },
        {
          name: "maxBy",
          run: () => {
            assertDeepEqual(
              arrays.maxBy([{ n: 1 }, { n: 3 }, { n: 2 }], (item) => item.n),
              { n: 3 },
              "arrays.maxBy output",
            );
          },
        },
        {
          name: "minBy",
          run: () => {
            assertDeepEqual(
              arrays.minBy([{ n: 1 }, { n: 3 }, { n: 2 }], (item) => item.n),
              { n: 1 },
              "arrays.minBy output",
            );
          },
        },
        {
          name: "orderBy",
          run: () => {
            assertDeepEqual(
              arrays.orderBy(
                [
                  { name: "b", age: 2 },
                  { name: "a", age: 2 },
                  { name: "c", age: 1 },
                ],
                [(item) => item.age, (item) => item.name],
                ["asc", "asc"],
              ),
              [
                { name: "c", age: 1 },
                { name: "a", age: 2 },
                { name: "b", age: 2 },
              ],
              "arrays.orderBy output",
            );
          },
        },
        {
          name: "partition",
          run: () => {
            assertDeepEqual(
              arrays.partition([1, 2, 3, 4], (item) => item % 2 === 0),
              [
                [2, 4],
                [1, 3],
              ],
              "arrays.partition output",
            );
          },
        },
        {
          name: "sortBy",
          run: () => {
            assertDeepEqual(
              arrays.sortBy([{ n: 3 }, { n: 1 }, { n: 2 }], ["n"]),
              [{ n: 1 }, { n: 2 }, { n: 3 }],
              "arrays.sortBy output",
            );
          },
        },
        {
          name: "tail",
          run: () => {
            assertDeepEqual(
              arrays.tail([1, 2, 3]),
              [2, 3],
              "arrays.tail output",
            );
          },
        },
        {
          name: "take",
          run: () => {
            assertDeepEqual(
              arrays.take([1, 2, 3], 2),
              [1, 2],
              "arrays.take output",
            );
          },
        },
        {
          name: "takeRight",
          run: () => {
            assertDeepEqual(
              arrays.takeRight([1, 2, 3], 2),
              [2, 3],
              "arrays.takeRight output",
            );
          },
        },
        {
          name: "takeRightWhile",
          run: () => {
            assertDeepEqual(
              arrays.takeRightWhile([1, 2, 3, 4], (item) => item > 2),
              [3, 4],
              "arrays.takeRightWhile output",
            );
          },
        },
        {
          name: "takeWhile",
          run: () => {
            assertDeepEqual(
              arrays.takeWhile([1, 2, 3, 4], (item) => item < 3),
              [1, 2],
              "arrays.takeWhile output",
            );
          },
        },
        {
          name: "toFilled",
          run: () => {
            assertDeepEqual(
              arrays.toFilled([1, 2, 3], 0, 1, 3),
              [1, 0, 0],
              "arrays.toFilled output",
            );
          },
        },
        {
          name: "union",
          run: () => {
            assertDeepEqual(
              arrays.union([1, 2], [2, 3]),
              [1, 2, 3],
              "arrays.union output",
            );
          },
        },
        {
          name: "unionBy",
          run: () => {
            assertDeepEqual(
              arrays.unionBy(
                [{ id: 1 }, { id: 2 }],
                [{ id: 2 }, { id: 3 }],
                (item) => item.id,
              ),
              [{ id: 1 }, { id: 2 }, { id: 3 }],
              "arrays.unionBy output",
            );
          },
        },
        {
          name: "unionWith",
          run: () => {
            assertDeepEqual(
              arrays.unionWith(
                [{ id: 1 }, { id: 2 }],
                [{ id: 2 }, { id: 3 }],
                (left, right) => left.id === right.id,
              ),
              [{ id: 1 }, { id: 2 }, { id: 3 }],
              "arrays.unionWith output",
            );
          },
        },
        {
          name: "uniq",
          run: () => {
            assertDeepEqual(
              arrays.uniq([1, 2, 2, 3, 1]),
              [1, 2, 3],
              "arrays.uniq output",
            );
          },
        },
        {
          name: "uniqBy",
          run: () => {
            assertDeepEqual(
              arrays.uniqBy(
                [{ id: 1 }, { id: 1 }, { id: 2 }],
                (item) => item.id,
              ),
              [{ id: 1 }, { id: 2 }],
              "arrays.uniqBy output",
            );
          },
        },
        {
          name: "uniqWith",
          run: () => {
            assertDeepEqual(
              arrays.uniqWith(
                [{ id: 1 }, { id: 1 }, { id: 2 }],
                (left, right) => left.id === right.id,
              ),
              [{ id: 1 }, { id: 2 }],
              "arrays.uniqWith output",
            );
          },
        },
        {
          name: "unzip",
          run: () => {
            assertDeepEqual(
              arrays.unzip([
                ["a", 1, true],
                ["b", 2, false],
              ]),
              [
                ["a", "b"],
                [1, 2],
                [true, false],
              ],
              "arrays.unzip output",
            );
          },
        },
        {
          name: "unzipWith",
          run: () => {
            assertDeepEqual(
              arrays.unzipWith(
                [
                  [1, 10],
                  [2, 20],
                ],
                (first, second) => first + second,
              ),
              [3, 30],
              "arrays.unzipWith output",
            );
          },
        },
        {
          name: "windowed",
          run: () => {
            assertDeepEqual(
              arrays.windowed([1, 2, 3, 4], 2),
              [
                [1, 2],
                [2, 3],
                [3, 4],
              ],
              "arrays.windowed output",
            );
          },
        },
        {
          name: "without",
          run: () => {
            assertDeepEqual(
              arrays.without([1, 2, 3, 2], 2),
              [1, 3],
              "arrays.without output",
            );
          },
        },
        {
          name: "xor",
          run: () => {
            assertDeepEqual(
              arrays.xor([1, 2, 3], [2, 3, 4]),
              [1, 4],
              "arrays.xor output",
            );
          },
        },
        {
          name: "xorBy",
          run: () => {
            assertDeepEqual(
              arrays.xorBy(
                [{ id: 1 }, { id: 2 }],
                [{ id: 2 }, { id: 3 }],
                (item) => item.id,
              ),
              [{ id: 1 }, { id: 3 }],
              "arrays.xorBy output",
            );
          },
        },
        {
          name: "xorWith",
          run: () => {
            assertDeepEqual(
              arrays.xorWith(
                [{ id: 1 }, { id: 2 }],
                [{ id: 2 }, { id: 3 }],
                (left, right) => left.id === right.id,
              ),
              [{ id: 1 }, { id: 3 }],
              "arrays.xorWith output",
            );
          },
        },
        {
          name: "zip",
          run: () => {
            assertDeepEqual(
              arrays.zip(["a", "b"], [1, 2], [true, false]),
              [
                ["a", 1, true],
                ["b", 2, false],
              ],
              "arrays.zip output",
            );
          },
        },
        {
          name: "zipObject",
          run: () => {
            assertDeepEqual(
              arrays.zipObject(["a", "b"], [1, 2]),
              { a: 1, b: 2 },
              "arrays.zipObject output",
            );
          },
        },
        {
          name: "zipWith",
          run: () => {
            assertDeepEqual(
              arrays.zipWith([1, 2], [10, 20], (left, right) => left + right),
              [11, 22],
              "arrays.zipWith output",
            );
          },
        },
      ],
    },
  ];
}

/**
 * Creates smoke-test suites for synchronous function helpers re-exported from
 * es-toolkit.
 */
function createFunctionSuites(): SmokeSuite[] {
  return [
    {
      name: "functions",
      checks: [
        {
          name: "after",
          run: () => {
            let calls = 0;
            const afterFn = functionUtils.after(2, () => {
              calls += 1;
              return calls;
            });

            assertUndefined(afterFn(), "functions.after first call");
            assertEqual(afterFn(), 1, "functions.after second call");
            assertEqual(afterFn(), 2, "functions.after third call");
          },
        },
        {
          name: "ary",
          run: () => {
            assertDeepEqual(
              functionUtils.ary((...args: number[]) => args, 2)(1, 2, 3),
              [1, 2],
              "functions.ary output",
            );
          },
        },
        {
          name: "before",
          run: () => {
            let calls = 0;
            const beforeFn = functionUtils.before(3, () => {
              calls += 1;
              return calls;
            });

            assertEqual(beforeFn(), 1, "functions.before first call");
            assertEqual(beforeFn(), 2, "functions.before second call");
            assertUndefined(beforeFn(), "functions.before third call");
          },
        },
        {
          name: "curry",
          run: () => {
            assertEqual(
              functionUtils.curry(
                (a: number, b: number, c: number) => a + b + c,
              )(1)(2)(3),
              6,
              "functions.curry output",
            );
          },
        },
        {
          name: "curryRight",
          run: () => {
            assertDeepEqual(
              functionUtils.curryRight((a: number, b: number, c: number) => [
                a,
                b,
                c,
              ])(3)(2)(1),
              [1, 2, 3],
              "functions.curryRight output",
            );
          },
        },
        {
          name: "flow",
          run: () => {
            assertEqual(
              functionUtils.flow(
                (value: number) => value + 1,
                (value) => value * 2,
              )(3),
              8,
              "functions.flow output",
            );
          },
        },
        {
          name: "flowRight",
          run: () => {
            assertEqual(
              functionUtils.flowRight(
                (value: number) => value + 1,
                (value) => value * 2,
              )(3),
              7,
              "functions.flowRight output",
            );
          },
        },
        {
          name: "identity",
          run: () => {
            assertEqual(
              functionUtils.identity("value"),
              "value",
              "functions.identity output",
            );
          },
        },
        {
          name: "memoize",
          run: () => {
            let calls = 0;
            const memoized = functionUtils.memoize((value: number) => {
              calls += 1;
              return value * 2;
            });

            assertEqual(memoized(2), 4, "functions.memoize first result");
            assertEqual(memoized(2), 4, "functions.memoize cached result");
            assertEqual(calls, 1, "functions.memoize call count");
          },
        },
        {
          name: "negate",
          run: () => {
            assertEqual(
              functionUtils.negate((value: number) => value > 2)(1),
              true,
              "functions.negate output",
            );
          },
        },
        {
          name: "noop",
          run: () => {
            assertUndefined(functionUtils.noop(), "functions.noop output");
          },
        },
        {
          name: "once",
          run: () => {
            let calls = 0;
            const onceFn = functionUtils.once(() => {
              calls += 1;
              return calls;
            });

            assertEqual(onceFn(), 1, "functions.once first result");
            assertEqual(onceFn(), 1, "functions.once cached result");
            assertEqual(calls, 1, "functions.once call count");
          },
        },
        {
          name: "partial",
          run: () => {
            assertEqual(
              functionUtils.partial(
                (left: number, right: number) => left + right,
                1,
              )(2),
              3,
              "functions.partial output",
            );
          },
        },
        {
          name: "partialRight",
          run: () => {
            assertEqual(
              functionUtils.partialRight(
                (left: number, right: number) => left + right,
                2,
              )(1),
              3,
              "functions.partialRight output",
            );
          },
        },
        {
          name: "rest",
          run: () => {
            assertDeepEqual(
              functionUtils.rest((args: number[]) => args)(1, 2, 3),
              [1, 2, 3],
              "functions.rest output",
            );
          },
        },
        {
          name: "spread",
          run: () => {
            assertDeepEqual(
              functionUtils.spread((a: number, b: number, c: number) => [
                a,
                b,
                c,
              ])([1, 2, 3]),
              [1, 2, 3],
              "functions.spread output",
            );
          },
        },
        {
          name: "unary",
          run: () => {
            assertEqual(
              functionUtils.unary((...args: number[]) => args.length)(1, 2, 3),
              1,
              "functions.unary output",
            );
          },
        },
      ],
    },
  ];
}

/**
 * Creates smoke-test suites for `Map` helpers re-exported from es-toolkit.
 */
function createMapSuites(): SmokeSuite[] {
  return [
    {
      name: "maps",
      checks: [
        {
          name: "every",
          run: () => {
            const map = new Map([
              ["a", 1],
              ["b", 2],
              ["c", 3],
            ]);

            assertEqual(
              maps.every(map, (value) => value > 0),
              true,
              "maps.every output",
            );
          },
        },
        {
          name: "filter",
          run: () => {
            const map = new Map([
              ["a", 1],
              ["b", 2],
              ["c", 3],
            ]);

            assertDeepEqual(
              toEntries(maps.filter(map, (value) => value >= 2)),
              [
                ["b", 2],
                ["c", 3],
              ],
              "maps.filter output",
            );
          },
        },
        {
          name: "findKey",
          run: () => {
            const map = new Map([
              ["a", 1],
              ["b", 2],
              ["c", 3],
            ]);

            assertEqual(
              maps.findKey(map, (value) => value === 2),
              "b",
              "maps.findKey output",
            );
          },
        },
        {
          name: "findValue",
          run: () => {
            const map = new Map([
              ["a", 1],
              ["b", 2],
              ["c", 3],
            ]);

            assertEqual(
              maps.findValue(map, (value) => value === 2),
              2,
              "maps.findValue output",
            );
          },
        },
        {
          name: "hasValue",
          run: () => {
            const map = new Map([
              ["a", 1],
              ["b", 2],
              ["c", 3],
            ]);

            assertEqual(maps.hasValue(map, 3), true, "maps.hasValue output");
          },
        },
        {
          name: "mapKeys",
          run: () => {
            const map = new Map([
              ["a", 1],
              ["b", 2],
              ["c", 3],
            ]);

            assertDeepEqual(
              toEntries(maps.mapKeys(map, (_value, key) => key.toUpperCase())),
              [
                ["A", 1],
                ["B", 2],
                ["C", 3],
              ],
              "maps.mapKeys output",
            );
          },
        },
        {
          name: "mapValues",
          run: () => {
            const map = new Map([
              ["a", 1],
              ["b", 2],
              ["c", 3],
            ]);

            assertDeepEqual(
              toEntries(maps.mapValues(map, (value) => value * 10)),
              [
                ["a", 10],
                ["b", 20],
                ["c", 30],
              ],
              "maps.mapValues output",
            );
          },
        },
        {
          name: "reduce",
          run: () => {
            const map = new Map([
              ["a", 1],
              ["b", 2],
              ["c", 3],
            ]);

            assertEqual(
              maps.reduce(map, (sum, value) => sum + value, 0),
              6,
              "maps.reduce output",
            );
          },
        },
        {
          name: "some",
          run: () => {
            const map = new Map([
              ["a", 1],
              ["b", 2],
              ["c", 3],
            ]);

            assertEqual(
              maps.some(map, (value) => value === 2),
              true,
              "maps.some output",
            );
          },
        },
      ],
    },
  ];
}

/**
 * Creates smoke-test suites for deterministic math helpers re-exported from
 * es-toolkit.
 */
function createMathSuites(): SmokeSuite[] {
  return [
    {
      name: "math",
      checks: [
        {
          name: "clamp",
          run: () => {
            assertEqual(math.clamp(10, 0, 5), 5, "math.clamp output");
          },
        },
        {
          name: "inRange",
          run: () => {
            assertEqual(math.inRange(3, 1, 5), true, "math.inRange output");
          },
        },
        {
          name: "mean",
          run: () => {
            assertEqual(math.mean([2, 4, 6]), 4, "math.mean output");
          },
        },
        {
          name: "meanBy",
          run: () => {
            assertEqual(
              math.meanBy([{ n: 2 }, { n: 4 }, { n: 6 }], (item) => item.n),
              4,
              "math.meanBy output",
            );
          },
        },
        {
          name: "median",
          run: () => {
            assertEqual(math.median([5, 1, 3]), 3, "math.median output");
          },
        },
        {
          name: "medianBy",
          run: () => {
            assertEqual(
              math.medianBy([{ n: 5 }, { n: 1 }, { n: 3 }], (item) => item.n),
              3,
              "math.medianBy output",
            );
          },
        },
        {
          name: "range",
          run: () => {
            assertDeepEqual(
              math.range(1, 5),
              [1, 2, 3, 4],
              "math.range output",
            );
          },
        },
        {
          name: "rangeRight",
          run: () => {
            assertDeepEqual(
              math.rangeRight(1, 5),
              [4, 3, 2, 1],
              "math.rangeRight output",
            );
          },
        },
        {
          name: "round",
          run: () => {
            assertEqual(math.round(1.2345, 2), 1.23, "math.round output");
          },
        },
        {
          name: "sum",
          run: () => {
            assertEqual(math.sum([1, 2, 3]), 6, "math.sum output");
          },
        },
        {
          name: "sumBy",
          run: () => {
            assertEqual(
              math.sumBy([{ n: 1 }, { n: 2 }, { n: 3 }], (item) => item.n),
              6,
              "math.sumBy output",
            );
          },
        },
      ],
    },
  ];
}

/**
 * Creates smoke-test suites for object helpers re-exported from es-toolkit.
 */
function createObjectSuites(): SmokeSuite[] {
  return [
    {
      name: "objects",
      checks: [
        {
          name: "clone",
          run: () => {
            const source = { nested: { count: 1 } };
            const cloned = objects.clone(source);

            assert(
              cloned !== source,
              "objects.clone should create a new object",
            );
            cloned.nested.count = 2;
            assertEqual(
              source.nested.count,
              2,
              "objects.clone should preserve shallow references",
            );
          },
        },
        {
          name: "cloneDeep",
          run: () => {
            const source = { nested: { count: 1 } };
            const cloned = objects.cloneDeep(source);

            cloned.nested.count = 2;

            assertEqual(
              source.nested.count,
              1,
              "objects.cloneDeep should isolate nested objects",
            );
            assertEqual(
              cloned.nested.count,
              2,
              "objects.cloneDeep mutated clone output",
            );
          },
        },
        {
          name: "findKey",
          run: () => {
            assertEqual(
              objects.findKey({ a: 1, b: 2, c: 3 }, (value) => value === 2),
              "b",
              "objects.findKey output",
            );
          },
        },
        {
          name: "flattenObject",
          run: () => {
            assertDeepEqual(
              objects.flattenObject({ a: { b: 1 }, c: 2 }),
              { "a.b": 1, c: 2 },
              "objects.flattenObject output",
            );
          },
        },
        {
          name: "invert",
          run: () => {
            assertDeepEqual(
              objects.invert({ a: "x", b: "y" }),
              { x: "a", y: "b" },
              "objects.invert output",
            );
          },
        },
        {
          name: "mapKeys",
          run: () => {
            assertDeepEqual(
              objects.mapKeys({ a: 1, b: 2 }, (_value, key) =>
                key.toUpperCase(),
              ),
              { A: 1, B: 2 },
              "objects.mapKeys output",
            );
          },
        },
        {
          name: "mapValues",
          run: () => {
            assertDeepEqual(
              objects.mapValues({ a: 1, b: 2 }, (value) => value * 10),
              { a: 10, b: 20 },
              "objects.mapValues output",
            );
          },
        },
        {
          name: "merge",
          run: () => {
            assertDeepEqual(
              objects.merge(
                { a: 1, nested: { x: 1 } },
                { b: 2, nested: { y: 2 } },
              ),
              { a: 1, b: 2, nested: { x: 1, y: 2 } },
              "objects.merge output",
            );
          },
        },
        {
          name: "mergeWith",
          run: () => {
            assertDeepEqual(
              objects.mergeWith(
                { items: [1] },
                { items: [2] },
                (objectValue, sourceValue) => {
                  if (
                    Array.isArray(objectValue) &&
                    Array.isArray(sourceValue)
                  ) {
                    return objectValue.concat(sourceValue);
                  }

                  return undefined;
                },
              ),
              { items: [1, 2] },
              "objects.mergeWith output",
            );
          },
        },
        {
          name: "omit",
          run: () => {
            assertDeepEqual(
              objects.omit({ a: 1, b: 2, c: 3 }, ["b"]),
              { a: 1, c: 3 },
              "objects.omit output",
            );
          },
        },
        {
          name: "omitBy",
          run: () => {
            assertDeepEqual(
              objects.omitBy({ a: 1, b: 2, c: 3 }, (value) => value % 2 === 0),
              { a: 1, c: 3 },
              "objects.omitBy output",
            );
          },
        },
        {
          name: "pick",
          run: () => {
            assertDeepEqual(
              objects.pick({ a: 1, b: 2, c: 3 }, ["a", "c"]),
              { a: 1, c: 3 },
              "objects.pick output",
            );
          },
        },
        {
          name: "pickBy",
          run: () => {
            assertDeepEqual(
              objects.pickBy({ a: 1, b: 2, c: 3 }, (value) => value >= 2),
              { b: 2, c: 3 },
              "objects.pickBy output",
            );
          },
        },
        {
          name: "toMerged",
          run: () => {
            assertDeepEqual(
              objects.toMerged(
                { a: 1, nested: { x: 1 } },
                { nested: { y: 2 } },
              ),
              { a: 1, nested: { x: 1, y: 2 } },
              "objects.toMerged output",
            );
          },
        },
      ],
    },
  ];
}

/**
 * Creates smoke-test suites for predicate helpers re-exported from es-toolkit.
 */
function createPredicateSuites(): SmokeSuite[] {
  return [
    {
      name: "predicates",
      checks: [
        {
          name: "isBoolean",
          run: () => {
            assertEqual(
              predicates.isBoolean(false),
              true,
              "predicates.isBoolean output",
            );
          },
        },
        {
          name: "isDate",
          run: () => {
            assertEqual(
              predicates.isDate(new Date("2024-01-01T00:00:00.000Z")),
              true,
              "predicates.isDate output",
            );
          },
        },
        {
          name: "isEmptyObject",
          run: () => {
            assertEqual(
              predicates.isEmptyObject({}),
              true,
              "predicates.isEmptyObject output",
            );
          },
        },
        {
          name: "isEqual",
          run: () => {
            assertEqual(
              predicates.isEqual({ a: 1, b: [2] }, { a: 1, b: [2] }),
              true,
              "predicates.isEqual output",
            );
          },
        },
        {
          name: "isError",
          run: () => {
            assertEqual(
              predicates.isError(new Error("boom")),
              true,
              "predicates.isError output",
            );
          },
        },
        {
          name: "isFunction",
          run: () => {
            assertEqual(
              predicates.isFunction(() => 1),
              true,
              "predicates.isFunction output",
            );
          },
        },
        {
          name: "isJSON",
          run: () => {
            assertEqual(
              predicates.isJSON('{"ok":true}'),
              true,
              "predicates.isJSON output",
            );
          },
        },
        {
          name: "isJSONValue",
          run: () => {
            assertEqual(
              predicates.isJSONValue({ a: [1, true, null] }),
              true,
              "predicates.isJSONValue output",
            );
          },
        },
        {
          name: "isMap",
          run: () => {
            assertEqual(
              predicates.isMap(new Map()),
              true,
              "predicates.isMap output",
            );
          },
        },
        {
          name: "isNil",
          run: () => {
            assertEqual(
              predicates.isNil(null),
              true,
              "predicates.isNil output",
            );
          },
        },
        {
          name: "isNotNil",
          run: () => {
            assertEqual(
              predicates.isNotNil(0),
              true,
              "predicates.isNotNil output",
            );
          },
        },
        {
          name: "isNull",
          run: () => {
            assertEqual(
              predicates.isNull(null),
              true,
              "predicates.isNull output",
            );
          },
        },
        {
          name: "isNumber",
          run: () => {
            assertEqual(
              predicates.isNumber(42),
              true,
              "predicates.isNumber output",
            );
          },
        },
        {
          name: "isPlainObject",
          run: () => {
            assertEqual(
              predicates.isPlainObject({ a: 1 }),
              true,
              "predicates.isPlainObject output",
            );
          },
        },
        {
          name: "isPrimitive",
          run: () => {
            assertEqual(
              predicates.isPrimitive("value"),
              true,
              "predicates.isPrimitive output",
            );
          },
        },
        {
          name: "isRegExp",
          run: () => {
            assertEqual(
              predicates.isRegExp(/value/),
              true,
              "predicates.isRegExp output",
            );
          },
        },
        {
          name: "isSet",
          run: () => {
            assertEqual(
              predicates.isSet(new Set()),
              true,
              "predicates.isSet output",
            );
          },
        },
        {
          name: "isString",
          run: () => {
            assertEqual(
              predicates.isString("value"),
              true,
              "predicates.isString output",
            );
          },
        },
        {
          name: "isUndefined",
          run: () => {
            assertEqual(
              predicates.isUndefined(undefined),
              true,
              "predicates.isUndefined output",
            );
          },
        },
      ],
    },
  ];
}

/**
 * Creates smoke-test suites for `Set` helpers re-exported from es-toolkit.
 */
function createSetSuites(): SmokeSuite[] {
  return [
    {
      name: "sets",
      checks: [
        {
          name: "countBy",
          run: () => {
            assertDeepEqual(
              toEntries(
                sets.countBy(new Set([1, 2, 3]), (value) =>
                  value % 2 === 0 ? "even" : "odd",
                ),
              ),
              [
                ["odd", 2],
                ["even", 1],
              ],
              "sets.countBy output",
            );
          },
        },
        {
          name: "every",
          run: () => {
            assertEqual(
              sets.every(new Set([1, 2, 3]), (value) => value > 0),
              true,
              "sets.every output",
            );
          },
        },
        {
          name: "filter",
          run: () => {
            assertDeepEqual(
              Array.from(
                sets.filter(new Set([1, 2, 3]), (value) => value >= 2),
              ),
              [2, 3],
              "sets.filter output",
            );
          },
        },
        {
          name: "find",
          run: () => {
            assertEqual(
              sets.find(new Set([1, 2, 3]), (value) => value === 2),
              2,
              "sets.find output",
            );
          },
        },
        {
          name: "keyBy",
          run: () => {
            assertDeepEqual(
              toEntries(
                sets.keyBy(
                  new Set([
                    { id: "a", value: 1 },
                    { id: "b", value: 2 },
                  ]),
                  (item) => item.id,
                ),
              ),
              [
                ["a", { id: "a", value: 1 }],
                ["b", { id: "b", value: 2 }],
              ],
              "sets.keyBy output",
            );
          },
        },
        {
          name: "map",
          run: () => {
            assertDeepEqual(
              Array.from(sets.map(new Set([1, 2, 3]), (value) => value * 10)),
              [10, 20, 30],
              "sets.map output",
            );
          },
        },
        {
          name: "reduce",
          run: () => {
            assertEqual(
              sets.reduce(new Set([1, 2, 3]), (sum, value) => sum + value, 0),
              6,
              "sets.reduce output",
            );
          },
        },
        {
          name: "some",
          run: () => {
            assertEqual(
              sets.some(new Set([1, 2, 3]), (value) => value === 2),
              true,
              "sets.some output",
            );
          },
        },
      ],
    },
  ];
}

/**
 * Creates smoke-test suites for core runtime helpers.
 */
function createCoreSuites(): SmokeSuite[] {
  return [
    {
      name: "core.error-helpers",
      checks: [
        {
          name: "assert throws PluginError on falsy conditions",
          run: () => {
            const expectedPosition = irb.position({
              file: "schema.vdl",
              line: 3,
              column: 5,
            });

            try {
              assertPlugin(false, "invalid operation", expectedPosition);
              fail("assertPlugin should throw for falsy values");
            } catch (error) {
              if (!(error instanceof PluginError)) {
                fail("assertPlugin error type");
              }

              assertEqual(
                error.message,
                "invalid operation",
                "assertPlugin message",
              );
              assertDeepEqual(
                error.position,
                expectedPosition,
                "assertPlugin position",
              );
            }
          },
        },
        {
          name: "fail throws PluginError with provided message",
          run: () => {
            try {
              failPlugin("generation failed");
              fail("failPlugin should always throw");
            } catch (error) {
              if (!(error instanceof PluginError)) {
                fail("failPlugin error type");
              }

              assertEqual(
                error.message,
                "generation failed",
                "failPlugin message",
              );
            }
          },
        },
      ],
    },
  ];
}

/**
 * Creates the smoke-test suites executed inside Goja.
 *
 * Each suite focuses on a small public area of the SDK so runtime failures can
 * be attributed quickly without mirroring the full unit-test suite.
 */
function createSuites(): SmokeSuite[] {
  return [
    ...createCoreSuites(),
    ...createStringSuites(),
    ...createOptionSuites(),
    ...createIrSuites(),
    ...createCodegenSuites(),
    ...createRpcSuites(),
    ...createPathSuites(),
    ...createYamlSuites(),
    ...createTomlSuites(),
    ...createCryptoSuites(),
    ...createMarkdownSuites(),
    ...createArraySuites(),
    ...createFunctionSuites(),
    ...createMapSuites(),
    ...createMathSuites(),
    ...createObjectSuites(),
    ...createPredicateSuites(),
    ...createSetSuites(),
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
