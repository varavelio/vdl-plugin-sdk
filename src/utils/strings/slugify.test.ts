import { describe, expect, it } from "vitest";

import { slugify } from "./slugify";

describe("slugify", () => {
  it("removes diacritics and normalizes separators aggressively", () => {
    expect(slugify("Canción Número 1")).toBe("cancion-numero-1");
  });

  it("removes unsupported characters and trims surrounding dashes", () => {
    expect(slugify("---Olá @ SDK+++---")).toBe("ola-sdk");
  });

  it("returns an empty string for empty or symbol-only values", () => {
    expect(slugify("")).toBe("");
    expect(slugify("🚀---+++ ")).toBe("");
  });
});
