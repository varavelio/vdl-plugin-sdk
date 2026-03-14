import { describe, expect, expectTypeOf, it } from "vitest";

import { getOptionEnum } from "./get-option-enum";

describe("getOptionEnum", () => {
  const casingOptions = ["camel", "pascal", "snake"] as const;

  it("returns supported option values", () => {
    expect(
      getOptionEnum({ casing: "camel" }, "casing", casingOptions, "snake"),
    ).toBe("camel");
  });

  it("returns the fallback for missing, blank, or invalid values", () => {
    expect(getOptionEnum(undefined, "casing", casingOptions, "snake")).toBe(
      "snake",
    );
    expect(getOptionEnum({}, "casing", casingOptions, "snake")).toBe("snake");
    expect(
      getOptionEnum({ casing: "   " }, "casing", casingOptions, "snake"),
    ).toBe("snake");
    expect(
      getOptionEnum({ casing: "kebab" }, "casing", casingOptions, "snake"),
    ).toBe("snake");
  });

  it("preserves the literal union type of the allowed values", () => {
    const value = getOptionEnum(
      { casing: "pascal" },
      "casing",
      casingOptions,
      "snake",
    );

    expectTypeOf(value).toEqualTypeOf<"camel" | "pascal" | "snake">();
  });
});
