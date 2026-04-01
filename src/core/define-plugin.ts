import { PluginError } from "./errors";
import type { PluginInput, PluginOutput, PluginOutputError } from "./types";

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
 * `definePlugin` wraps your implementation with a global safety net.
 *
 * Any thrown error is converted into the `PluginOutput` diagnostic contract,
 * so VDL can report failures cleanly instead of crashing with a raw stack trace.
 *
 * @param handler - The plugin implementation to expose as the runtime entry point.
 * @returns A safe handler that always returns `PluginOutput`.
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
  return (input: PluginInput): PluginOutput => {
    try {
      return handler(input);
    } catch (error) {
      return {
        files: [],
        errors: [toPluginError(error)],
      };
    }
  };
}

function toPluginError(error: unknown): PluginOutputError {
  if (error instanceof PluginError) {
    return {
      message: error.message,
      position: error.position,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: "An unknown generation error occurred.",
  };
}
