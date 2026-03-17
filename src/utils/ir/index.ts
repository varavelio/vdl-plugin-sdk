/**
 * IR helper entry point for annotation lookup, literal unwrapping, and
 * anonymous-type hoisting utilities.
 *
 * @example
 * ```ts
 * import { ir } from "@varavel/vdl-plugin-sdk/utils";
 *
 * const annotation = ir.getAnnotation(field.annotations, "default");
 * const value = annotation?.argument
 *   ? ir.unwrapLiteral(annotation.argument)
 *   : undefined;
 * const flatSchema = ir.hoistAnonymousTypes(schema);
 * ```
 */

export * from "./get-annotation";
export * from "./get-annotation-arg";
export * from "./hoist-anonymous-types";
export * from "./unwrap-literal";
