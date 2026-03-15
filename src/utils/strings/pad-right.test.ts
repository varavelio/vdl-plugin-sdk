import { describe, expect, it } from "vitest";
import { padRight } from "./pad-right";

describe("padRight", () => {
  it("pads the right side with spaces by default", () => {
    expect(padRight("cat", 5)).toBe("cat  ");
  });

  it("repeats and truncates custom padding characters", () => {
    expect(padRight("cat", 8, "_-")).toBe("cat_-_-_");
    expect(padRight("cat", 7, "ab")).toBe("catabab");
  });

  it("returns the original string when already at or above target length", () => {
    expect(padRight("cat", 3, "0")).toBe("cat");
    expect(padRight("cat", 2, "0")).toBe("cat");
  });

  it("returns the original string for empty custom padding", () => {
    expect(padRight("cat", 6, "")).toBe("cat");
  });

  it("truncates decimal lengths and ignores non-finite lengths", () => {
    expect(padRight("cat", 6.9, "0")).toBe("cat000");
    expect(padRight("cat", Number.NaN, "0")).toBe("cat");
  });

  it("counts Unicode code points when padding", () => {
    expect(padRight("a", 3, "🙂")).toBe("a🙂🙂");
  });
});
