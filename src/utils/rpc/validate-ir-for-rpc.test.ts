import { describe, expect, it } from "vitest";

import * as irb from "../../testing";
import { validateIrForRpc } from "./validate-ir-for-rpc";

function rpcType(name: string, typeRef = irb.objectType([])) {
  return irb.typeDef(name, typeRef, {
    annotations: [irb.annotation("rpc")],
  });
}

describe("validateIrForRpc", () => {
  it("returns undefined when there are no @rpc types", () => {
    const ir = irb.schema({
      types: [
        irb.typeDef(
          "User",
          irb.objectType([irb.field("id", irb.primitiveType("string"))]),
        ),
      ],
    });

    expect(validateIrForRpc(ir)).toBeUndefined();
  });

  it("returns undefined for valid @rpc types", () => {
    const ir = irb.schema({
      types: [
        rpcType(
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

    expect(validateIrForRpc(ir)).toBeUndefined();
  });

  it("reports an error when @rpc is used on a non-object type", () => {
    const badType = rpcType("BadService", irb.primitiveType("string"));
    const ir = irb.schema({ types: [badType] });

    expect(validateIrForRpc(ir)).toEqual([
      {
        message:
          'Type "BadService" is annotated with @rpc and must be an object type.',
        position: badType.position,
      },
    ]);
  });

  it("reports an error when an operation has both @proc and @stream", () => {
    const operationField = irb.field("syncUser", irb.objectType([]), {
      annotations: [irb.annotation("proc"), irb.annotation("stream")],
    });
    const service = rpcType("UserService", irb.objectType([operationField]));
    const ir = irb.schema({ types: [service] });

    expect(validateIrForRpc(ir)).toEqual([
      {
        message:
          'Field "UserService.syncUser" cannot be annotated with both @proc and @stream.',
        position: operationField.position,
      },
    ]);
  });

  it("reports an error when @proc or @stream is used on a non-object field", () => {
    const procField = irb.field("createUser", irb.primitiveType("string"), {
      annotations: [irb.annotation("proc")],
    });
    const streamField = irb.field(
      "watchUsers",
      irb.arrayType(irb.primitiveType("string")),
      {
        annotations: [irb.annotation("stream")],
      },
    );
    const service = rpcType(
      "UserService",
      irb.objectType([procField, streamField]),
    );
    const ir = irb.schema({ types: [service] });

    expect(validateIrForRpc(ir)).toEqual([
      {
        message:
          'Field "UserService.createUser" is annotated with @proc and must be an object type.',
        position: procField.position,
      },
      {
        message:
          'Field "UserService.watchUsers" is annotated with @stream and must be an object type.',
        position: streamField.position,
      },
    ]);
  });

  it("treats operations without input/output fields as valid", () => {
    const operation = irb.field(
      "healthcheck",
      irb.objectType([irb.field("kind", irb.primitiveType("string"))]),
      {
        annotations: [irb.annotation("proc")],
      },
    );
    const service = rpcType("InfraService", irb.objectType([operation]));
    const ir = irb.schema({ types: [service] });

    expect(validateIrForRpc(ir)).toBeUndefined();
  });

  it("reports errors when input/output are present but not object types", () => {
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
    const service = rpcType("UserService", irb.objectType([operation]));
    const ir = irb.schema({ types: [service] });

    expect(validateIrForRpc(ir)).toEqual([
      {
        message:
          'Field "input" in operation "UserService.getUser" must be an object type when present.',
        position: inputField.position,
      },
      {
        message:
          'Field "output" in operation "UserService.getUser" must be an object type when present.',
        position: outputField.position,
      },
    ]);
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

    const service = rpcType("UserService", irb.objectType([operationField]));
    const ir = irb.schema({ types: [service] });
    const errors = validateIrForRpc(ir);

    expect(errors).toEqual([
      {
        message:
          'Field "input" in operation "UserService.getUser" must be an object type when present.',
        position: {
          file: "/schema.vdl",
          line: 11,
          column: 9,
        },
      },
    ]);
  });

  it("returns all RPC diagnostics from all annotated types", () => {
    const badRpcType = rpcType(
      "BrokenService",
      irb.arrayType(irb.primitiveType("string")),
    );

    const dualAnnotationOperation = irb.field("sync", irb.objectType([]), {
      annotations: [irb.annotation("proc"), irb.annotation("stream")],
    });
    const badInputField = irb.field("input", irb.primitiveType("string"));
    const badOutputField = irb.field("output", irb.primitiveType("bool"));
    const badOperation = irb.field(
      "getUser",
      irb.objectType([badInputField, badOutputField]),
      {
        annotations: [irb.annotation("proc")],
      },
    );

    const mixedRpcType = rpcType(
      "UserService",
      irb.objectType([dualAnnotationOperation, badOperation]),
    );

    const ir = irb.schema({
      types: [badRpcType, mixedRpcType],
    });

    expect(validateIrForRpc(ir)).toEqual([
      {
        message:
          'Type "BrokenService" is annotated with @rpc and must be an object type.',
        position: badRpcType.position,
      },
      {
        message:
          'Field "UserService.sync" cannot be annotated with both @proc and @stream.',
        position: dualAnnotationOperation.position,
      },
      {
        message:
          'Field "input" in operation "UserService.getUser" must be an object type when present.',
        position: badInputField.position,
      },
      {
        message:
          'Field "output" in operation "UserService.getUser" must be an object type when present.',
        position: badOutputField.position,
      },
    ]);
  });
});
