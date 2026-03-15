import { trimWithCharacters } from "./trim-internal";

/**
 * Removes matching characters from both ends of a string.
 *
 * By default, the function trims leading and trailing whitespace using the
 * platform's built-in whitespace semantics.
 *
 * When `chars` is provided, only those characters are trimmed from the start
 * and end of the string. A string value is interpreted as a set of individual
 * characters, and an array combines all characters from all entries.
 * For example, `trim("__value--", "_-")` and
 * `trim("__value--", ["_", "-"])` both return `"value"`.
 *
 * Characters are removed only at the outer edges; matching characters inside
 * the string are preserved.
 *
 * @example
 * trim("  hello  ")
 * // "hello"
 *
 * @example
 * trim("__hello--", ["_", "-"])
 * // "hello"
 */
export function trim(str: string, chars?: string | readonly string[]): string {
  return trimWithCharacters(str, chars, "both");
}
