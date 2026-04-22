import { describe, expect, it } from "vitest";

import { wrapCode } from "./wrap-code";

describe("wrapCode", () => {
  it("should wrap code in a fenced block with a language", () => {
    expect(wrapCode("const value = 1;", "ts")).toBe(
      "```ts\nconst value = 1;\n```",
    );
  });

  it("should wrap code in a fenced block without a language when omitted", () => {
    expect(wrapCode("plain text")).toBe("```\nplain text\n```");
  });

  it("should escape backticks inside the code block content", () => {
    expect(wrapCode("const snippet = `value`;\n```nested```", "ts")).toBe(
      "```ts\nconst snippet = \\`value\\`;\n\\`\\`\\`nested\\`\\`\\`\n```",
    );
  });
});
