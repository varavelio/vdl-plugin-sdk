import type { Annotation } from "../../types";

/**
 * Returns the first annotation that matches the provided name.
 *
 * Annotation names are compared exactly as stored in the IR, without adding or
 * removing an `@` prefix.
 *
 * @param annotations - Annotation list to search.
 * @param name - Annotation name to match.
 * @returns The matching annotation, or `undefined` when it is not present.
 *
 * @example
 * ```ts
 * const annotation = getAnnotation(field.annotations, "deprecated");
 * // returns the first `deprecated` annotation or undefined
 * ```
 */
export function getAnnotation(
  annotations: Annotation[] | undefined,
  name: string,
): Annotation | undefined {
  if (!annotations) return undefined;
  return annotations.find((anno) => anno.name === name);
}
