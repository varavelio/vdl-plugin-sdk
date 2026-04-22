import { words } from "./words";

/**
 * Returns the last `n` normalized words from a string.
 *
 * Word boundaries are determined by the shared `words` tokenizer, which makes
 * this helper suitable for preview text, normalized identifiers, and compact
 * labels derived from mixed-case or separator-heavy inputs.
 *
 * When truncation happens, an ellipsis is appended by default. Non-positive and
 * non-finite lengths return an empty string.
 *
 * @param str - Source string to tokenize and shorten.
 * @param n - Maximum number of trailing words to keep.
 * @param ellipsis - When `true`, appends `...` if truncation occurs.
 * @returns The trailing normalized words, optionally suffixed with an ellipsis.
 *
 * @example
 * ```ts
 * lastNWords("HTTPServer_URL-v2", 2);
 * // "URL v2..."
 * ```
 */
export function lastNWords(str: string, n: number, ellipsis = true): string {
  const length = Number.isFinite(n) ? Math.trunc(n) : 0;

  if (length <= 0) {
    return "";
  }

  const tokenized = words(str);

  if (tokenized.length <= length) {
    return tokenized.join(" ");
  }

  const result = tokenized.slice(-length).join(" ");
  return ellipsis ? `${result}...` : result;
}
