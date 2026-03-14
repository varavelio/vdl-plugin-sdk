import { describe, expect, it } from "vitest";

import { getOptionBool } from "./get-option-bool";

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
