import { words } from "./words";

/**
 * Converts a string to `snake_case`.
 *
 * The input is tokenized with `words`, each token is lowercased, and the final
 * string is joined with underscores. This keeps the behavior aligned with the
 * shared SDK word-splitting rules.
 *
 * Empty or separator-only inputs return an empty string.
 *
 * @example
 * snakeCase("UserProfileName")
 * // "user_profile_name"
 */
export function snakeCase(str: string): string {
  return words(str)
    .map((part) => part.toLowerCase())
    .join("_");
}
