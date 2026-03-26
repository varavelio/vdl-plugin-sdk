import { describe, expect, expectTypeOf, it } from "vitest";
import * as irb from "../../testing";
import type { LiteralValue } from "../../types";
import { unwrapLiteral } from "./unwrap-literal";

describe("unwrapLiteral", () => {
  it("unwraps string literals", () => {
    expect(unwrapLiteral(irb.stringLiteral("users"))).toBe("users");
  });

  it("unwraps int literals", () => {
    expect(unwrapLiteral(irb.intLiteral(42))).toBe(42);
  });

  it("unwraps float literals", () => {
    expect(unwrapLiteral(irb.floatLiteral(3.14))).toBe(3.14);
  });

  it("unwraps bool literals", () => {
    expect(unwrapLiteral(irb.boolLiteral(true))).toBe(true);
  });

  it("unwraps array literals", () => {
    const value = irb.arrayLiteral([
      irb.stringLiteral("GET"),
      irb.stringLiteral("POST"),
    ]);

    expect(unwrapLiteral(value)).toEqual(["GET", "POST"]);
  });

  it("unwraps object literals recursively", () => {
    const value = irb.objectLiteral({
      path: irb.stringLiteral("/users"),
      methods: irb.arrayLiteral([
        irb.stringLiteral("GET"),
        irb.stringLiteral("POST"),
      ]),
      meta: irb.objectLiteral({
        secure: irb.boolLiteral(true),
      }),
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
    const value = unwrapLiteral(irb.stringLiteral("users"));

    expectTypeOf(value).toEqualTypeOf<unknown>();
  });

  it("accepts an explicit generic return type", () => {
    const value = unwrapLiteral<{ path: string }>(
      irb.objectLiteral({
        path: irb.stringLiteral("/users"),
      }),
    );

    expectTypeOf(value).toEqualTypeOf<{ path: string }>();
    expect(value.path).toBe("/users");
  });

  it("keeps malformed payloads non-throwing", () => {
    expect(
      unwrapLiteral({
        position: irb.position(),
        kind: "string",
      } as LiteralValue),
    ).toBeUndefined();

    const invalidLiteral = {
      position: irb.position(),
      kind: "unknown",
    } as unknown as LiteralValue;

    expect(unwrapLiteral(invalidLiteral)).toBeNull();
  });
});
