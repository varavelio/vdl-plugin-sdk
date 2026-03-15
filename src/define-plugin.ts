import type { PluginInput, PluginOutput } from "./types";

/**
 * Function signature implemented by every VDL plugin entry point.
 *
 * The handler receives the typed plugin input produced by VDL and returns the
 * generated files and any diagnostics for the current run.
 *
 * @param input - The plugin invocation context, including version, options, and IR.
 * @returns The files and errors produced by the plugin.
 *
 * @example
 * ```ts
 * const generate: VdlPluginHandler = (input) => {
 *   return {
 *     files: [{ path: "hello.txt", content: input.version }],
 *   };
 * };
 * ```
 */
export type VdlPluginHandler = (input: PluginInput) => PluginOutput;

/**
 * Wraps a plugin handler so it can be exported as the canonical VDL entry point.
 *
 * `definePlugin` is intentionally minimal. It preserves the handler's type
 * information and gives plugin projects a single, explicit pattern for exporting
 * `generate` from `src/index.ts`.
 *
 * @param handler - The plugin implementation to expose as the runtime entry point.
 * @returns The same handler function, unchanged.
 *
 * @example
 * ```ts
 * import { definePlugin } from "@varavel/vdl-plugin-sdk";
 *
 * export const generate = definePlugin((input) => {
 *   return {
 *     files: [
 *       {
 *         path: "schema-summary.txt",
 *         content: `VDL ${input.version}`,
 *       },
 *     ],
 *   };
 * });
 * ```
 */
export function definePlugin(handler: VdlPluginHandler): VdlPluginHandler {
  return handler;
}
