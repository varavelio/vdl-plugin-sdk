import { describe, expect, it } from "vitest";

import { pluralize } from "./pluralize";

describe("pluralize", () => {
  it("pluralizes a word with no count", () => {
    expect(pluralize("test")).toBe("tests");
  });

  it("pluralizes a word with count 0", () => {
    expect(pluralize("test", 0)).toBe("tests");
  });

  it("singularizes a word with count 1", () => {
    expect(pluralize("test", 1)).toBe("test");
    expect(pluralize("tests", 1)).toBe("test");
  });

  it("pluralizes a word with count > 1", () => {
    expect(pluralize("test", 5)).toBe("tests");
  });

  it("includes the count when inclusive is true", () => {
    expect(pluralize("test", 1, true)).toBe("1 test");
    expect(pluralize("test", 5, true)).toBe("5 tests");
  });

  it("handles irregular words", () => {
    expect(pluralize("person")).toBe("people");
    expect(pluralize("child", 2)).toBe("children");
  });
});
