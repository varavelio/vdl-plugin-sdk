import { describe, expect, it } from "vitest";

import { limitBlankLines } from "./limit-blank-lines";

describe("limitBlankLines", () => {
  it("should remove all blank lines when maxConsecutive is 0", () => {
    expect(limitBlankLines("line1\n\nline2")).toBe("line1\nline2");
    expect(limitBlankLines("line1\n\n\nline2")).toBe("line1\nline2");
    expect(limitBlankLines("line1\n  \n\nline2")).toBe("line1\nline2");
  });

  it("should limit to 1 blank line when maxConsecutive is 1", () => {
    expect(limitBlankLines("line1\n\nline2", 1)).toBe("line1\n\nline2");
    expect(limitBlankLines("line1\n\n\nline2", 1)).toBe("line1\n\nline2");
    expect(limitBlankLines("line1\n\n\n\nline2", 1)).toBe("line1\n\nline2");
  });

  it("should limit to 2 blank lines when maxConsecutive is 2", () => {
    expect(limitBlankLines("line1\n\n\nline2", 2)).toBe("line1\n\n\nline2");
    expect(limitBlankLines("line1\n\n\n\nline2", 2)).toBe("line1\n\n\nline2");
    expect(limitBlankLines("line1\n\n\n\n\nline2", 2)).toBe("line1\n\n\nline2");
  });

  it("should handle mixed whitespace in blank lines", () => {
    expect(limitBlankLines("line1\n \n\t\nline2", 1)).toBe("line1\n\nline2");
  });

  it("should handle strings without blank lines", () => {
    expect(limitBlankLines("line1\nline2")).toBe("line1\nline2");
    expect(limitBlankLines("line1line2")).toBe("line1line2");
  });

  it("should handle blank lines at the beginning or end", () => {
    expect(limitBlankLines("\n\nline1", 0)).toBe("\nline1");
    expect(limitBlankLines("line1\n\n", 0)).toBe("line1\n");
  });

  it("should handle windows-style line endings", () => {
    expect(limitBlankLines("line1\r\n\r\nline2", 0)).toBe("line1\nline2");
    expect(limitBlankLines("line1\r\n\r\n\r\nline2", 1)).toBe("line1\n\nline2");
  });

  it("should treat negative maxConsecutive as 0", () => {
    expect(limitBlankLines("line1\n\nline2", -1)).toBe("line1\nline2");
  });
});
