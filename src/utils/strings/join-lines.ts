/**
 * Joins lines into one string after removing blank entries.
 *
 * A line is considered blank when it is empty or contains only whitespace.
 * Non-blank lines keep their original content and ordering.
 *
 * @param lines - Array of lines to normalize and join.
 * @returns The resulting multi-line string with blank lines removed.
 *
 * @example
 * ```ts
 * joinLines(["first", "", "  ", "second"]);
 * // returns "first\nsecond"
 * ```
 */
export function joinLines(lines: string[]): string {
  return lines.filter((line) => line.trim().length > 0).join("\n");
}
