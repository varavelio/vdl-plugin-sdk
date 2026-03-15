import { words } from "./words";

/**
 * Converts a string to uppercase words separated by spaces.
 *
 * The input is normalized with `words`, then each token is uppercased and
 * joined using a single space. This is useful for readable labels, headings,
 * or enum-like display values derived from mixed naming conventions.
 *
 * Empty or separator-only inputs return an empty string.
 *
 * @param str - String to normalize.
 * @returns The uppercased space-separated representation of `str`.
 *
 * @example
 * upperCase("userProfileName")
 * // "USER PROFILE NAME"
 */
export function upperCase(str: string): string {
  return words(str)
    .map((part) => part.toUpperCase())
    .join(" ");
}
