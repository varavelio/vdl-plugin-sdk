import type {
  Annotation,
  Field,
  IrSchema,
  PluginOutputError,
  Position,
  TypeDef,
} from "../../core/types";

const RPC_ANNOTATION_NAME = "rpc";
const PROC_ANNOTATION_NAME = "proc";
const STREAM_ANNOTATION_NAME = "stream";

/**
 * Validates IR types annotated for RPC conventions and returns plugin-friendly diagnostics.
 *
 * This helper enforces the SDK-level RPC structural rules used by RPC-oriented
 * plugins and returns errors in the same shape expected by plugin outputs.
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
 * The function is non-throwing: it always returns either a diagnostics array or
 * `undefined` when no RPC-related issues were found.
 *
 * @param ir - Fully resolved VDL IR schema to validate.
 * @returns A list of `PluginOutputError` diagnostics, or `undefined` when valid.
 *
 * @example
 * ```ts
 * const errors = validateIrForRpc(input.ir);
 * if (errors) {
 *   return { errors };
 * }
 * ```
 */
export function validateIrForRpc(
  ir: IrSchema,
): PluginOutputError[] | undefined {
  const rpcTypes = ir.types.filter((typeDef) => {
    return hasAnnotation(typeDef.annotations, RPC_ANNOTATION_NAME);
  });

  if (rpcTypes.length === 0) {
    return undefined;
  }

  const errors: PluginOutputError[] = [];

  for (const rpcType of rpcTypes) {
    validateRpcType(rpcType, errors);
  }

  return errors.length === 0 ? undefined : errors;
}

/**
 * Validates one `@rpc` type and appends diagnostics to `errors`.
 */
function validateRpcType(typeDef: TypeDef, errors: PluginOutputError[]): void {
  if (typeDef.typeRef.kind !== "object") {
    errors.push({
      message: `Type ${JSON.stringify(typeDef.name)} is annotated with @rpc and must be an object type.`,
      position: typeDef.position,
    });
    return;
  }

  const fields = typeDef.typeRef.objectFields ?? [];

  for (const field of fields) {
    validateRpcOperationField(typeDef, field, errors);
  }
}

/**
 * Validates one operation candidate (`@proc` or `@stream`) inside an `@rpc` type.
 */
function validateRpcOperationField(
  rpcType: TypeDef,
  field: Field,
  errors: PluginOutputError[],
): void {
  const hasProc = hasAnnotation(field.annotations, PROC_ANNOTATION_NAME);
  const hasStream = hasAnnotation(field.annotations, STREAM_ANNOTATION_NAME);

  if (!hasProc && !hasStream) {
    return;
  }

  if (hasProc && hasStream) {
    errors.push({
      message: `Field ${JSON.stringify(`${rpcType.name}.${field.name}`)} cannot be annotated with both @proc and @stream.`,
      position: field.position,
    });
    return;
  }

  const operationAnnotation = hasProc
    ? PROC_ANNOTATION_NAME
    : STREAM_ANNOTATION_NAME;

  if (field.typeRef.kind !== "object") {
    errors.push({
      message: `Field ${JSON.stringify(`${rpcType.name}.${field.name}`)} is annotated with @${operationAnnotation} and must be an object type.`,
      position: field.position,
    });
    return;
  }

  const inputField = findFieldByName(field.typeRef.objectFields, "input");
  const outputField = findFieldByName(field.typeRef.objectFields, "output");

  if (inputField && inputField.typeRef.kind !== "object") {
    errors.push({
      message: `Field "input" in operation ${JSON.stringify(`${rpcType.name}.${field.name}`)} must be an object type when present.`,
      position: withFallbackFile(inputField.position, field.position),
    });
  }

  if (outputField && outputField.typeRef.kind !== "object") {
    errors.push({
      message: `Field "output" in operation ${JSON.stringify(`${rpcType.name}.${field.name}`)} must be an object type when present.`,
      position: withFallbackFile(outputField.position, field.position),
    });
  }
}

/**
 * Returns whether an annotation list includes a given annotation name.
 */
function hasAnnotation(annotations: Annotation[], name: string): boolean {
  return annotations.some((annotation) => annotation.name === name);
}

/**
 * Finds a direct object field by name.
 */
function findFieldByName(
  fields: Field[] | undefined,
  name: string,
): Field | undefined {
  return fields?.find((field) => field.name === name);
}

/**
 * Preserves an inline node position while filling a missing file path.
 */
function withFallbackFile(primary: Position, fallback: Position): Position {
  if (primary.file.length > 0 || fallback.file.length === 0) {
    return primary;
  }

  return {
    ...primary,
    file: fallback.file,
  };
}
