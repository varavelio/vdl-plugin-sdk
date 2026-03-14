import { words } from "./words";

/**
 * Converts a string to `kebab-case`.
 *
 * The function tokenizes the input with `words`, lowercases every token, and
 * joins the result with hyphens. This allows mixed casing conventions and noisy
 * separators to converge into a consistent kebab-cased string.
 *
 * Empty or separator-only inputs return an empty string.
 *
 * @example
 * kebabCase("UserProfileName")
 * // "user-profile-name"
 */
export function kebabCase(str: string): string {
  return words(str)
    .map((part) => part.toLowerCase())
    .join("-");
}
