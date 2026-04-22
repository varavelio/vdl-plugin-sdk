import { describe, expect, it } from "vitest";

import { lastNChars } from "./last-n-chars";

describe("lastNChars", () => {
  it("returns the last N characters and appends ellipsis by default when truncating", () => {
    expect(lastNChars("Hello world", 5)).toBe("world...");
  });

  it("returns the original string unchanged when it is already short enough", () => {
    expect(lastNChars("Hello", 10)).toBe("Hello");
  });

  it("supports disabling ellipsis and handles non-positive lengths", () => {
    expect(lastNChars("Hello world", 5, false)).toBe("world");
    expect(lastNChars("Hello world", 0)).toBe("");
  });
});
