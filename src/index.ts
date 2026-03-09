export * from "./types";

import type { PluginInput, PluginOutput } from "./types";

/**
 * Defines a VDL plugin handler function.
 *
 * @param input - The input data for the plugin containing the IR and other relevant information.
 * @returns The output data from the plugin containing the generated files and any errors.
 */
export type VdlPluginHandler = (input: PluginInput) => PluginOutput;

/**
 * Defines a VDL plugin by wrapping the provided handler function. This is a helper function
 * that can be used to create plugins in a more concise way.
 *
 * Example usage:
 * ```typescript
 * import { definePlugin } from "@varavel/vdl-plugin-sdk";
 *
 * export const generate = definePlugin((input) => {
 *  // Plugin logic goes here
 *  return {
 *    files: [],
 *    errors: []
 *  };
 * });
 * ```
 *
 * @param handler - The plugin handler function that contains the logic for processing the input and generating the output.
 * @returns The same handler function, which can be exported as the plugin's main entry point.
 */
export function definePlugin(handler: VdlPluginHandler): VdlPluginHandler {
  return handler;
}
