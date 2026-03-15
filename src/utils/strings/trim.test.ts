import { describe, expect, it } from "vitest";

import { trim } from "./trim";

describe("trim", () => {
  it("trims leading and trailing whitespace by default", () => {
    expect(trim("  hello world  ")).toBe("hello world");
    expect(trim("\n\t hello world \t\n")).toBe("hello world");
  });

  it("does not remove internal whitespace by default", () => {
    expect(trim("  hello   world  ")).toBe("hello   world");
  });

  it("trims a custom single character from both sides", () => {
    expect(trim("__hello__", "_")).toBe("hello");
    expect(trim("***hello***", "*")).toBe("hello");
  });

  it("trims a custom string as a character set", () => {
    expect(trim("_-hello-_", "_-")).toBe("hello");
    expect(trim("abchellocba", "abc")).toBe("hello");
  });

  it("trims a custom array of characters", () => {
    expect(trim("_-hello-_", ["_", "-"])).toBe("hello");
    expect(trim("¡¡hola!!", ["¡", "!"])).toBe("hola");
  });

  it("preserves matching characters inside the string", () => {
    expect(trim("__he_ll-o__", ["_", "-"])).toBe("he_ll-o");
  });

  it("does not trim whitespace when custom characters are provided", () => {
    expect(trim("  __hello__  ", "_")).toBe("  __hello__  ");
  });

  it("returns the original string when the custom character set is empty", () => {
    expect(trim("  hello  ", "")).toBe("  hello  ");
    expect(trim("--hello--", [])).toBe("--hello--");
    expect(trim("--hello--", [""])).toBe("--hello--");
  });

  it("returns an empty string when the full input is trimmed away", () => {
    expect(trim("   ")).toBe("");
    expect(trim("____", "_")).toBe("");
    expect(trim("+-+-", ["+", "-"])).toBe("");
  });
});
