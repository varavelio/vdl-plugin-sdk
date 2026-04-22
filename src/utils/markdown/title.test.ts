import { describe, expect, it } from "vitest";

import { title } from "./title";

describe("title", () => {
  it("should return the first Markdown heading", () => {
    expect(title("# Hello World\n\nSome content")).toBe("Hello World");
  });

  it("should return the first heading even when it appears later in the document", () => {
    expect(title("Intro paragraph\n\n## Section Title\n\nMore content")).toBe(
      "Section Title",
    );
  });

  it("should return Untitled when the document has no headings", () => {
    expect(title("Paragraph one\n\nParagraph two")).toBe("Untitled");
  });
});
