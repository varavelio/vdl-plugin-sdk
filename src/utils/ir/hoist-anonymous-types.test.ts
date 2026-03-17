import { describe, expect, it } from "vitest";
import { irb } from "../../testing";
import { hoistAnonymousTypes } from "./hoist-anonymous-types";

describe("hoistAnonymousTypes", () => {
  it("hoists nested anonymous objects into generated top-level types", () => {
    const schema = irb.schema({
      types: [
        irb.typeDef(
          "FooType",
          irb.objectType([
            irb.field("firstField", irb.primitiveType("string")),
            irb.field("secondField", irb.arrayType(irb.primitiveType("int"))),
          ]),
        ),
        irb.typeDef(
          "MyRpc",
          irb.objectType([
            irb.field(
              "barProc",
              irb.objectType([
                irb.field(
                  "input",
                  irb.objectType([irb.field("foo", irb.namedType("FooType"))]),
                ),
                irb.field(
                  "output",
                  irb.objectType([irb.field("baz", irb.primitiveType("bool"))]),
                ),
              ]),
              { annotations: [irb.annotation("proc")] },
            ),
          ]),
          { annotations: [irb.annotation("rpc")] },
        ),
      ],
    });

    const flatSchema = hoistAnonymousTypes(schema);

    expect(flatSchema.types.map((typeDef) => typeDef.name)).toEqual([
      "FooType",
      "MyRpc",
      "MyRpcBarProc",
      "MyRpcBarProcInput",
      "MyRpcBarProcOutput",
    ]);

    expect(flatSchema.types[1]?.typeRef).toEqual(
      irb.objectType([
        irb.field("barProc", irb.namedType("MyRpcBarProc"), {
          annotations: [irb.annotation("proc")],
        }),
      ]),
    );

    expect(flatSchema.types[2]?.typeRef).toEqual(
      irb.objectType([
        irb.field("input", irb.namedType("MyRpcBarProcInput")),
        irb.field("output", irb.namedType("MyRpcBarProcOutput")),
      ]),
    );

    expect(schema.types[1]?.typeRef.objectFields?.[0]?.typeRef.kind).toBe(
      "object",
    );
  });

  it("hoists anonymous objects inside arrays and maps", () => {
    const schema = irb.schema({
      types: [
        irb.typeDef(
          "ApiResponse",
          irb.objectType([
            irb.field(
              "usersList",
              irb.arrayType(
                irb.objectType([irb.field("id", irb.primitiveType("string"))]),
              ),
            ),
            irb.field(
              "metadata",
              irb.mapType(
                irb.objectType([irb.field("count", irb.primitiveType("int"))]),
              ),
            ),
          ]),
        ),
      ],
    });

    const flatSchema = hoistAnonymousTypes(schema);

    expect(flatSchema.types.map((typeDef) => typeDef.name)).toEqual([
      "ApiResponse",
      "ApiResponseUsersListItem",
      "ApiResponseMetadataValue",
    ]);

    expect(flatSchema.types[0]?.typeRef).toEqual(
      irb.objectType([
        irb.field(
          "usersList",
          irb.arrayType(irb.namedType("ApiResponseUsersListItem")),
        ),
        irb.field(
          "metadata",
          irb.mapType(irb.namedType("ApiResponseMetadataValue")),
        ),
      ]),
    );
  });

  it("adds numeric suffixes when generated names collide", () => {
    const schema = irb.schema({
      types: [
        irb.typeDef(
          "MyRpcBarProc",
          irb.objectType([irb.field("already", irb.primitiveType("bool"))]),
        ),
        irb.typeDef(
          "MyRpc",
          irb.objectType([
            irb.field(
              "barProc",
              irb.objectType([irb.field("enabled", irb.primitiveType("bool"))]),
            ),
          ]),
        ),
      ],
    });

    const flatSchema = hoistAnonymousTypes(schema);

    expect(flatSchema.types.map((typeDef) => typeDef.name)).toEqual([
      "MyRpcBarProc",
      "MyRpc",
      "MyRpcBarProc2",
    ]);
  });

  it("accepts a simple custom nameFn", () => {
    const schema = irb.schema({
      types: [
        irb.typeDef(
          "Request",
          irb.objectType([
            irb.field(
              "payload",
              irb.objectType([irb.field("id", irb.primitiveType("string"))]),
            ),
          ]),
        ),
      ],
    });

    const flatSchema = hoistAnonymousTypes(
      schema,
      ({ defaultName }) => `${defaultName}Dto`,
    );

    expect(flatSchema.types.map((typeDef) => typeDef.name)).toEqual([
      "Request",
      "RequestPayloadDto",
    ]);

    expect(flatSchema.types[0]?.typeRef).toEqual(
      irb.objectType([
        irb.field("payload", irb.namedType("RequestPayloadDto")),
      ]),
    );
  });
});
