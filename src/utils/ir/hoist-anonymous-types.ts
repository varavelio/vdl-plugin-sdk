import type { Field, Position, TypeDef, TypeRef } from "../../core/types";
import { IrSchema } from "../../core/types";
import { pascalCase } from "../strings/pascal-case";

/**
 * Naming information passed to the optional `nameFn` callback used by
 * `hoistAnonymousTypes`.
 *
 * The callback is invoked once for every anonymous inline object that is about
 * to become a generated top-level type.
 *
 * You can think of this object as the "naming explanation" for a single hoist
 * operation: it tells you where the anonymous object came from, what its parent
 * named type is, and which name the SDK would use if you do nothing.
 *
 * The callback runs before the SDK resolves collisions. This means:
 *
 * - return `defaultName` to keep the built-in behavior
 * - return a custom base name to override it
 * - if the returned name already exists, the SDK will still make it unique by
 *   appending `2`, `3`, and so on
 * - if the returned name is blank after trimming, `hoistAnonymousTypes` throws
 *
 * This type is intentionally small so plugin authors can understand it quickly
 * from the docs alone.
 *
 * @example
 * ```ts
 * const flatSchema = ir.hoistAnonymousTypes(schema, ({ defaultName }) => {
 *   return `${defaultName}Dto`;
 * });
 * ```
 *
 * @example
 * ```ts
 * const flatSchema = ir.hoistAnonymousTypes(schema, ({ parts, defaultName }) => {
 *   if (parts.at(-1) === "input") return `${defaultName}Request`;
 *   if (parts.at(-1) === "output") return `${defaultName}Response`;
 *   return defaultName;
 * });
 * ```
 */
export type HoistNameContext = {
  /**
   * Source path used to derive the generated type name.
   *
   * Each item represents one naming segment.
   *
   * For regular nested object fields, `parts` follows the field path.
   *
   * For anonymous objects inside arrays or maps, the SDK appends a synthetic
   * segment so the generated name stays readable and deterministic:
   *
   * - array item objects append `Item`
   * - map value objects append `Value`
   *
   * Examples:
   *
   * - `MyRpc.barProc.input` -> `['MyRpc', 'barProc', 'input']`
   * - `Response.items[]` -> `['Response', 'items', 'Item']`
   * - `Response.meta{}` -> `['Response', 'meta', 'Value']`
   */
  parts: string[];
  /**
   * Name of the nearest named parent type being traversed.
   *
   * For a direct child of an existing top-level type, this is that top-level
   * type name.
   *
   * For an anonymous object nested inside another anonymous object that was
   * already hoisted, this becomes the generated name of that synthetic parent
   * type.
   */
  parentName: string;
  /**
   * Name the SDK would use if no custom `nameFn` were provided.
   *
   * This is usually the best starting point for custom naming. Most callbacks
   * only need to add a prefix/suffix or swap a few special cases.
   */
  defaultName: string;
};

/**
 * Hoists anonymous inline object types into generated top-level `TypeDef`s.
 *
 * This helper converts nested anonymous object types into named top-level IR
 * types.
 *
 * It exists for plugin authors who want a flatter, easier-to-generate type
 * graph without changing the compiler's canonical IR format.
 *
 * In other words: the compiler can keep emitting faithful nested IR, and a
 * plugin can call this helper when it wants to treat inline object shapes as
 * "syntactic sugar" and work only with named types.
 *
 * What the helper does:
 *
 * - walks `schema.types`
 * - finds anonymous inline objects nested inside those top-level types
 * - creates a new synthetic top-level `TypeDef` for each one
 * - replaces the original inline object with a `kind: "type"` reference to the
 *   generated type name
 * - repeats the same process recursively for deeper nested objects
 * - also hoists anonymous objects that appear inside arrays and maps
 * - never mutates the input schema
 *
 * Default naming behavior:
 *
 * - nested field objects become names like `MyRpcBarProcInput`
 * - anonymous array item objects end with `Item`
 * - anonymous map value objects end with `Value`
 * - name conflicts are resolved automatically with `2`, `3`, and so on
 *
 * Scope and non-goals:
 *
 * - only anonymous objects reachable from `schema.types` are hoisted
 * - constants, enums, docs, and already named type references are left alone
 * - identical object shapes are not deduplicated; each anonymous occurrence is
 *   treated as its own generated type
 *
 * This makes the function especially useful for languages or generators that do
 * not want to preserve nested inline object syntax in the output.
 *
 * @param schema - IR schema to transform.
 * @param nameFn - Optional callback that returns the base name to use for each
 * generated type before uniqueness suffixes are applied.
 * @returns A new schema where nested anonymous object types have been hoisted to
 * top-level named types.
 *
 * @example
 * ```ts
 * const flatSchema = ir.hoistAnonymousTypes(schema);
 *
 * flatSchema.types.map((typeDef) => typeDef.name);
 * // ['FooType', 'MyRpc', 'MyRpcBarProc', 'MyRpcBarProcInput', 'MyRpcBarProcOutput']
 * ```
 *
 * @example
 * ```ts
 * const flatSchema = ir.hoistAnonymousTypes(schema, ({ defaultName }) => {
 *   return `${defaultName}Dto`;
 * });
 *
 * // Example:
 * // Request.payload { ... }
 * // becomes a generated type named RequestPayloadDto
 * ```
 *
 * @example
 * ```ts
 * // Before hoisting:
 * // type Api {
 * //   request {
 * //     payload {
 * //       id string
 * //     }
 * //   }
 * // }
 *
 * const flatSchema = ir.hoistAnonymousTypes(schema);
 *
 * // After hoisting, the plugin can work with top-level names like:
 * // - Api
 * // - ApiRequest
 * // - ApiRequestPayload
 * ```
 */
export function hoistAnonymousTypes(
  schema: IrSchema,
  nameFn?: (context: HoistNameContext) => string,
): IrSchema {
  const output = IrSchema.hydrate(schema);
  const usedNames = new Set(output.types.map((typeDef) => typeDef.name));
  const flatTypes: TypeDef[] = [];

  for (const typeDef of output.types) {
    const hoisted: TypeDef[] = [];

    typeDef.typeRef = visitTypeRef(
      typeDef.typeRef,
      [typeDef.name],
      typeDef.name,
      typeDef.position,
      hoisted,
      usedNames,
      nameFn,
      false,
    );

    flatTypes.push(typeDef, ...hoisted);
  }

  output.types = flatTypes;
  return output;
}

function visitField(
  field: Field,
  parts: string[],
  parentName: string,
  hoisted: TypeDef[],
  usedNames: Set<string>,
  nameFn: ((context: HoistNameContext) => string) | undefined,
): Field {
  field.typeRef = visitTypeRef(
    field.typeRef,
    [...parts, field.name],
    parentName,
    field.position,
    hoisted,
    usedNames,
    nameFn,
    true,
  );

  return field;
}

function visitTypeRef(
  typeRef: TypeRef,
  parts: string[],
  parentName: string,
  position: Position,
  hoisted: TypeDef[],
  usedNames: Set<string>,
  nameFn: ((context: HoistNameContext) => string) | undefined,
  shouldHoistObject: boolean,
): TypeRef {
  switch (typeRef.kind) {
    case "array":
      if (typeRef.arrayType) {
        typeRef.arrayType = visitTypeRef(
          typeRef.arrayType,
          [...parts, "Item"],
          parentName,
          position,
          hoisted,
          usedNames,
          nameFn,
          true,
        );
      }

      return typeRef;
    case "map":
      if (typeRef.mapType) {
        typeRef.mapType = visitTypeRef(
          typeRef.mapType,
          [...parts, "Value"],
          parentName,
          position,
          hoisted,
          usedNames,
          nameFn,
          true,
        );
      }

      return typeRef;
    case "object":
      if (shouldHoistObject) {
        return hoistObject(
          typeRef,
          parts,
          parentName,
          position,
          hoisted,
          usedNames,
          nameFn,
        );
      }

      typeRef.objectFields = typeRef.objectFields?.map((field) =>
        visitField(field, parts, parentName, hoisted, usedNames, nameFn),
      );

      return typeRef;
    default:
      return typeRef;
  }
}

function hoistObject(
  typeRef: TypeRef,
  parts: string[],
  parentName: string,
  position: Position,
  hoisted: TypeDef[],
  usedNames: Set<string>,
  nameFn: ((context: HoistNameContext) => string) | undefined,
): TypeRef {
  const defaultName = pascalCase(parts.join(" "));
  const baseName = (
    nameFn?.({
      parts: [...parts],
      parentName,
      defaultName,
    }) ?? defaultName
  ).trim();

  if (baseName === "") {
    throw new Error(
      `hoistAnonymousTypes could not generate a name for '${parts.join(".")}'.`,
    );
  }

  const name = makeUniqueName(baseName, usedNames);
  const generated: TypeDef = {
    position: copyPosition(position),
    name,
    annotations: [],
    typeRef: {
      kind: "object",
      objectFields: [],
    },
  };

  hoisted.push(generated);

  generated.typeRef.objectFields = typeRef.objectFields?.map((field) =>
    visitField(field, parts, name, hoisted, usedNames, nameFn),
  );

  return {
    kind: "type",
    typeName: name,
  };
}

function makeUniqueName(baseName: string, usedNames: Set<string>): string {
  if (!usedNames.has(baseName)) {
    usedNames.add(baseName);
    return baseName;
  }

  let index = 2;
  let name = `${baseName}${index}`;

  while (usedNames.has(name)) {
    index += 1;
    name = `${baseName}${index}`;
  }

  usedNames.add(name);
  return name;
}

function copyPosition(position: Position): Position {
  return {
    file: position.file,
    line: position.line,
    column: position.column,
  };
}
