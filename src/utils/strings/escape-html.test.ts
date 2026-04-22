import { describe, expect, it } from "vitest";
import { escapeHtml } from "./escape-html";

describe("escapeHtml", () => {
  it("should escape basic HTML tags and attributes", () => {
    expect(escapeHtml('<b>"Me & You"</b>')).toBe(
      "&lt;b&gt;&quot;Me &amp; You&quot;&lt;/b&gt;",
    );
  });

  it("should escape single quotes", () => {
    expect(escapeHtml("'Hello'")).toBe("&#039;Hello&#039;");
  });

  it("should not alter safe strings", () => {
    expect(escapeHtml("Hello World")).toBe("Hello World");
  });
});
