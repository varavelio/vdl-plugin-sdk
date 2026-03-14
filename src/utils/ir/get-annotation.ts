import type { Annotation } from "../../types";

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
