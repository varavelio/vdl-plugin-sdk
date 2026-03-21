import { describe, expect, it } from "vitest";

import { ensureSuffix } from "./ensure-suffix";

describe("ensureSuffix", () => {
  it("adds the suffix if it is missing", () => {
    expect(ensureSuffix("User", "Error")).toBe("UserError");
  });

  it("does not add the suffix if it is already present", () => {
    expect(ensureSuffix("UserError", "Error")).toBe("UserError");
  });

  it("handles empty strings", () => {
    expect(ensureSuffix("", "Error")).toBe("Error");
    expect(ensureSuffix("User", "")).toBe("User");
  });

  it("is case-sensitive", () => {
    expect(ensureSuffix("Usererror", "Error")).toBe("UsererrorError");
  });
});
