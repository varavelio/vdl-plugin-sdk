import { words } from "./words";

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/**
 * Converts a string to `PascalCase`.
 *
 * The input is first tokenized with `words`, allowing the function to accept a
 * wide range of source formats such as `snake_case`, `kebab-case`, spaced
 * strings, `camelCase`, or acronym-heavy identifiers.
 *
 * Every token is normalized to an initial uppercase letter followed by a
 * lowercased remainder. Empty or separator-only inputs return an empty string.
 *
 * @example
 * pascalCase("user_profile-name")
 * // "UserProfileName"
 */
export function pascalCase(str: string): string {
  return words(str).map(capitalize).join("");
}
