import { describe, expect, it } from "vitest";
import { escapeScriptTag } from "./escape-script-tag";

describe("escapeScriptTag", () => {
  it("should escape script closing tags", () => {
    expect(escapeScriptTag("</script>")).toBe("\\u003c/script\\u003e");
  });

  it("should maintain valid JSON when parsed", () => {
    const input = JSON.stringify({ key: "</script>" });
    const escaped = escapeScriptTag(input);
    const parsed = JSON.parse(escaped);
    expect(parsed.key).toBe("</script>");
  });

  it("should escape line separators", () => {
    expect(escapeScriptTag("A\u2028B")).toBe("A\\u2028B");
    expect(escapeScriptTag("A\u2029B")).toBe("A\\u2029B");
  });
});
