import { describe, expect, it } from "vitest";

import { lastNWords } from "./last-n-words";

import { words } from "./words";

describe("lastNWords", () => {
  it("returns the last N normalized words and appends ellipsis by default when truncating", () => {
    expect(lastNWords("HTTPServer_URL-v2", 2)).toBe("URL v2...");
  });

  it("returns the original normalized words when there is nothing to truncate", () => {
    expect(lastNWords("one two", 5)).toBe(words("one two").join(" "));
  });

  it("supports disabling ellipsis and handles non-positive lengths", () => {
    expect(lastNWords("HTTPServer_URL-v2", 2, false)).toBe("URL v2");
    expect(lastNWords("one two", 0)).toBe("");
  });
});
