import type { Annotation, LiteralValue } from "../../types";
import { getAnnotation } from "./get-annotation";

/**
 * Returns the raw literal argument stored in an annotation.
 *
 * VDL annotations currently expose a single literal argument.
 * Pair this helper with `unwrapLiteral` when you need a plain JavaScript value.
 */
export function getAnnotationArg(
  annotations: Annotation[] | undefined,
  name: string,
): LiteralValue | undefined {
  const anno = getAnnotation(annotations, name);
  return anno?.argument;
}
