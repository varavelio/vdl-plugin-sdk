const ACRONYM_TO_CAPITALIZED_WORD_BOUNDARY_RE = /([A-Z]+)([A-Z][a-z])/g;
const LOWERCASE_OR_DIGIT_TO_UPPERCASE_BOUNDARY_RE = /([a-z0-9])([A-Z])/g;
const NON_ALPHANUMERIC_SEQUENCE_RE = /[^A-Za-z0-9]+/g;
const WHITESPACE_SEQUENCE_RE = /\s+/;

/**
 * Splits a string into normalized word tokens.
 *
 * The function preserves the current tokenization rules used by the SDK:
 * it inserts spaces at camelCase and acronym-to-word boundaries, converts any
 * non-alphanumeric separator to a space, trims the result, and then splits on
 * whitespace.
 *
 * This makes it suitable for inputs such as `camelCase`, `PascalCase`,
 * `HTTPServer`, `snake_case`, `kebab-case`, and mixed separator variants.
 *
 * Empty or separator-only inputs return an empty array.
 *
 * @param str - String to tokenize.
 * @returns An array of normalized word tokens.
 *
 * @example
 * ```ts
 * words("HTTPServer_error-code");
 * // returns ["HTTP", "Server", "error", "code"]
 * ```
 */
export function words(str: string): string[] {
  const normalized = str
    .replace(ACRONYM_TO_CAPITALIZED_WORD_BOUNDARY_RE, "$1 $2")
    .replace(LOWERCASE_OR_DIGIT_TO_UPPERCASE_BOUNDARY_RE, "$1 $2")
    .replace(NON_ALPHANUMERIC_SEQUENCE_RE, " ")
    .trim();

  return normalized.length === 0
    ? []
    : normalized.split(WHITESPACE_SEQUENCE_RE);
}
