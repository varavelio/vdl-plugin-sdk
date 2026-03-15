import { trimWithCharacters } from "./trim-internal";

/**
 * Removes matching characters from the start of a string.
 *
 * By default, the function trims leading whitespace using the platform's
 * built-in whitespace semantics.
 *
 * When `chars` is provided, only those characters are removed from the start.
 * A string value is interpreted as a set of individual characters, and an
 * array combines all characters from all entries.
 *
 * Matching characters that appear later in the string are preserved.
 *
 * @example
 * trimStart("  hello  ")
 * // "hello  "
 *
 * @example
 * trimStart("__hello__", "_")
 * // "hello__"
 */
export function trimStart(
  str: string,
  chars?: string | readonly string[],
): string {
  return trimWithCharacters(str, chars, "start");
}
