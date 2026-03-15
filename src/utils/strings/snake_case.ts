import { words } from "./words";

/**
 * Converts a string to `snake_case`.
 *
 * The input is tokenized with `words`, each token is lowercased, and the final
 * string is joined with underscores. This keeps the behavior aligned with the
 * shared SDK word-splitting rules.
 *
 * When `upperCase` is `true`, the same tokenization and joining behavior is
 * preserved but the final tokens are uppercased instead. This is useful for
 * environment variable names and constant-like identifiers.
 *
 * Empty or separator-only inputs return an empty string.
 *
 * @example
 * snakeCase("UserProfileName")
 * // "user_profile_name"
 *
 * @example
 * snakeCase("UserProfileName", true)
 * // "USER_PROFILE_NAME"
 */
export function snakeCase(str: string, upperCase = false): string {
  return words(str)
    .map((part) => (upperCase ? part.toUpperCase() : part.toLowerCase()))
    .join("_");
}
