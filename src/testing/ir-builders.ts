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
 * Intermediate Representation Builder — a collection of test factory functions
 * for constructing well-formed IR nodes with sensible defaults.
 *
 * Use `irb` in unit tests to create `IrSchema`, `TypeDef`, `EnumDef`,
 * `ConstantDef`, `Field`, `TypeRef`, `LiteralValue`, `Annotation`, and other
 * IR structures without manually supplying every required property.
 *
 * @example
 * ```ts
 * const input = irb.pluginInput({
 *   ir: irb.schema({
 *     types: [
 *       irb.typeDef("MyType", irb.primitiveType("string"))
 *     ],
 *   }),
 * });
 * ```
 */
export const irb = {
  /**
   * Creates a `Position` with sensible defaults.
   *
   * Pass `overrides` to customize specific fields.
   */
  position(overrides: Partial<Position> = {}): Position {
    return {
      file: "schema.vdl",
      line: 1,
      column: 1,
      ...overrides,
    };
  },

  /**
   * Creates an `Annotation` with the given name
   * and an optional literal argument.
   */
  annotation(name: string, argument?: LiteralValue): Annotation {
    return {
      position: irb.position(),
      name,
      argument,
    };
  },

  /**
   * Creates a string `LiteralValue`.
   */
  stringLiteral(value: string): LiteralValue {
    return {
      position: irb.position(),
      kind: "string",
      stringValue: value,
    };
  },

  /**
   * Creates an integer `LiteralValue`.
   */
  intLiteral(value: number): LiteralValue {
    return {
      position: irb.position(),
      kind: "int",
      intValue: value,
    };
  },

  /**
   * Creates a float `LiteralValue`.
   */
  floatLiteral(value: number): LiteralValue {
    return {
      position: irb.position(),
      kind: "float",
      floatValue: value,
    };
  },

  /**
   * Creates a boolean `LiteralValue`.
   */
  boolLiteral(value: boolean): LiteralValue {
    return {
      position: irb.position(),
      kind: "bool",
      boolValue: value,
    };
  },

  /**
   * Creates an array `LiteralValue` from a list of literal items.
   */
  arrayLiteral(items: LiteralValue[]): LiteralValue {
    return {
      position: irb.position(),
      kind: "array",
      arrayItems: items,
    };
  },

  /**
   * Creates an object `LiteralValue` from a plain key/value record.
   */
  objectLiteral(entries: Record<string, LiteralValue>): LiteralValue {
    return {
      position: irb.position(),
      kind: "object",
      objectEntries: Object.keys(entries).map((key) => ({
        position: irb.position(),
        key,
        value: entries[key] as LiteralValue,
      })),
    };
  },

  /**
   * Creates a primitive `TypeRef` (e.g. `string`, `int`, `bool`).
   */
  primitiveType(name: PrimitiveType): TypeRef {
    return {
      kind: "primitive",
      primitiveName: name,
    };
  },

  /**
   * Creates a `TypeRef` that references a named user-defined type.
   */
  namedType(name: string): TypeRef {
    return {
      kind: "type",
      typeName: name,
    };
  },

  /**
   * Creates a `TypeRef` that references a named enum type.
   */
  enumType(name: string, enumType: EnumDef["enumType"]): TypeRef {
    return {
      kind: "enum",
      enumName: name,
      enumType,
    };
  },

  /**
   * Creates an array `TypeRef` wrapping the given element type.
   *
   * @param dims - Number of array dimensions (defaults to 1).
   */
  arrayType(type: TypeRef, dims = 1): TypeRef {
    return {
      kind: "array",
      arrayType: type,
      arrayDims: dims,
    };
  },

  /**
   * Creates a map `TypeRef` whose value type is `type`.
   */
  mapType(type: TypeRef): TypeRef {
    return {
      kind: "map",
      mapType: type,
    };
  },

  /**
   * Creates an inline object `TypeRef` with the given fields.
   */
  objectType(fields: Field[]): TypeRef {
    return {
      kind: "object",
      objectFields: fields,
    };
  },

  /**
   * Creates a `Field` with the given name and type.
   *
   * Pass `overrides` to set `optional`, `annotations`, or `doc`.
   */
  field(
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
      position: irb.position(),
      name,
      doc: overrides.doc,
      optional: overrides.optional ?? false,
      annotations: overrides.annotations ?? [],
      typeRef,
    };
  },

  /**
   * Creates a `TypeDef` with the given name and underlying type.
   *
   * Pass `overrides` to set `annotations` or `doc`.
   */
  typeDef(
    name: string,
    typeRef: TypeRef,
    overrides: Partial<
      Omit<TypeDef, "position" | "name" | "typeRef" | "annotations">
    > & {
      annotations?: Annotation[];
    } = {},
  ): TypeDef {
    return {
      position: irb.position(),
      name,
      doc: overrides.doc,
      annotations: overrides.annotations ?? [],
      typeRef,
    };
  },

  /**
   * Creates an `EnumMember` with the given name and literal value.
   *
   * Pass `overrides` to set `annotations` or `doc`.
   */
  enumMember(
    name: string,
    value: LiteralValue,
    overrides: Partial<
      Omit<EnumMember, "position" | "name" | "value" | "annotations">
    > & {
      annotations?: Annotation[];
    } = {},
  ): EnumMember {
    return {
      position: irb.position(),
      name,
      value,
      doc: overrides.doc,
      annotations: overrides.annotations ?? [],
    };
  },

  /**
   * Creates an `EnumDef` with the given name, value type, and members.
   *
   * Pass `overrides` to set `annotations` or `doc`.
   */
  enumDef(
    name: string,
    enumValueType: EnumDef["enumType"],
    members: EnumMember[],
    overrides: Partial<
      Omit<
        EnumDef,
        "position" | "name" | "enumType" | "members" | "annotations"
      >
    > & {
      annotations?: Annotation[];
    } = {},
  ): EnumDef {
    return {
      position: irb.position(),
      name,
      doc: overrides.doc,
      annotations: overrides.annotations ?? [],
      enumType: enumValueType,
      members,
    };
  },

  /**
   * Creates a `ConstantDef` with the given name, type, and literal value.
   *
   * Pass `overrides` to set `annotations` or `doc`.
   */
  constantDef(
    name: string,
    typeRef: TypeRef,
    value: LiteralValue,
    overrides: Partial<
      Omit<
        ConstantDef,
        "position" | "name" | "typeRef" | "value" | "annotations"
      >
    > & {
      annotations?: Annotation[];
    } = {},
  ): ConstantDef {
    return {
      position: irb.position(),
      name,
      doc: overrides.doc,
      annotations: overrides.annotations ?? [],
      typeRef,
      value,
    };
  },

  /**
   * Creates an `IrSchema` with empty collections.
   *
   * Pass `overrides` to populate `constants`, `enums`, `types`, or `docs`.
   */
  schema(overrides: Partial<IrSchema> = {}): IrSchema {
    return {
      entryPoint: "/schema.vdl",
      constants: [],
      enums: [],
      types: [],
      docs: [],
      ...overrides,
    };
  },

  /**
   * Creates a `PluginInput` with a default version,
   * empty options, and an empty schema.
   *
   * Pass `overrides` to customize any field.
   */
  pluginInput(overrides: Partial<PluginInput> = {}): PluginInput {
    return {
      version: "0.5.0",
      options: {},
      ir: irb.schema(),
      ...overrides,
    };
  },
};
