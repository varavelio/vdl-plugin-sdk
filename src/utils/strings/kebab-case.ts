import { words } from "./words";

/**
 * Converts a string to `kebab-case`.
 *
 * The function tokenizes the input with `words`, lowercases every token, and
 * joins the result with hyphens. This allows mixed casing conventions and noisy
 * separators to converge into a consistent kebab-cased string.
 *
 * When `upperCase` is `true`, the same tokenization and joining rules are used,
 * but the final tokens are uppercased instead. This is useful for constants,
 * identifiers, or file names that still need kebab separators.
 *
 * Empty or separator-only inputs return an empty string.
 *
 * @example
 * kebabCase("UserProfileName")
 * // "user-profile-name"
 *
 * @example
 * kebabCase("UserProfileName", true)
 * // "USER-PROFILE-NAME"
 */
export function kebabCase(str: string, upperCase = false): string {
  return words(str)
    .map((part) => (upperCase ? part.toUpperCase() : part.toLowerCase()))
    .join("-");
}
