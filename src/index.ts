import type { PluginInput, PluginOutput } from "./types";

export type VdlPluginHandler = (input: PluginInput) => PluginOutput;

export function definePlugin(handler: VdlPluginHandler): VdlPluginHandler {
  return handler;
}
