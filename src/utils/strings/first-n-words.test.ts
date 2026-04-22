import { describe, expect, it } from "vitest";

import { firstNWords } from "./first-n-words";

describe("firstNWords", () => {
  it("returns the first N normalized words and appends ellipsis by default when truncating", () => {
    expect(firstNWords("HTTPServer_URL-v2", 2)).toBe("HTTP Server...");
  });

  it("returns the original normalized words when there is nothing to truncate", () => {
    expect(firstNWords("one two", 5)).toBe("one two");
  });

  it("supports disabling ellipsis and handles non-positive lengths", () => {
    expect(firstNWords("HTTPServer_URL-v2", 2, false)).toBe("HTTP Server");
    expect(firstNWords("one two", 0)).toBe("");
  });
});
