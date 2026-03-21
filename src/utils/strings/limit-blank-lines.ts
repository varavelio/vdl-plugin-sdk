const cache = new Map<number, RegExp>();

/**
 * Limits the number of consecutive blank lines in a string.
 *
 * @param str - The string to process.
 * @param maxConsecutive - The maximum number of consecutive blank lines allowed.
 * Defaults to 0 (no blank lines allowed).
 * @returns The string with consecutive blank lines limited.
 *
 * @example
 * limitBlankLines("a\n\n\nb", 2)
 * // "a\n\n\nb"
 *
 * @example
 * limitBlankLines("a\n\n\n\nb", 2)
 * // "a\n\n\nb"
 *
 * @example
 * limitBlankLines("a\n\n\nb", 1)
 * // "a\n\nb"
 *
 * @example
 * limitBlankLines("a\n\n\nb", 0)
 * // "a\nb"
 */
export function limitBlankLines(str: string, maxConsecutive = 0): string {
  const limit = Math.max(0, maxConsecutive);
  let regex = cache.get(limit);

  if (!regex) {
    regex = new RegExp(`(\\r?\\n\\s*){${limit + 2},}`, "g");
    cache.set(limit, regex);
  }

  return str.replace(regex, "\n".repeat(limit + 1));
}
