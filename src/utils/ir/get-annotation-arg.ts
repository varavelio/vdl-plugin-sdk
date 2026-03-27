import type { Annotation, LiteralValue } from "../../core/types";
import { getAnnotation } from "./get-annotation";

/**
 * Returns the raw literal argument stored in an annotation.
 *
 * VDL annotations currently expose a single literal argument.
 * Pair this helper with `unwrapLiteral` when you need a plain JavaScript value.
 *
 * @param annotations - Annotation list to search.
 * @param name - Annotation name whose argument should be returned.
 * @returns The annotation argument as a `LiteralValue`, or `undefined` when the annotation or argument is missing.
 *
 * @example
 * ```ts
 * const arg = getAnnotationArg(field.annotations, "length");
 * // returns the raw annotation literal, such as { kind: "int", intValue: 64, ... }
 * ```
 */
export function getAnnotationArg(
  annotations: Annotation[] | undefined,
  name: string,
): LiteralValue | undefined {
  const anno = getAnnotation(annotations, name);
  return anno?.argument;
}
