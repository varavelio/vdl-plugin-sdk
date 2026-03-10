import type { LiteralValue } from "../types";

/**
 * Native JavaScript value produced by `unwrapLiteral`.
 *
 * `undefined` is preserved when a literal is missing its kind-specific payload.
 * `null` is returned for unknown literal kinds to keep the resolver non-throwing.
 */
export type UnwrappedLiteral =
  | string
  | number
  | boolean
  | null
  | undefined
  | UnwrappedLiteral[]
  | { [key: string]: UnwrappedLiteral };

/**
 * Resolves a `LiteralValue` into its native JavaScript representation.
 *
 * Pass a generic when you already know the expected shape.
 * Omit it to get `unknown` and narrow the result yourself.
 *
 * The generic only affects TypeScript types. It does not validate the runtime value.
 */
export function unwrapLiteral<T = unknown>(value: LiteralValue): T {
  return unwrapLiteralValue(value) as T;
}

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
