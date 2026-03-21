// @ts-expect-error pluralize does not provide a standard ESM export that esbuild likes for IIFE bundling
import pluralizeLibrary from "pluralize/pluralize.js";

/**
 * Pluralize or singularize a word based on a count.
 *
 * This function uses a pre-defined list of rules, applied in order, to singularize
 * or pluralize a given word.
 *
 * @param word - The word to pluralize or singularize.
 * @param count - Optional number indicating how many of the word exist.
 *                - If `1`, returns the singular form.
 *                - If other than `1`, returns the plural form.
 * @param inclusive - Whether to prefix the result with the number (e.g., "3 ducks").
 *                    Defaults to `false`.
 * @returns The pluralized or singularized word, optionally prefixed by the count.
 *
 * @example
 * ```ts
 * pluralize('test')
 * // "tests"
 *
 * pluralize('test', 1)
 * // "test"
 *
 * pluralize('test', 5, true)
 * // "5 tests"
 *
 * pluralize('person', 2)
 * // "people"
 * ```
 *
 * @see Powered by `pluralize` (MIT License): [https://github.com/plurals/pluralize](https://github.com/plurals/pluralize)
 */
export function pluralize(
  word: string,
  count?: number,
  inclusive?: boolean,
): string {
  // biome-ignore lint/suspicious/noExplicitAny: the imported module behaves as a function in this context
  return (pluralizeLibrary as any)(word, count, inclusive);
}
