import { describe, expect, it } from "vitest";

import * as irb from "../../testing";
import { getDeprecationMessage } from "./get-deprecation-message";

describe("getDeprecationMessage", () => {
  it("returns the string message", () => {
    expect(
      getDeprecationMessage([
        irb.annotation("deprecated", irb.stringLiteral("Use X.")),
      ]),
    ).toBe("Use X.");
  });

  it("returns undefined when the annotation or argument is missing", () => {
    expect(getDeprecationMessage(undefined)).toBeUndefined();
    expect(getDeprecationMessage([])).toBeUndefined();
    expect(
      getDeprecationMessage([irb.annotation("deprecated")]),
    ).toBeUndefined();
    expect(getDeprecationMessage([irb.annotation("cache")])).toBeUndefined();
  });

  it("ignores non-string arguments as messages", () => {
    expect(
      getDeprecationMessage([irb.annotation("deprecated", irb.intLiteral(1))]),
    ).toBeUndefined();
    expect(
      getDeprecationMessage([
        irb.annotation("deprecated", irb.boolLiteral(true)),
      ]),
    ).toBeUndefined();
    expect(
      getDeprecationMessage([
        irb.annotation(
          "deprecated",
          irb.objectLiteral({ reason: irb.stringLiteral("Use X.") }),
        ),
      ]),
    ).toBeUndefined();
  });
});
