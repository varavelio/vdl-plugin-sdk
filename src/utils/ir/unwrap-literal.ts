import type { LiteralValue } from "../../types";

/**
 * Resolves a `LiteralValue` into its native JavaScript representation.
 *
 * Pass a generic when you already know the expected shape.
 * Omit it to get `unknown` and narrow the result yourself.
 *
 * The generic only affects TypeScript types. It does not validate the runtime value.
 *
 * @param value - The VDL literal to convert.
 * @returns The recursively unwrapped JavaScript value.
 *
 * @example
 * ```ts
 * const raw = unwrapLiteral({
 *   position: { file: "schema.vdl", line: 1, column: 1 },
 *   kind: "string",
 *   stringValue: "hello",
 * });
 * // returns "hello"
 * ```
 *
 * @example
 * ```ts
 * const value = unwrapLiteral<{ enabled: boolean }>(
 *   {
 *     position: { file: "schema.vdl", line: 1, column: 1 },
 *     kind: "object",
 *     objectEntries: [
 *       {
 *         position: { file: "schema.vdl", line: 1, column: 1 },
 *         key: "enabled",
 *         value: {
 *           position: { file: "schema.vdl", line: 1, column: 1 },
 *           kind: "bool",
 *           boolValue: true,
 *         },
 *       },
 *     ],
 *   },
 * );
 * // returns { enabled: true }
 * ```
 */
export function unwrapLiteral<T = unknown>(value: LiteralValue): T {
  return unwrapLiteralValue(value) as T;
}

/**
 * Native JavaScript value produced by `unwrapLiteral`.
 *
 * `undefined` is preserved when a literal is missing its kind-specific payload.
 * `null` is returned for unknown literal kinds to keep the resolver non-throwing.
 */
type UnwrappedLiteral =
  | string
  | number
  | boolean
  | null
  | undefined
  | UnwrappedLiteral[]
  | { [key: string]: UnwrappedLiteral };

/**
 * Performs the recursive literal resolution used by `unwrapLiteral`.
 */
function unwrapLiteralValue(value: LiteralValue): UnwrappedLiteral {
  switch (value.kind) {
    case "string":
      return value.stringValue;
    case "int":
      return value.intValue;
    case "float":
      return value.floatValue;
    case "bool":
      return value.boolValue;
    case "object": {
      const resolvedObject: { [key: string]: UnwrappedLiteral } = {};
      const entries = value.objectEntries ?? [];

      for (const entry of entries) {
        resolvedObject[entry.key] = unwrapLiteralValue(entry.value);
      }

      return resolvedObject;
    }
    case "array": {
      const items = value.arrayItems ?? [];
      return items.map((item) => unwrapLiteralValue(item));
    }
    default:
      return null;
  }
}
