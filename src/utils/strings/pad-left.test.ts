import { describe, expect, it } from "vitest";
import { padLeft } from "./pad-left";

describe("padLeft", () => {
  it("pads the left side with spaces by default", () => {
    expect(padLeft("cat", 5)).toBe("  cat");
  });

  it("repeats and truncates custom padding characters", () => {
    expect(padLeft("cat", 8, "_-")).toBe("_-_-_cat");
    expect(padLeft("cat", 7, "ab")).toBe("ababcat");
  });

  it("returns the original string when already at or above target length", () => {
    expect(padLeft("cat", 3, "0")).toBe("cat");
    expect(padLeft("cat", 2, "0")).toBe("cat");
  });

  it("returns the original string for empty custom padding", () => {
    expect(padLeft("cat", 6, "")).toBe("cat");
  });

  it("truncates decimal lengths and ignores non-finite lengths", () => {
    expect(padLeft("cat", 6.9, "0")).toBe("000cat");
    expect(padLeft("cat", Number.NaN, "0")).toBe("cat");
  });

  it("counts Unicode code points when padding", () => {
    expect(padLeft("a", 3, "🙂")).toBe("🙂🙂a");
  });
});
