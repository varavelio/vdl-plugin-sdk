/**
 * Main runtime entry point for the VDL Plugin SDK.
 *
 * Import from `@varavel/vdl-plugin-sdk` to define plugins and access the public
 * VDL IR types used by plugin handlers.
 *
 * @example
 * ```ts
 * import { definePlugin } from "@varavel/vdl-plugin-sdk";
 *
 * export const generate = definePlugin((input) => ({
 *   files: [
 *     {
 *       path: "version.txt",
 *       content: input.version,
 *     },
 *   ],
 * }));
 * ```
 */
import "./runtime";

export * from "./define-plugin";
export * from "./types";
