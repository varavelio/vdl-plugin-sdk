import type { Position } from "./types";

/**
 * Error type for plugin generation failures that should be surfaced as
 * structured VDL diagnostics.
 *
 * Use this when you need to preserve an optional source `position`.
 */
export class PluginError extends Error {
  readonly position?: Position;

  constructor(message: string, position?: Position) {
    super(message);
    this.name = "PluginError";
    this.position = position;
  }
}

/**
 * Immediately aborts generation by throwing a `PluginError`.
 *
 * @param message - Human-readable description of what failed.
 * @param position - Optional source location for precise diagnostics.
 */
export function fail(message: string, position?: Position): never {
  throw new PluginError(message, position);
}

/**
 * Ensures `condition` is truthy, otherwise throws a `PluginError`.
 *
 * The `asserts condition` return type enables TypeScript narrowing in plugin
 * code after this function returns.
 *
 * @param condition - Condition that must hold.
 * @param message - Diagnostic message when the condition fails.
 * @param position - Optional source location for precise diagnostics.
 */
export function assert(
  condition: unknown,
  message: string,
  position?: Position,
): asserts condition {
  if (!condition) {
    throw new PluginError(message, position);
  }
}
