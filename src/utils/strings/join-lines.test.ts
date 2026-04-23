import { describe, expect, it } from "vitest";

import { joinLines } from "./join-lines";

describe("joinLines", () => {
  it("joins non-empty lines using a newline separator", () => {
    expect(joinLines(["alpha", "beta", "gamma"])).toBe("alpha\nbeta\ngamma");
  });

  it("filters empty and whitespace-only lines", () => {
    expect(joinLines(["alpha", "", "   ", "beta", "\t", "gamma"])).toBe(
      "alpha\nbeta\ngamma",
    );
  });

  it("returns an empty string when all lines are blank", () => {
    expect(joinLines(["", "   ", "\t"])).toBe("");
  });
});
