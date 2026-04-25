import type { Position } from "../../core/types";

const hasOwn = Object.prototype.hasOwnProperty;

/**
 * Object shape that explicitly carries IR source metadata.
 *
 * This type is used to provide stronger TypeScript guidance when callers pass
 * known IR-like objects. `sanitizeIr` also accepts generic objects through a
 * fallback overload, so this type is opt-in and non-breaking.
 */
export type SanitizeIrInput = {
  entryPoint?: string;
  position?: Position;
};

/**
 * Returns a deep-cloned copy of an object with source metadata redacted.
 *
 * Redaction rules:
 * - every `entryPoint` string is replaced with `""`
 * - every `position` object is replaced with `{ file: "schema.vdl", line: 1, column: 1 }`
 *
 * The traversal is recursive, covers nested objects and arrays, and never
 * mutates the input value. Non-object values are returned as-is.
 *
 * This helper is useful before snapshotting, hashing, logging, or emitting IR
 * outside trusted boundaries where absolute file paths should not leak.
 *
 * @param input - Object to sanitize.
 * @returns A new object with the same structure and redacted IR metadata.
 *
 * @example
 * ```ts
 * const safeIr = sanitizeIr(irSchema);
 * // safeIr.entryPoint === ""
 * // safeIr.types[0].position.file === "schema.vdl"
 * ```
 */
export function sanitizeIr<T extends SanitizeIrInput>(input: T): T;
export function sanitizeIr<T extends object>(input: T): T;
export function sanitizeIr<T extends object>(input: T): T {
  return sanitizeValue(input) as T;
}

/**
 * Recursively sanitizes one runtime value.
 */
function sanitizeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((currentItem) => sanitizeValue(currentItem));
  }

  if (!isRecord(value)) {
    return value;
  }

  const sanitizedRecord: Record<string, unknown> = {};

  for (const key in value) {
    if (!hasOwn.call(value, key)) {
      continue;
    }

    const currentValue = value[key];

    if (key === "entryPoint" && typeof currentValue === "string") {
      sanitizedRecord[key] = "";
      continue;
    }

    if (key === "position" && isRecord(currentValue)) {
      sanitizedRecord[key] = createSanitizedPosition();
      continue;
    }

    sanitizedRecord[key] = sanitizeValue(currentValue);
  }

  return sanitizedRecord;
}

/**
 * Creates the canonical redacted `Position` payload.
 */
function createSanitizedPosition(): Position {
  return {
    file: "schema.vdl",
    line: 1,
    column: 1,
  };
}

/**
 * Returns true when the value is a non-null record.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
