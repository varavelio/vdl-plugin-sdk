import { describe, expect, it } from "vitest";
import { assert, fail, PluginError } from "./errors";
import type { Position } from "./types";

const sourcePosition: Position = {
  file: "schema.vdl",
  line: 8,
  column: 12,
};

describe("PluginError", () => {
  it("preserves message and position", () => {
    const error = new PluginError("Invalid RPC shape", sourcePosition);

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("PluginError");
    expect(error.message).toBe("Invalid RPC shape");
    expect(error.position).toEqual(sourcePosition);
  });
});

describe("fail", () => {
  it("throws a PluginError with the provided message and position", () => {
    expect(() => fail("Missing output type", sourcePosition)).toThrowError(
      PluginError,
    );

    try {
      fail("Missing output type", sourcePosition);
    } catch (error) {
      expect(error).toBeInstanceOf(PluginError);
      expect(error).toMatchObject({
        message: "Missing output type",
        position: sourcePosition,
      });
    }
  });
});

describe("assert", () => {
  it("does not throw when condition is truthy", () => {
    expect(() => assert(true, "should not fail", sourcePosition)).not.toThrow();
  });

  it("throws a PluginError when condition is falsy", () => {
    expect(() => assert(false, "Expected @proc field", sourcePosition)).toThrow(
      PluginError,
    );
  });
});
