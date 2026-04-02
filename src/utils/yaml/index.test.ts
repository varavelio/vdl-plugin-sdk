import { describe, expect, it } from "vitest";

import { parse, stringify } from "./index";

describe("utils/yaml", () => {
  it("parses YAML strings into typed objects", () => {
    const output = parse<{ service: { name: string; ports: number[] } }>(`
service:
  name: user-api
  ports:
    - 8080
    - 8081
`);

    expect(output).toEqual({
      service: {
        name: "user-api",
        ports: [8080, 8081],
      },
    });
  });

  it("stringifies plain values to YAML and supports round-tripping", () => {
    const input = {
      retries: 3,
      service: {
        enabled: true,
        name: "billing-api",
      },
      tags: ["core", "payments"],
    };

    const output = stringify(input);

    expect(parse(output)).toEqual(input);
  });

  it("throws for malformed YAML documents", () => {
    expect(() => parse("service: [8080, 8081")).toThrow();
  });
});
