import type {
  Annotation,
  ConstantDef,
  EnumDef,
  EnumMember,
  Field,
  IrSchema,
  LiteralValue,
  PluginInput,
  Position,
  PrimitiveType,
  TypeDef,
  TypeRef,
} from "../types";

/**
 * Creates a `Position` with sensible defaults.
 *
 * Pass `overrides` to customize specific fields.
 *
 * @param overrides - Position fields to override.
 * @returns A fully populated `Position`.
 *
 * @example
 * ```ts
 * position({ file: "user.vdl", line: 10 });
 * // returns { file: "user.vdl", line: 10, column: 1 }
 * ```
 */
export function position(overrides: Partial<Position> = {}): Position {
  return {
    file: "schema.vdl",
    line: 1,
    column: 1,
    ...overrides,
  };
}

/**
 * Creates an `Annotation` with the given name
 * and an optional literal argument.
 *
 * @param name - Annotation name without the `@` prefix.
 * @param argument - Optional literal argument attached to the annotation.
 * @returns An `Annotation` with a default position.
 *
 * @example
 * ```ts
 * annotation("minLength", intLiteral(3));
 * // returns an annotation named "minLength" with an int literal argument
 * ```
 */
export function annotation(name: string, argument?: LiteralValue): Annotation {
  return {
    position: position(),
    name,
    argument,
  };
}

/**
 * Creates a string `LiteralValue`.
 *
 * @param value - String content to store.
 * @returns A string literal node.
 *
 * @example
 * ```ts
 * stringLiteral("hello");
 * // returns a LiteralValue with kind "string"
 * ```
 */
export function stringLiteral(value: string): LiteralValue {
  return {
    position: position(),
    kind: "string",
    stringValue: value,
  };
}

/**
 * Creates an integer `LiteralValue`.
 *
 * @param value - Integer value to store.
 * @returns An integer literal node.
 *
 * @example
 * ```ts
 * intLiteral(42);
 * // returns a LiteralValue with kind "int"
 * ```
 */
export function intLiteral(value: number): LiteralValue {
  return {
    position: position(),
    kind: "int",
    intValue: value,
  };
}

/**
 * Creates a float `LiteralValue`.
 *
 * @param value - Floating-point value to store.
 * @returns A float literal node.
 *
 * @example
 * ```ts
 * floatLiteral(3.14);
 * // returns a LiteralValue with kind "float"
 * ```
 */
export function floatLiteral(value: number): LiteralValue {
  return {
    position: position(),
    kind: "float",
    floatValue: value,
  };
}

/**
 * Creates a boolean `LiteralValue`.
 *
 * @param value - Boolean value to store.
 * @returns A boolean literal node.
 *
 * @example
 * ```ts
 * boolLiteral(true);
 * // returns a LiteralValue with kind "bool"
 * ```
 */
export function boolLiteral(value: boolean): LiteralValue {
  return {
    position: position(),
    kind: "bool",
    boolValue: value,
  };
}

/**
 * Creates an array `LiteralValue` from a list of literal items.
 *
 * @param items - Literal items to include.
 * @returns An array literal node.
 *
 * @example
 * ```ts
 * arrayLiteral([stringLiteral("a"), stringLiteral("b")]);
 * // returns a LiteralValue with kind "array"
 * ```
 */
export function arrayLiteral(items: LiteralValue[]): LiteralValue {
  return {
    position: position(),
    kind: "array",
    arrayItems: items,
  };
}

/**
 * Creates an object `LiteralValue` from a plain key/value record.
 *
 * @param entries - Object entries keyed by property name.
 * @returns An object literal node.
 *
 * @example
 * ```ts
 * objectLiteral({ enabled: boolLiteral(true) });
 * // returns a LiteralValue with kind "object"
 * ```
 */
export function objectLiteral(
  entries: Record<string, LiteralValue>,
): LiteralValue {
  return {
    position: position(),
    kind: "object",
    objectEntries: Object.keys(entries).map((key) => ({
      position: position(),
      key,
      value: entries[key] as LiteralValue,
    })),
  };
}

/**
 * Creates a primitive `TypeRef` (e.g. `string`, `int`, `bool`).
 *
 * @param name - Primitive type name.
 * @returns A primitive `TypeRef`.
 *
 * @example
 * ```ts
 * primitiveType("string");
 * // returns a TypeRef with kind "primitive"
 * ```
 */
export function primitiveType(name: PrimitiveType): TypeRef {
  return {
    kind: "primitive",
    primitiveName: name,
  };
}

/**
 * Creates a `TypeRef` that references a named user-defined type.
 *
 * @param name - Referenced type name.
 * @returns A named type reference.
 *
 * @example
 * ```ts
 * namedType("User");
 * // returns a TypeRef with kind "type"
 * ```
 */
export function namedType(name: string): TypeRef {
  return {
    kind: "type",
    typeName: name,
  };
}

/**
 * Creates a `TypeRef` that references a named enum type.
 *
 * @param name - Referenced enum name.
 * @param enumType - Underlying enum storage type.
 * @returns An enum type reference.
 *
 * @example
 * ```ts
 * enumType("Role", "string");
 * // returns a TypeRef with kind "enum"
 * ```
 */
export function enumType(name: string, enumType: EnumDef["enumType"]): TypeRef {
  return {
    kind: "enum",
    enumName: name,
    enumType,
  };
}

/**
 * Creates an array `TypeRef` wrapping the given element type.
 *
 * @param dims - Number of array dimensions (defaults to 1).
 * @param type - Element type stored inside the array.
 * @returns An array `TypeRef`.
 *
 * @example
 * ```ts
 * arrayType(primitiveType("string"), 2);
 * // returns a two-dimensional array TypeRef
 * ```
 */
export function arrayType(type: TypeRef, dims = 1): TypeRef {
  return {
    kind: "array",
    arrayType: type,
    arrayDims: dims,
  };
}

/**
 * Creates a map `TypeRef` whose value type is `type`.
 *
 * @param type - Value type stored in the map.
 * @returns A map `TypeRef`.
 *
 * @example
 * ```ts
 * mapType(namedType("User"));
 * // returns a TypeRef with kind "map"
 * ```
 */
export function mapType(type: TypeRef): TypeRef {
  return {
    kind: "map",
    mapType: type,
  };
}

/**
 * Creates an inline object `TypeRef` with the given fields.
 *
 * @param fields - Inline object fields.
 * @returns An object `TypeRef`.
 *
 * @example
 * ```ts
 * objectType([field("id", primitiveType("string"))]);
 * // returns a TypeRef with kind "object"
 * ```
 */
export function objectType(fields: Field[]): TypeRef {
  return {
    kind: "object",
    objectFields: fields,
  };
}

/**
 * Creates a `Field` with the given name and type.
 *
 * Pass `overrides` to set `optional`, `annotations`, or `doc`.
 *
 * @param name - Field name.
 * @param typeRef - Field type reference.
 * @param overrides - Optional field overrides.
 * @returns A `Field` with defaults applied.
 *
 * @example
 * ```ts
 * field("id", primitiveType("string"), { optional: true });
 * // returns a Field named "id" marked as optional
 * ```
 */
export function field(
  name: string,
  typeRef: TypeRef,
  overrides: Partial<
    Omit<Field, "position" | "name" | "typeRef" | "optional" | "annotations">
  > & {
    optional?: boolean;
    annotations?: Annotation[];
  } = {},
): Field {
  return {
    position: position(),
    name,
    doc: overrides.doc,
    optional: overrides.optional ?? false,
    annotations: overrides.annotations ?? [],
    typeRef,
  };
}

/**
 * Creates a `TypeDef` with the given name and underlying type.
 *
 * Pass `overrides` to set `annotations` or `doc`.
 *
 * @param name - Type definition name.
 * @param typeRef - Underlying type reference.
 * @param overrides - Optional typedef overrides.
 * @returns A `TypeDef` with defaults applied.
 *
 * @example
 * ```ts
 * typeDef("UserId", primitiveType("string"));
 * // returns a typedef named "UserId"
 * ```
 */
export function typeDef(
  name: string,
  typeRef: TypeRef,
  overrides: Partial<
    Omit<TypeDef, "position" | "name" | "typeRef" | "annotations">
  > & {
    annotations?: Annotation[];
  } = {},
): TypeDef {
  return {
    position: position(),
    name,
    doc: overrides.doc,
    annotations: overrides.annotations ?? [],
    typeRef,
  };
}

/**
 * Creates an `EnumMember` with the given name and literal value.
 *
 * Pass `overrides` to set `annotations` or `doc`.
 *
 * @param name - Enum member name.
 * @param value - Enum member literal value.
 * @param overrides - Optional member overrides.
 * @returns An `EnumMember` with defaults applied.
 *
 * @example
 * ```ts
 * enumMember("ADMIN", stringLiteral("admin"));
 * // returns an enum member named "ADMIN"
 * ```
 */
export function enumMember(
  name: string,
  value: LiteralValue,
  overrides: Partial<
    Omit<EnumMember, "position" | "name" | "value" | "annotations">
  > & {
    annotations?: Annotation[];
  } = {},
): EnumMember {
  return {
    position: position(),
    name,
    value,
    doc: overrides.doc,
    annotations: overrides.annotations ?? [],
  };
}

/**
 * Creates an `EnumDef` with the given name, value type, and members.
 *
 * Pass `overrides` to set `annotations` or `doc`.
 *
 * @param name - Enum name.
 * @param enumValueType - Underlying enum storage type.
 * @param members - Enum members.
 * @param overrides - Optional enum overrides.
 * @returns An `EnumDef` with defaults applied.
 *
 * @example
 * ```ts
 * enumDef("Role", "string", [
 *   enumMember("ADMIN", stringLiteral("admin")),
 * ]);
 * // returns an enum definition named "Role"
 * ```
 */
export function enumDef(
  name: string,
  enumValueType: EnumDef["enumType"],
  members: EnumMember[],
  overrides: Partial<
    Omit<EnumDef, "position" | "name" | "enumType" | "members" | "annotations">
  > & {
    annotations?: Annotation[];
  } = {},
): EnumDef {
  return {
    position: position(),
    name,
    doc: overrides.doc,
    annotations: overrides.annotations ?? [],
    enumType: enumValueType,
    members,
  };
}

/**
 * Creates a `ConstantDef` with the given name and literal value.
 *
 * Pass `overrides` to set `annotations` or `doc`.
 *
 * @param name - Constant name.
 * @param value - Constant literal value.
 * @param overrides - Optional constant overrides.
 * @returns A `ConstantDef` with defaults applied.
 *
 * @example
 * ```ts
 * constantDef("ApiVersion", stringLiteral("v1"));
 * // returns a constant definition named "ApiVersion"
 * ```
 */
export function constantDef(
  name: string,
  value: LiteralValue,
  overrides: Partial<
    Omit<ConstantDef, "position" | "name" | "value" | "annotations">
  > & {
    annotations?: Annotation[];
  } = {},
): ConstantDef {
  return {
    position: position(),
    name,
    doc: overrides.doc,
    annotations: overrides.annotations ?? [],
    value,
  };
}

/**
 * Creates an `IrSchema` with empty collections.
 *
 * Pass `overrides` to populate `constants`, `enums`, `types`, or `docs`.
 *
 * @param overrides - Schema fields to override.
 * @returns An `IrSchema` with sensible defaults.
 *
 * @example
 * ```ts
 * schema({
 *   types: [typeDef("UserId", primitiveType("string"))],
 * });
 * // returns a schema containing one typedef
 * ```
 */
export function schema(overrides: Partial<IrSchema> = {}): IrSchema {
  return {
    entryPoint: "/schema.vdl",
    constants: [],
    enums: [],
    types: [],
    docs: [],
    ...overrides,
  };
}

/**
 * Creates a `PluginInput` with a default version,
 * empty options, and an empty schema.
 *
 * Pass `overrides` to customize any field.
 *
 * @param overrides - Plugin input fields to override.
 * @returns A ready-to-use `PluginInput` for tests.
 *
 * @example
 * ```ts
 * pluginInput({
 *   options: { prefix: "Api" },
 * });
 * // returns a PluginInput with default version and schema
 * ```
 */
export function pluginInput(overrides: Partial<PluginInput> = {}): PluginInput {
  return {
    version: "0.5.0",
    options: {},
    ir: schema(),
    ...overrides,
  };
}
