import { assert, fail } from "../../core";
import type {
  Annotation,
  Field,
  IrSchema,
  Position,
  TypeDef,
} from "../../core/types";

const HTTP_RPC_ANNOTATION_NAME = "httpRpc";
const PROC_ANNOTATION_NAME = "proc";

/**
 * Asserts that HTTP-RPC IR structures follow VPP-2 conventions.
 *
 * This helper is intended for HTTP-RPC plugins that want a single fail-fast
 * validation call before generation starts.
 *
 * Validation rules:
 *
 * 1. If no type is annotated with `@httpRpc`, validation is skipped.
 * 2. Every `@httpRpc` annotation must not have arguments.
 * 3. Every `@httpRpc` type must be an object type.
 * 4. Inside each `@httpRpc` object, only fields annotated with `@proc` are
 *    validated as procedures. Orphan `@proc` fields outside `@httpRpc` are
 *    ignored.
 * 5. Every `@proc` annotation must not have arguments.
 * 6. Every `@proc` field must be an inline object type.
 * 7. If an operation declares `input` or `output` fields, each one must be an
 *    inline object type.
 * 8. The contents inside valid `input`/`output` objects are intentionally not
 *    validated by this helper and can be anything.
 *
 * The function is fail-fast and non-returning for invalid input:
 *
 * - It returns `void` when HTTP-RPC structures are valid.
 * - It throws `PluginError` on the first violation.
 * - `definePlugin` catches that error and turns it into plugin diagnostics.
 *
 * @param ir - Fully resolved VDL IR schema to validate.
 *
 * @example
 * ```ts
 * import { definePlugin } from "@varavel/vdl-plugin-sdk";
 * import { assertValidIrForHttpRpc } from "@varavel/vdl-plugin-sdk/utils/rpc";
 *
 * export const generate = definePlugin((input) => {
 *   assertValidIrForHttpRpc(input.ir);
 *
 *   return {
 *     files: [{ path: "rpc.ts", content: "// ..." }],
 *   };
 * });
 * ```
 */
export function assertValidIrForHttpRpc(ir: IrSchema): void {
  const rpcTypes = ir.types.filter((typeDef) => {
    return hasAnnotation(typeDef.annotations, HTTP_RPC_ANNOTATION_NAME);
  });

  for (const rpcType of rpcTypes) {
    assertValidHttpRpcType(rpcType);
  }
}

function assertValidHttpRpcType(typeDef: TypeDef): void {
  const rpcAnnotation = findAnnotation(
    typeDef.annotations,
    HTTP_RPC_ANNOTATION_NAME,
  );

  if (rpcAnnotation?.argument !== undefined) {
    fail(
      `Type ${JSON.stringify(typeDef.name)} annotation @httpRpc must not have arguments.`,
      rpcAnnotation.position,
    );
  }

  assert(
    typeDef.typeRef.kind === "object",
    `Type ${JSON.stringify(typeDef.name)} is annotated with @httpRpc and must be an object type.`,
    typeDef.position,
  );

  const fields = typeDef.typeRef.objectFields ?? [];

  for (const field of fields) {
    assertValidHttpRpcOperationField(typeDef, field);
  }
}

function assertValidHttpRpcOperationField(
  rpcType: TypeDef,
  field: Field,
): void {
  const procAnnotation = findAnnotation(
    field.annotations,
    PROC_ANNOTATION_NAME,
  );

  if (!procAnnotation) {
    return;
  }

  if (procAnnotation.argument !== undefined) {
    fail(
      `Field ${JSON.stringify(`${rpcType.name}.${field.name}`)} annotation @proc must not have arguments.`,
      procAnnotation.position,
    );
  }

  assert(
    field.typeRef.kind === "object",
    `Field ${JSON.stringify(`${rpcType.name}.${field.name}`)} is annotated with @proc and must be an inline object type.`,
    field.position,
  );

  const inputField = findFieldByName(field.typeRef.objectFields, "input");
  const outputField = findFieldByName(field.typeRef.objectFields, "output");

  if (inputField && inputField.typeRef.kind !== "object") {
    fail(
      `Field "input" in operation ${JSON.stringify(`${rpcType.name}.${field.name}`)} must be an inline object type when present.`,
      withFallbackFile(inputField.position, field.position),
    );
  }

  if (outputField && outputField.typeRef.kind !== "object") {
    fail(
      `Field "output" in operation ${JSON.stringify(`${rpcType.name}.${field.name}`)} must be an inline object type when present.`,
      withFallbackFile(outputField.position, field.position),
    );
  }
}

function hasAnnotation(annotations: Annotation[], name: string): boolean {
  return annotations.some((annotation) => annotation.name === name);
}

function findAnnotation(
  annotations: Annotation[],
  name: string,
): Annotation | undefined {
  return annotations.find((annotation) => annotation.name === name);
}

function findFieldByName(
  fields: Field[] | undefined,
  name: string,
): Field | undefined {
  return fields?.find((field) => field.name === name);
}

function withFallbackFile(primary: Position, fallback: Position): Position {
  if (primary.file.length > 0 || fallback.file.length === 0) {
    return primary;
  }

  return {
    ...primary,
    file: fallback.file,
  };
}
