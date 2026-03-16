import dedentLibrary from "dedent";

/**
 * Removes shared indentation from a multi-line string.
 *
 * This helper is useful for generating readable code templates, markdown, or
 * text fixtures inside plugins without carrying indentation from the source file
 * into the final output.
 *
 * @param input - Multi-line string to dedent.
 * @returns The same text with common indentation removed.
 *
 * @example
 * ```ts
 * dedent(`
 *          export interface User {
 *            id: string;
 *          }
 * `);
 * // returns "export interface User {\n  id: string;\n}"
 * ```
 *
 * @see Powered by `dedent` (MIT License): https://github.com/dmnd/dedent
 */
export function dedent(input: string): string {
  return dedentLibrary(input);
}
