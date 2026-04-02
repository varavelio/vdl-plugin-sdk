import { describe, expect, it } from "vitest";

import { parse, stringify } from "./index";

describe("utils/toml", () => {
  it("parses TOML strings into typed objects", () => {
    const output = parse<{ database: { enabled: boolean; ports: number[] } }>(`
[database]
enabled = true
ports = [8000, 8001]
`);

    expect(output).toEqual({
      database: {
        enabled: true,
        ports: [8000, 8001],
      },
    });
  });

  it("stringifies plain values to TOML and supports round-tripping", () => {
    const input: Record<string, unknown> = {
      retries: 2,
      service: {
        enabled: true,
        name: "users-api",
      },
      tags: ["core", "users"],
    };

    const output = stringify(input);

    expect(parse(output)).toEqual(input);
  });

  it("throws for malformed TOML documents", () => {
    expect(() => parse("[database\nname = 'primary'")).toThrow();
  });
});
