import { describe, expect, it } from "vitest";

import {
  getOptionArray,
  getOptionBool,
  getOptionNumber,
  getOptionString,
} from "./options";

describe("getOptionString", () => {
  it("returns the stored string value", () => {
    expect(getOptionString({ prefix: "Api" }, "prefix", "Model")).toBe("Api");
  });

  it("returns the fallback when the key is missing", () => {
    expect(getOptionString(undefined, "prefix", "Model")).toBe("Model");
    expect(getOptionString({}, "prefix", "Model")).toBe("Model");
  });
});

describe("getOptionBool", () => {
  it("parses common truthy values", () => {
    expect(getOptionBool({ enabled: "true" }, "enabled", false)).toBe(true);
    expect(getOptionBool({ enabled: "  YES " }, "enabled", false)).toBe(true);
    expect(getOptionBool({ enabled: "1" }, "enabled", false)).toBe(true);
    expect(getOptionBool({ enabled: "on" }, "enabled", false)).toBe(true);
  });

  it("parses common falsy values", () => {
    expect(getOptionBool({ enabled: "false" }, "enabled", true)).toBe(false);
    expect(getOptionBool({ enabled: " no " }, "enabled", true)).toBe(false);
    expect(getOptionBool({ enabled: "0" }, "enabled", true)).toBe(false);
    expect(getOptionBool({ enabled: "off" }, "enabled", true)).toBe(false);
  });

  it("returns the fallback for missing or invalid values", () => {
    expect(getOptionBool(undefined, "enabled", true)).toBe(true);
    expect(getOptionBool({}, "enabled", false)).toBe(false);
    expect(getOptionBool({ enabled: "maybe" }, "enabled", true)).toBe(true);
  });
});

describe("getOptionNumber", () => {
  it("parses numeric values", () => {
    expect(getOptionNumber({ version: "2" }, "version", 1)).toBe(2);
    expect(getOptionNumber({ version: " 3.5 " }, "version", 1)).toBe(3.5);
  });

  it("returns the fallback for missing, empty, or invalid values", () => {
    expect(getOptionNumber(undefined, "version", 1)).toBe(1);
    expect(getOptionNumber({}, "version", 1)).toBe(1);
    expect(getOptionNumber({ version: "   " }, "version", 1)).toBe(1);
    expect(getOptionNumber({ version: "hello" }, "version", 1)).toBe(1);
    expect(getOptionNumber({ version: "Infinity" }, "version", 1)).toBe(1);
  });
});

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
