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
  let regex = cache.get(maxConsecutive);

  if (!regex) {
    regex = new RegExp(`(\\n\\s*){${maxConsecutive + 2},}`, "g");
    cache.set(maxConsecutive, regex);
  }

  return str.replace(regex, "\n".repeat(maxConsecutive + 1));
}
