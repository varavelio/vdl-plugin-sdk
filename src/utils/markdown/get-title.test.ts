import { describe, expect, it } from "vitest";

import { getTitle } from "./get-title";

describe("getTitle", () => {
  it("should return the first Markdown heading", () => {
    expect(getTitle("# Hello World\n\nSome content")).toBe("Hello World");
  });

  it("should return the first heading even when it appears later in the document", () => {
    expect(
      getTitle("Intro paragraph\n\n## Section Title\n\nMore content"),
    ).toBe("Section Title");
  });

  it("should return untitled when the document has no headings", () => {
    expect(getTitle("Paragraph one\n\nParagraph two")).toBe("Untitled");
  });
});
