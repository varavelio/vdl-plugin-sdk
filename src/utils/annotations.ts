import type { Annotation, LiteralValue } from "../types";

/**
 * Returns the first annotation that matches the provided name.
 */
export function getAnnotation(
  annotations: Annotation[] | undefined,
  name: string,
): Annotation | undefined {
  if (!annotations) return undefined;
  return annotations.find((anno) => anno.name === name);
}

/**
 * Returns the raw literal argument stored in an annotation.
 *
 * VDL annotations currently expose a single literal argument.
 * Pair this helper with `unwrapLiteral` when you need a plain JavaScript value.
 */
export function getAnnotationArgs(
  annotations: Annotation[] | undefined,
  name: string,
): LiteralValue | undefined {
  const anno = getAnnotation(annotations, name);
  return anno?.argument;
}
