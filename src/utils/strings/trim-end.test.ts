import { describe, expect, it } from "vitest";

import { trimEnd } from "./trim-end";

describe("trimEnd", () => {
  it("trims trailing whitespace by default", () => {
    expect(trimEnd("  hello  ")).toBe("  hello");
    expect(trimEnd("hello\n\t ")).toBe("hello");
  });

  it("trims only the end when custom characters are provided", () => {
    expect(trimEnd("__hello__", "_")).toBe("__hello");
    expect(trimEnd("_-hello-_", ["_", "-"])).toBe("_-hello");
  });

  it("treats a custom string as a character set", () => {
    expect(trimEnd("abchellocba", "abc")).toBe("abchello");
  });

  it("preserves matching characters away from the end", () => {
    expect(trimEnd("__he_ll-o__", ["_", "-"])).toBe("__he_ll-o");
  });

  it("returns the original string when the custom character set is empty", () => {
    expect(trimEnd("  hello  ", "")).toBe("  hello  ");
    expect(trimEnd("--hello--", [])).toBe("--hello--");
  });
});
