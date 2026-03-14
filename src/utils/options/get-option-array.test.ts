import { describe, expect, it } from "vitest";

import { getOptionArray } from "./get-option-array";

describe("getOptionArray", () => {
  it("splits and trims comma-separated values", () => {
    expect(getOptionArray({ tags: "api, core , v1" }, "tags")).toEqual([
      "api",
      "core",
      "v1",
    ]);
  });

  it("supports custom separators", () => {
    expect(getOptionArray({ tags: "api|core|v1" }, "tags", [], "|")).toEqual([
      "api",
      "core",
      "v1",
    ]);
  });

  it("returns the fallback for missing values", () => {
    expect(getOptionArray(undefined, "tags", ["default"])).toEqual(["default"]);
    expect(getOptionArray({}, "tags", ["default"])).toEqual(["default"]);
  });

  it("returns an empty array for blank values and removes empty items", () => {
    expect(getOptionArray({ tags: "   " }, "tags", ["default"])).toEqual([]);
    expect(getOptionArray({ tags: "api,, core,  ,v1" }, "tags")).toEqual([
      "api",
      "core",
      "v1",
    ]);
  });
});
