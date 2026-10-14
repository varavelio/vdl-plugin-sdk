import type { Annotation } from "../../core/types";
import { getAnnotation } from "../ir/get-annotation";

/**
 * Reports whether an annotation list marks its symbol as deprecated.
 *
 * Presence alone decides. Any argument shape still counts as deprecated;
 * argument handling belongs to `getDeprecationMessage`.
 *
 * @param annotations - Annotation list from any annotated IR node.
 * @returns True when a `deprecated` annotation is present.
 *
 * @example
 * ```ts
 * isDeprecated(typeDef.annotations);
 * // returns true when `@deprecated` is present
 * ```
 */
export function isDeprecated(annotations: Annotation[] | undefined): boolean {
  return getAnnotation(annotations, "deprecated") !== undefined;
}
