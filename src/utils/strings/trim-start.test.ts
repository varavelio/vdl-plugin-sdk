import { describe, expect, it } from "vitest";

import { trimStart } from "./trim-start";

describe("trimStart", () => {
  it("trims leading whitespace by default", () => {
    expect(trimStart("  hello  ")).toBe("hello  ");
    expect(trimStart("\n\t hello")).toBe("hello");
  });

  it("trims only the start when custom characters are provided", () => {
    expect(trimStart("__hello__", "_")).toBe("hello__");
    expect(trimStart("_-hello-_", ["_", "-"])).toBe("hello-_");
  });

  it("treats a custom string as a character set", () => {
    expect(trimStart("abchellocba", "abc")).toBe("hellocba");
  });

  it("preserves matching characters away from the start", () => {
    expect(trimStart("__he_ll-o__", ["_", "-"])).toBe("he_ll-o__");
  });

  it("returns the original string when the custom character set is empty", () => {
    expect(trimStart("  hello  ", "")).toBe("  hello  ");
    expect(trimStart("--hello--", [])).toBe("--hello--");
  });
});
