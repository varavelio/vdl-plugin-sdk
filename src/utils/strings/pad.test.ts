import { describe, expect, it } from "vitest";
import { pad } from "./pad";

describe("pad", () => {
  it("pads both sides with spaces by default", () => {
    expect(pad("cat", 7)).toBe("  cat  ");
    expect(pad("cat", 8)).toBe("  cat   ");
  });

  it("puts the extra padding character on the right when needed", () => {
    expect(pad("cat", 6, "_")).toBe("_cat__");
  });

  it("repeats and truncates custom padding characters", () => {
    expect(pad("cat", 9, "_-")).toBe("_-_cat_-_");
    expect(pad("cat", 8, "ab")).toBe("abcataba");
  });

  it("returns the original string when already at or above target length", () => {
    expect(pad("cat", 3)).toBe("cat");
    expect(pad("cat", 2)).toBe("cat");
    expect(pad("cat", -1)).toBe("cat");
  });

  it("returns the original string for empty custom padding", () => {
    expect(pad("cat", 6, "")).toBe("cat");
  });

  it("truncates decimal lengths and ignores non-finite lengths", () => {
    expect(pad("cat", 6.9, "_")).toBe("_cat__");
    expect(pad("cat", Number.NaN, "_")).toBe("cat");
    expect(pad("cat", Number.POSITIVE_INFINITY, "_")).toBe("cat");
  });

  it("counts Unicode code points when padding", () => {
    expect(pad("a", 3, "🙂")).toBe("🙂a🙂");
  });
});
