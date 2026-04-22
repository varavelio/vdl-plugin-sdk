/**
 * Returns the last `n` characters from a string.
 *
 * When truncation happens, an ellipsis is appended by default so generated
 * labels and previews can communicate that the returned segment is partial.
 *
 * Non-positive and non-finite lengths return an empty string.
 *
 * @param str - Source string to shorten.
 * @param n - Maximum number of trailing characters to keep.
 * @param ellipsis - When `true`, appends `...` if truncation occurs.
 * @returns The trailing character slice, optionally suffixed with an ellipsis.
 *
 * @example
 * ```ts
 * lastNChars("Hello world", 5);
 * // "world..."
 * ```
 */
export function lastNChars(str: string, n: number, ellipsis = true): string {
  const length = Number.isFinite(n) ? Math.trunc(n) : 0;

  if (length <= 0) {
    return "";
  }

  if (str.length <= length) {
    return str;
  }

  const result = str.slice(-length);
  return ellipsis ? `${result}...` : result;
}
