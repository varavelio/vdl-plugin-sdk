import { describe, expect, it } from "vitest";
import * as irb from "../../testing";
import { anonymizeIr } from "./anonymize-ir";

describe("anonymizeIr", () => {
  it("redacts entryPoint and all nested positions while preserving shape", () => {
    const schema = irb.schema({
      entryPoint: "/private/schemas/service.vdl",
      docs: [
        {
          position: irb.position({
            file: "/private/schemas/service.vdl",
            line: 10,
            column: 5,
          }),
          content: "Schema overview",
        },
      ],
      types: [
        irb.typeDef(
          "Service",
          irb.objectType([
            irb.field("id", irb.primitiveType("string")),
            irb.field(
              "settings",
              irb.objectType([irb.field("enabled", irb.primitiveType("bool"))]),
            ),
          ]),
        ),
      ],
      constants: [
        irb.constantDef(
          "defaultConfig",
          irb.objectLiteral({
            retries: irb.intLiteral(3),
          }),
        ),
      ],
    });

    const anonymized = anonymizeIr(schema);

    expect(anonymized.entryPoint).toBe("");
    expect(anonymized.docs[0]?.position).toEqual({
      file: "schema.vdl",
      line: 1,
      column: 1,
    });
    expect(anonymized.types[0]?.position).toEqual({
      file: "schema.vdl",
      line: 1,
      column: 1,
    });
    expect(anonymized.types[0]?.typeRef.objectFields?.[0]?.position).toEqual({
      file: "schema.vdl",
      line: 1,
      column: 1,
    });
    expect(anonymized.constants[0]?.value.position).toEqual({
      file: "schema.vdl",
      line: 1,
      column: 1,
    });
  });

  it("does not mutate the original object", () => {
    const schema = irb.schema({
      entryPoint: "/private/schemas/service.vdl",
      types: [irb.typeDef("User", irb.primitiveType("string"))],
    });

    const originalPosition = schema.types[0]?.position;
    const originalEntryPoint = schema.entryPoint;

    const anonymized = anonymizeIr(schema);

    expect(schema.entryPoint).toBe(originalEntryPoint);
    expect(schema.types[0]?.position).toBe(originalPosition);
    expect(anonymized).not.toBe(schema);
    expect(anonymized.types[0]?.position).not.toBe(originalPosition);
  });

  it("supports generic nested objects outside IrSchema", () => {
    const input = {
      request: {
        entryPoint: "/tmp/private.vdl",
        payload: {
          position: {
            file: "/tmp/private.vdl",
            line: 99,
            column: 7,
          },
          keep: true,
        },
      },
    };

    expect(anonymizeIr(input)).toEqual({
      request: {
        entryPoint: "",
        payload: {
          position: {
            file: "schema.vdl",
            line: 1,
            column: 1,
          },
          keep: true,
        },
      },
    });
  });
});
