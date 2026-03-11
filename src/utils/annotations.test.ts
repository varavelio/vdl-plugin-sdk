import { describe, expect, it } from "vitest";

import type { Annotation, LiteralValue, Position } from "../types";
import { getAnnotation, getAnnotationArg } from "./annotations";
import { unwrapLiteral } from "./literals";

const position: Position = {
  file: "schema.vdl",
  line: 1,
  column: 1,
};

function createLiteral(
  kind: LiteralValue["kind"],
  overrides: Partial<LiteralValue> = {},
): LiteralValue {
  return {
    position,
    kind,
    ...overrides,
  };
}

function createAnnotation(name: string, argument?: LiteralValue): Annotation {
  return {
    position,
    name,
    argument,
  };
}

describe("getAnnotation", () => {
  it("returns the matching annotation", () => {
    const httpAnnotation = createAnnotation("http");
    const annotations = [createAnnotation("deprecated"), httpAnnotation];

    expect(getAnnotation(annotations, "http")).toBe(httpAnnotation);
  });

  it("returns undefined when the list or annotation is missing", () => {
    expect(getAnnotation(undefined, "http")).toBeUndefined();
    expect(getAnnotation([createAnnotation("cache")], "http")).toBeUndefined();
  });
});

describe("getAnnotationArg", () => {
  it("returns the raw literal argument for a matching annotation", () => {
    const argument = createLiteral("string", { stringValue: "/users" });
    const annotations = [createAnnotation("http", argument)];

    expect(getAnnotationArg(annotations, "http")).toBe(argument);
  });

  it("returns undefined when the annotation or argument is missing", () => {
    expect(getAnnotationArg(undefined, "http")).toBeUndefined();
    expect(
      getAnnotationArg([createAnnotation("http")], "http"),
    ).toBeUndefined();
  });

  it("pairs cleanly with unwrapLiteral", () => {
    const argument = createLiteral("object", {
      objectEntries: [
        {
          position,
          key: "path",
          value: createLiteral("string", { stringValue: "/users" }),
        },
        {
          position,
          key: "secure",
          value: createLiteral("bool", { boolValue: true }),
        },
      ],
    });
    const annotations = [createAnnotation("http", argument)];

    const rawArgument = getAnnotationArg(annotations, "http");

    expect(rawArgument).toBeDefined();
    expect(unwrapLiteral(rawArgument as LiteralValue)).toEqual({
      path: "/users",
      secure: true,
    });
  });
});
