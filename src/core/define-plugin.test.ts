import { describe, expect, it } from "vitest";

import { pluginInput, position } from "../testing";
import { definePlugin } from "./define-plugin";
import { PluginError } from "./errors";

describe("definePlugin", () => {
  it("returns generated output when handler succeeds", () => {
    const generate = definePlugin(() => {
      return {
        files: [{ path: "schema-summary.txt", content: "ok" }],
      };
    });

    expect(generate(pluginInput())).toEqual({
      files: [{ path: "schema-summary.txt", content: "ok" }],
    });
  });

  it("converts PluginError into structured diagnostics", () => {
    const errorPosition = position({
      file: "schema.vdl",
      line: 20,
      column: 7,
    });
    const generate = definePlugin(() => {
      throw new PluginError(
        "Operation output must be an object",
        errorPosition,
      );
    });

    expect(generate(pluginInput())).toEqual({
      files: [],
      errors: [
        {
          message: "Operation output must be an object",
          position: errorPosition,
        },
      ],
    });
  });

  it("converts native Error instances into plugin diagnostics", () => {
    const generate = definePlugin(() => {
      throw new Error("Unexpected null reference");
    });

    expect(generate(pluginInput())).toEqual({
      files: [],
      errors: [{ message: "Unexpected null reference" }],
    });
  });

  it("converts unknown throw values into a safe fallback diagnostic", () => {
    const generate = definePlugin(() => {
      throw "oops";
    });

    expect(generate(pluginInput())).toEqual({
      files: [],
      errors: [{ message: "An unknown generation error occurred." }],
    });
  });
});
