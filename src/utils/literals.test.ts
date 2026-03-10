import { describe, expect, expectTypeOf, it } from "vitest";

import type { LiteralValue, Position } from "../types";
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

describe("unwrapLiteral", () => {
  it("resolves primitive literal payloads", () => {
    expect(
      unwrapLiteral(createLiteral("string", { stringValue: "users" })),
    ).toBe("users");
    expect(unwrapLiteral(createLiteral("int", { intValue: 42 }))).toBe(42);
    expect(unwrapLiteral(createLiteral("float", { floatValue: 3.14 }))).toBe(
      3.14,
    );
    expect(unwrapLiteral(createLiteral("bool", { boolValue: true }))).toBe(
      true,
    );
  });

  it("resolves nested arrays and objects recursively", () => {
    const value = createLiteral("object", {
      objectEntries: [
        {
          position,
          key: "path",
          value: createLiteral("string", { stringValue: "/users" }),
        },
        {
          position,
          key: "methods",
          value: createLiteral("array", {
            arrayItems: [
              createLiteral("string", { stringValue: "GET" }),
              createLiteral("string", { stringValue: "POST" }),
            ],
          }),
        },
        {
          position,
          key: "meta",
          value: createLiteral("object", {
            objectEntries: [
              {
                position,
                key: "secure",
                value: createLiteral("bool", { boolValue: true }),
              },
            ],
          }),
        },
      ],
    });

    expect(unwrapLiteral(value)).toEqual({
      path: "/users",
      methods: ["GET", "POST"],
      meta: {
        secure: true,
      },
    });
  });

  it("keeps the default return type as unknown", () => {
    const value = unwrapLiteral(
      createLiteral("string", { stringValue: "users" }),
    );

    expectTypeOf(value).toEqualTypeOf<unknown>();
  });

  it("accepts an explicit generic return type", () => {
    const value = unwrapLiteral<{ path: string }>(
      createLiteral("object", {
        objectEntries: [
          {
            position,
            key: "path",
            value: createLiteral("string", { stringValue: "/users" }),
          },
        ],
      }),
    );

    expectTypeOf(value).toEqualTypeOf<{ path: string }>();
    expect(value.path).toBe("/users");
  });

  it("keeps malformed payloads non-throwing", () => {
    expect(unwrapLiteral(createLiteral("string"))).toBeUndefined();

    const invalidLiteral = {
      position,
      kind: "unknown",
    } as unknown as LiteralValue;

    expect(unwrapLiteral(invalidLiteral)).toBeNull();
  });
});
