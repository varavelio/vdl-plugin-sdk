import { words } from "./words";

/**
 * Converts a string to lowercase words separated by spaces.
 *
 * The input is normalized with `words`, then each token is lowercased and
 * joined using a single space. This is useful when a readable, sentence-like
 * representation is preferred over identifier-style separators.
 *
 * Empty or separator-only inputs return an empty string.
 *
 * @param str - String to normalize.
 * @returns The lowercased space-separated representation of `str`.
 *
 * @example
 * lowerCase("userProfileName")
 * // "user profile name"
 */
export function lowerCase(str: string): string {
  return words(str)
    .map((part) => part.toLowerCase())
    .join(" ");
}
