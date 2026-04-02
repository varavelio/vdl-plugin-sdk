import { assert, fail } from "../../core";
import type {
  Annotation,
  Field,
  IrSchema,
  Position,
  TypeDef,
} from "../../core/types";

const RPC_ANNOTATION_NAME = "rpc";
const PROC_ANNOTATION_NAME = "proc";
const STREAM_ANNOTATION_NAME = "stream";

/**
 * Asserts that RPC-annotated IR structures follow SDK RPC conventions.
 *
 * This helper is intended for RPC-oriented plugins that want a single fail-fast
 * validation call before generation starts.
 *
 * Validation rules:
 *
 * 1. If no type is annotated with `@rpc`, validation is skipped.
 * 2. Every `@rpc` type must be an object type.
 * 3. Inside each `@rpc` object, only fields annotated with `@proc` or `@stream`
 *    are validated as RPC operations.
 * 4. An operation field cannot have both `@proc` and `@stream`.
 * 5. Every `@proc` or `@stream` field must be an object type.
 * 6. If an operation declares `input` or `output` fields, each one must be an
 *    object type.
 * 7. The contents inside valid `input`/`output` objects are intentionally not
 *    validated by this helper and can be anything.
 *
 * The function is fail-fast and non-returning for invalid input:
 *
 * - It returns `void` when RPC structures are valid.
 * - It throws `PluginError` on the first violation.
 * - `definePlugin` catches that error and turns it into plugin diagnostics.
 *
 * @param ir - Fully resolved VDL IR schema to validate.
 *
 * @example
 * ```ts
 * import { definePlugin } from "@varavel/vdl-plugin-sdk";
 * import { assertValidIrForRpc } from "@varavel/vdl-plugin-sdk/utils/rpc";
 *
 * export const generate = definePlugin((input) => {
 *   assertValidIrForRpc(input.ir);
 *
 *   return {
 *     files: [{ path: "rpc.ts", content: "// ..." }],
 *   };
 * });
 * ```
 */
export function assertValidIrForRpc(ir: IrSchema): void {
  const rpcTypes = ir.types.filter((typeDef) => {
    return hasAnnotation(typeDef.annotations, RPC_ANNOTATION_NAME);
  });

  for (const rpcType of rpcTypes) {
    assertValidRpcType(rpcType);
  }
}

function assertValidRpcType(typeDef: TypeDef): void {
  assert(
    typeDef.typeRef.kind === "object",
    `Type ${JSON.stringify(typeDef.name)} is annotated with @rpc and must be an object type.`,
    typeDef.position,
  );

  const fields = typeDef.typeRef.objectFields ?? [];

  for (const field of fields) {
    assertValidRpcOperationField(typeDef, field);
  }
}

function assertValidRpcOperationField(rpcType: TypeDef, field: Field): void {
  const hasProc = hasAnnotation(field.annotations, PROC_ANNOTATION_NAME);
  const hasStream = hasAnnotation(field.annotations, STREAM_ANNOTATION_NAME);

  if (!hasProc && !hasStream) {
    return;
  }

  if (hasProc && hasStream) {
    fail(
      `Field ${JSON.stringify(`${rpcType.name}.${field.name}`)} cannot be annotated with both @proc and @stream.`,
      field.position,
    );
  }

  const operationAnnotation = hasProc
    ? PROC_ANNOTATION_NAME
    : STREAM_ANNOTATION_NAME;

  assert(
    field.typeRef.kind === "object",
    `Field ${JSON.stringify(`${rpcType.name}.${field.name}`)} is annotated with @${operationAnnotation} and must be an object type.`,
    field.position,
  );

  const inputField = findFieldByName(field.typeRef.objectFields, "input");
  const outputField = findFieldByName(field.typeRef.objectFields, "output");

  if (inputField && inputField.typeRef.kind !== "object") {
    fail(
      `Field "input" in operation ${JSON.stringify(`${rpcType.name}.${field.name}`)} must be an object type when present.`,
      withFallbackFile(inputField.position, field.position),
    );
  }

  if (outputField && outputField.typeRef.kind !== "object") {
    fail(
      `Field "output" in operation ${JSON.stringify(`${rpcType.name}.${field.name}`)} must be an object type when present.`,
      withFallbackFile(outputField.position, field.position),
    );
  }
}

function hasAnnotation(annotations: Annotation[], name: string): boolean {
  return annotations.some((annotation) => annotation.name === name);
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
