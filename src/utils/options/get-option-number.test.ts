import { describe, expect, it } from "vitest";

import { getOptionNumber } from "./get-option-number";

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
