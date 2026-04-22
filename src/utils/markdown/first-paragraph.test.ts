import { describe, expect, it } from "vitest";

import { firstParagraph } from "./first-paragraph";

describe("firstParagraph", () => {
  it("should return the first non-heading paragraph", () => {
    expect(
      firstParagraph("# Title\n\nFirst paragraph\n\nSecond paragraph"),
    ).toBe("First paragraph");
  });

  it("should trim the returned paragraph", () => {
    expect(firstParagraph("\n\n  Summary line  \n\nAnother line")).toBe(
      "Summary line",
    );
  });

  it("should return undefined when there is no paragraph content", () => {
    expect(firstParagraph("# Title\n\n## Section")).toBeUndefined();
  });
});
