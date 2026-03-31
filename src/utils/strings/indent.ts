/**
 * Adds an indentation prefix to every non-blank line in a multi-line string.
 *
 * This is the inverse operation of `dedent` and is useful when injecting a
 * generated block inside a nested structure (for example, inside a class,
 * interface, or function body).
 *
 * Empty and whitespace-only lines are preserved without extra indentation to
 * avoid introducing trailing spaces.
 *
 * @param input - Multi-line string to indent.
 * @param prefix - String to prepend to each non-blank line. Defaults to two spaces.
 * @returns The input text with indentation applied line by line.
 *
 * @example
 * ```ts
 * indent("name: string;\nactive: boolean;");
 * // returns "  name: string;\n  active: boolean;"
 * ```
 *
 * @example
 * ```ts
 * indent("field string\nfield int", "\t");
 * // returns "\tfield string\n\tfield int"
 * ```
 */
export function indent(input: string, prefix = "  "): string {
  if (input.length === 0 || prefix.length === 0) {
    return input;
  }

  return input
    .split("\n")
    .map((line) => {
      if (line.trim().length === 0) {
        return line;
      }

      return `${prefix}${line}`;
    })
    .join("\n");
}
