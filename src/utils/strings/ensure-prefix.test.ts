import { describe, expect, it } from "vitest";

import { ensurePrefix } from "./ensure-prefix";

describe("ensurePrefix", () => {
  it("adds the prefix if it is missing", () => {
    expect(ensurePrefix("User", "I")).toBe("IUser");
  });

  it("does not add the prefix if it is already present", () => {
    expect(ensurePrefix("IUser", "I")).toBe("IUser");
  });

  it("handles empty strings", () => {
    expect(ensurePrefix("", "I")).toBe("I");
    expect(ensurePrefix("User", "")).toBe("User");
  });

  it("is case-sensitive", () => {
    expect(ensurePrefix("iUser", "I")).toBe("IiUser");
  });
});
