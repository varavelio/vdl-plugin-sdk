import type { Annotation } from "../../core/types";
import { getAnnotationArg } from "../ir/get-annotation-arg";

/**
 * Returns the human-readable deprecation message, when one exists.
 *
 * Only a string argument counts as the VPP-1 message. A missing argument or
 * a non-string argument yields `undefined` while the symbol stays deprecated;
 * use `isDeprecated` for presence.
 *
 * @param annotations - Annotation list from any annotated IR node.
 * @returns The string message, or `undefined` when absent or non-string.
 *
 * @example
 * ```ts
 * getDeprecationMessage(field.annotations);
 * // returns "Use primaryEmail instead." for `@deprecated("Use primaryEmail instead.")`
 * ```
 */
export function getDeprecationMessage(
  annotations: Annotation[] | undefined,
): string | undefined {
  const argument = getAnnotationArg(annotations, "deprecated");
  if (!argument || argument.kind !== "string") {
    return undefined;
  }
  return argument.stringValue;
}
