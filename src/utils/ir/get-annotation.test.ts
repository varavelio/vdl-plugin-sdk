import { describe, expect, it } from "vitest";
import { irb } from "../../testing";
import { getAnnotation } from "./get-annotation";

describe("getAnnotation", () => {
  it("returns the matching annotation", () => {
    const httpAnnotation = irb.annotation("http");
    const annotations = [irb.annotation("deprecated"), httpAnnotation];

    expect(getAnnotation(annotations, "http")).toBe(httpAnnotation);
  });

  it("returns undefined when the list or annotation is missing", () => {
    expect(getAnnotation(undefined, "http")).toBeUndefined();
    expect(getAnnotation([irb.annotation("cache")], "http")).toBeUndefined();
  });
});
