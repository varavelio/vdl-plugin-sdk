import { describe, expect, it } from "vitest";

import { indent } from "./indent";

describe("indent", () => {
  it("indents every non-blank line with the default prefix", () => {
    expect(indent("id: string;\nname: string;")).toBe(
      "  id: string;\n  name: string;",
    );
  });

  it("supports custom indentation prefixes", () => {
    expect(indent("field string\nfield int", "\t")).toBe(
      "\tfield string\n\tfield int",
    );
  });

  it("preserves empty and whitespace-only lines without adding trailing spaces", () => {
    expect(indent("first\n\n  \nsecond", "--")).toBe("--first\n\n  \n--second");
  });

  it("returns the original string when input or prefix is empty", () => {
    expect(indent("", "--")).toBe("");
    expect(indent("a\nb", "")).toBe("a\nb");
  });
});
