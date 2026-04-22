import { words } from "./words";

/**
 * Returns the first `n` normalized words from a string.
 *
 * Word boundaries are determined by the shared `words` tokenizer, which makes
 * this helper suitable for preview text, normalized identifiers, and compact
 * labels derived from mixed-case or separator-heavy inputs.
 *
 * When truncation happens, an ellipsis is appended by default. Non-positive and
 * non-finite lengths return an empty string.
 *
 * @param str - Source string to tokenize and shorten.
 * @param n - Maximum number of leading words to keep.
 * @param ellipsis - When `true`, appends `...` if truncation occurs.
 * @returns The leading normalized words, optionally suffixed with an ellipsis.
 *
 * @example
 * ```ts
 * firstNWords("HTTPServer_URL-v2", 2);
 * // "HTTP Server..."
 * ```
 */
export function firstNWords(str: string, n: number, ellipsis = true): string {
  const length = Number.isFinite(n) ? Math.trunc(n) : 0;

  if (length <= 0) {
    return "";
  }

  const tokenized = words(str);

  if (tokenized.length <= length) {
    return tokenized.join(" ");
  }

  const result = tokenized.slice(0, length).join(" ");
  return ellipsis ? `${result}...` : result;
}
