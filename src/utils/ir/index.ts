/**
 * IR helper entry point for annotation lookup and literal unwrapping utilities.
 *
 * @example
 * ```ts
 * import { getAnnotation, unwrapLiteral } from "@varavel/vdl-plugin-sdk/utils";
 *
 * const annotation = getAnnotation(field.annotations, "default");
 * const value = annotation?.argument ? unwrapLiteral(annotation.argument) : undefined;
 * ```
 */
export * from "./get-annotation";
export * from "./get-annotation-arg";
export * from "./unwrap-literal";
