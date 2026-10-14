import { describe, expect, it } from "vitest";

import { PluginError } from "../../core";
import * as irb from "../../testing";
import { assertValidIrForHttpRpc } from "./assert-valid-ir-for-http-rpc";

function httpRpcType(name: string, typeRef = irb.objectType([])) {
  return irb.typeDef(name, typeRef, {
    annotations: [irb.annotation("httpRpc")],
  });
}

function getPluginError(action: () => void): PluginError {
  try {
    action();
    throw new Error("Expected assertValidIrForHttpRpc to throw PluginError");
  } catch (error) {
    if (!(error instanceof PluginError)) {
      throw error;
    }

    return error;
  }
}

describe("assertValidIrForHttpRpc", () => {
  it("does nothing when there are no @httpRpc types", () => {
    const ir = irb.schema({
      types: [
        irb.typeDef(
          "User",
          irb.objectType([irb.field("id", irb.primitiveType("string"))]),
        ),
      ],
    });

    expect(() => assertValidIrForHttpRpc(ir)).not.toThrow();
  });

  it("ignores legacy @rpc types and orphan @proc fields", () => {
    const legacy = irb.typeDef("Legacy", irb.primitiveType("string"), {
      annotations: [irb.annotation("rpc")],
    });
    const orphan = irb.typeDef(
      "Orphan",
      irb.objectType([
        irb.field("doThing", irb.primitiveType("string"), {
          annotations: [irb.annotation("proc")],
        }),
      ]),
    );
    const ir = irb.schema({ types: [legacy, orphan] });

    expect(() => assertValidIrForHttpRpc(ir)).not.toThrow();
  });

  it("does nothing for valid @httpRpc types", () => {
    const ir = irb.schema({
      types: [
        httpRpcType(
          "UserService",
          irb.objectType([
            irb.field(
              "getUser",
              irb.objectType([
                irb.field(
                  "input",
                  irb.objectType([
                    irb.field("id", irb.primitiveType("string")),
                    irb.field(
                      "tags",
                      irb.arrayType(irb.primitiveType("string")),
                    ),
                  ]),
                ),
                irb.field("output", irb.objectType([])),
              ]),
              {
                annotations: [irb.annotation("proc")],
              },
            ),
            irb.field("metadata", irb.primitiveType("string")),
          ]),
        ),
      ],
    });

    expect(() => assertValidIrForHttpRpc(ir)).not.toThrow();
  });

  it("throws when @httpRpc is used on a non-object type", () => {
    const badType = httpRpcType("BadService", irb.primitiveType("string"));
    const ir = irb.schema({ types: [badType] });
    const error = getPluginError(() => assertValidIrForHttpRpc(ir));

    expect(error).toMatchObject({
      message:
        'Type "BadService" is annotated with @httpRpc and must be an object type.',
      position: badType.position,
    });
  });

  it("throws when @httpRpc has arguments", () => {
    const annotation = irb.annotation("httpRpc", irb.stringLiteral("args"));
    const badType = irb.typeDef("BadService", irb.objectType([]), {
      annotations: [annotation],
    });
    const ir = irb.schema({ types: [badType] });
    const error = getPluginError(() => assertValidIrForHttpRpc(ir));

    expect(error).toMatchObject({
      message: 'Type "BadService" annotation @httpRpc must not have arguments.',
      position: annotation.position,
    });
  });

  it("throws when @proc has arguments", () => {
    const annotation = irb.annotation("proc", irb.stringLiteral("args"));
    const operationField = irb.field("getUser", irb.objectType([]), {
      annotations: [annotation],
    });
    const service = httpRpcType(
      "UserService",
      irb.objectType([operationField]),
    );
    const ir = irb.schema({ types: [service] });
    const error = getPluginError(() => assertValidIrForHttpRpc(ir));

    expect(error).toMatchObject({
      message:
        'Field "UserService.getUser" annotation @proc must not have arguments.',
      position: annotation.position,
    });
  });

  it("throws when @proc is used on a non-object field", () => {
    const procField = irb.field("createUser", irb.primitiveType("string"), {
      annotations: [irb.annotation("proc")],
    });
    const service = httpRpcType("UserService", irb.objectType([procField]));
    const ir = irb.schema({ types: [service] });
    const error = getPluginError(() => assertValidIrForHttpRpc(ir));

    expect(error).toMatchObject({
      message:
        'Field "UserService.createUser" is annotated with @proc and must be an inline object type.',
      position: procField.position,
    });
  });

  it("treats operations without input/output fields as valid", () => {
    const operation = irb.field(
      "healthcheck",
      irb.objectType([irb.field("kind", irb.primitiveType("string"))]),
      {
        annotations: [irb.annotation("proc")],
      },
    );
    const service = httpRpcType("InfraService", irb.objectType([operation]));
    const ir = irb.schema({ types: [service] });

    expect(() => assertValidIrForHttpRpc(ir)).not.toThrow();
  });

  it("throws when input is present but not an object type", () => {
    const inputField = irb.field("input", irb.primitiveType("string"));
    const outputField = irb.field(
      "output",
      irb.arrayType(irb.primitiveType("string")),
    );
    const operation = irb.field(
      "getUser",
      irb.objectType([inputField, outputField]),
      {
        annotations: [irb.annotation("proc")],
      },
    );
    const service = httpRpcType("UserService", irb.objectType([operation]));
    const ir = irb.schema({ types: [service] });
    const error = getPluginError(() => assertValidIrForHttpRpc(ir));

    expect(error).toMatchObject({
      message:
        'Field "input" in operation "UserService.getUser" must be an inline object type when present.',
      position: inputField.position,
    });
  });

  it("fills missing nested file paths from the operation position", () => {
    const inputField = irb.field("input", irb.primitiveType("string"));
    inputField.position = irb.position({
      file: "",
      line: 11,
      column: 9,
    });

    const operationField = irb.field("getUser", irb.objectType([inputField]), {
      annotations: [irb.annotation("proc")],
    });
    operationField.position = irb.position({
      file: "/schema.vdl",
      line: 10,
      column: 3,
    });

    const service = httpRpcType(
      "UserService",
      irb.objectType([operationField]),
    );
    const ir = irb.schema({ types: [service] });
    const error = getPluginError(() => assertValidIrForHttpRpc(ir));

    expect(error).toMatchObject({
      message:
        'Field "input" in operation "UserService.getUser" must be an inline object type when present.',
      position: {
        file: "/schema.vdl",
        line: 11,
        column: 9,
      },
    });
  });

  it("fails fast and throws only the first violation", () => {
    const badRpcType = httpRpcType(
      "BrokenService",
      irb.arrayType(irb.primitiveType("string")),
    );

    const badInputField = irb.field("input", irb.primitiveType("string"));
    const badOutputField = irb.field("output", irb.primitiveType("bool"));
    const badOperation = irb.field(
      "getUser",
      irb.objectType([badInputField, badOutputField]),
      {
        annotations: [irb.annotation("proc")],
      },
    );

    const mixedRpcType = httpRpcType(
      "UserService",
      irb.objectType([badOperation]),
    );

    const ir = irb.schema({
      types: [badRpcType, mixedRpcType],
    });
    const error = getPluginError(() => assertValidIrForHttpRpc(ir));

    expect(error).toMatchObject({
      message:
        'Type "BrokenService" is annotated with @httpRpc and must be an object type.',
      position: badRpcType.position,
    });
  });
});
