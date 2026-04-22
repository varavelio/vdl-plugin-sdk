/**
 * Returns the first `n` characters from a string.
 *
 * When truncation happens, an ellipsis is appended by default so generated
 * labels and previews can communicate that more content exists beyond the
 * returned segment.
 *
 * Non-positive and non-finite lengths return an empty string.
 *
 * @param str - Source string to shorten.
 * @param n - Maximum number of leading characters to keep.
 * @param ellipsis - When `true`, appends `...` if truncation occurs.
 * @returns The leading character slice, optionally suffixed with an ellipsis.
 *
 * @example
 * ```ts
 * firstNChars("Hello world", 5);
 * // "Hello..."
 * ```
 */
export function firstNChars(str: string, n: number, ellipsis = true): string {
  const length = Number.isFinite(n) ? Math.trunc(n) : 0;

  if (length <= 0) {
    return "";
  }

  if (str.length <= length) {
    return str;
  }

  const result = str.slice(0, length);
  return ellipsis ? `${result}...` : result;
}
