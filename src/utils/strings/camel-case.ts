import { words } from "./words";

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/**
 * Converts a string to `camelCase`.
 *
 * Tokenization is delegated to `words`, so mixed input styles such as
 * `snake_case`, `kebab-case`, `PascalCase`, `camelCase`, and separator-heavy
 * strings are normalized first and then reassembled.
 *
 * The first token is lowercased. Every following token is capitalized with the
 * remainder lowercased. Empty or separator-only inputs return an empty string.
 *
 * @param str - String to normalize.
 * @returns The `camelCase` representation of `str`.
 *
 * @example
 * camelCase("user_profile-name")
 * // "userProfileName"
 */
export function camelCase(str: string): string {
  const parts = words(str);

  if (parts.length === 0) {
    return "";
  }

  return parts
    .map((part, index) => (index === 0 ? part.toLowerCase() : capitalize(part)))
    .join("");
}
