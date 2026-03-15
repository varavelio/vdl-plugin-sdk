import { trimWithCharacters } from "./trim-internal";

/**
 * Removes matching characters from the end of a string.
 *
 * By default, the function trims trailing whitespace using the platform's
 * built-in whitespace semantics.
 *
 * When `chars` is provided, only those characters are removed from the end.
 * A string value is interpreted as a set of individual characters, and an
 * array combines all characters from all entries.
 *
 * Matching characters that appear earlier in the string are preserved.
 *
 * @param str - String to trim.
 * @param chars - Optional characters to remove instead of whitespace.
 * @returns A copy of `str` without the matching trailing characters.
 *
 * @example
 * trimEnd("  hello  ")
 * // "  hello"
 *
 * @example
 * trimEnd("__hello__", "_")
 * // "__hello"
 */
export function trimEnd(
  str: string,
  chars?: string | readonly string[],
): string {
  return trimWithCharacters(str, chars, "end");
}
