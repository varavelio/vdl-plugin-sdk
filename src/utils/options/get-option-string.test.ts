import { describe, expect, it } from "vitest";

import { getOptionString } from "./get-option-string";

describe("getOptionString", () => {
  it("returns the stored string value", () => {
    expect(getOptionString({ prefix: "Api" }, "prefix", "Model")).toBe("Api");
  });

  it("returns the fallback when the key is missing", () => {
    expect(getOptionString(undefined, "prefix", "Model")).toBe("Model");
    expect(getOptionString({}, "prefix", "Model")).toBe("Model");
  });
});
