import { describe, expect, it } from "vitest";
import { irb } from "../../testing";
import type { LiteralValue } from "../../types";
import { getAnnotationArg } from "./get-annotation-arg";
import { unwrapLiteral } from "./unwrap-literal";

describe("getAnnotationArg", () => {
  it("returns the raw literal argument for a matching annotation", () => {
    const argument = irb.stringLiteral("/users");
    const annotations = [irb.annotation("http", argument)];

    expect(getAnnotationArg(annotations, "http")).toBe(argument);
  });

  it("returns undefined when the annotation or argument is missing", () => {
    expect(getAnnotationArg(undefined, "http")).toBeUndefined();
    expect(getAnnotationArg([irb.annotation("http")], "http")).toBeUndefined();
  });

  it("pairs cleanly with unwrapLiteral", () => {
    const argument = irb.objectLiteral({
      objectEntries: irb.arrayLiteral([
        irb.objectLiteral({
          key: irb.stringLiteral("path"),
          value: irb.stringLiteral("/users"),
        }),
        irb.objectLiteral({
          key: irb.stringLiteral("secure"),
          value: irb.boolLiteral(true),
        }),
      ]),
    });
    const annotations = [irb.annotation("http", argument)];

    const rawArgument = getAnnotationArg(annotations, "http");

    expect(rawArgument).toBeDefined();
    expect(unwrapLiteral(rawArgument as LiteralValue)).toEqual({
      objectEntries: [
        {
          key: "path",
          value: "/users",
        },
        {
          key: "secure",
          value: true,
        },
      ],
    });
  });
});
