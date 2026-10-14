import { describe, expect, it } from "vitest";

import * as irb from "../../testing";
import { isDeprecated } from "./is-deprecated";

describe("isDeprecated", () => {
  it("returns true when the flag is present", () => {
    expect(isDeprecated([irb.annotation("deprecated")])).toBe(true);
  });

  it("returns true regardless of the argument shape", () => {
    expect(
      isDeprecated([irb.annotation("deprecated", irb.stringLiteral("Use X."))]),
    ).toBe(true);
    expect(
      isDeprecated([irb.annotation("deprecated", irb.intLiteral(1))]),
    ).toBe(true);
    expect(
      isDeprecated([
        irb.annotation(
          "deprecated",
          irb.objectLiteral({ reason: irb.stringLiteral("Use X.") }),
        ),
      ]),
    ).toBe(true);
  });

  it("returns false when the list or annotation is missing", () => {
    expect(isDeprecated(undefined)).toBe(false);
    expect(isDeprecated([])).toBe(false);
    expect(isDeprecated([irb.annotation("cache")])).toBe(false);
  });
});
