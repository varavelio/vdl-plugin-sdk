import { describe, expect, it } from "vitest";

import { firstNChars } from "./first-n-chars";

describe("firstNChars", () => {
  it("returns the first N characters and appends ellipsis by default when truncating", () => {
    expect(firstNChars("Hello world", 5)).toBe("Hello...");
  });

  it("returns the original string unchanged when it is already short enough", () => {
    expect(firstNChars("Hello", 10)).toBe("Hello");
  });

  it("supports disabling ellipsis and handles non-positive lengths", () => {
    expect(firstNChars("Hello world", 5, false)).toBe("Hello");
    expect(firstNChars("Hello world", 0)).toBe("");
  });
});
