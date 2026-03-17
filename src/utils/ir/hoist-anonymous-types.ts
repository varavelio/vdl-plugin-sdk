import type { Field, IrSchema, Position, TypeDef, TypeRef } from "../../types";
import { hydrateIrSchema } from "../../types";
import { pascalCase } from "../strings/pascal-case";

/**
 * Information passed to the optional custom naming callback.
 */
export type HoistNameContext = {
  /**
   * Source path used to build the generated type name.
   *
   * Examples:
   *
   * - `MyRpc.barProc.input` -> `['MyRpc', 'barProc', 'input']`
   * - `Response.items[]` -> `['Response', 'items', 'Item']`
   * - `Response.meta{}` -> `['Response', 'meta', 'Value']`
   */
  parts: string[];
  /**
   * Current named parent type.
   */
  parentName: string;
  /**
   * Name the SDK would use by default.
   */
  defaultName: string;
};

/**
 * Hoists anonymous inline object types into generated top-level `TypeDef`s.
 *
 * This helper keeps the original IR shape intact at the compiler level, but
 * gives plugin authors an easy way to flatten nested object types when they
 * prefer a fully named type graph.
 *
 * Default behavior:
 *
 * - field objects become names like `MyRpcBarProcInput`
 * - anonymous array items end with `Item`
 * - anonymous map values end with `Value`
 * - name conflicts are resolved automatically with `2`, `3`, and so on
 * - the input schema is never mutated
 *
 * Pass `nameFn` if you want to override how generated names are produced.
 *
 * @param schema - IR schema to transform.
 * @param nameFn - Optional callback that returns the generated type name.
 * @returns A new schema where nested anonymous object types are hoisted.
 *
 * @example
 * ```ts
 * const flatSchema = ir.hoistAnonymousTypes(schema);
 * ```
 *
 * @example
 * ```ts
 * const flatSchema = ir.hoistAnonymousTypes(schema, ({ defaultName }) => {
 *   return `${defaultName}Dto`;
 * });
 * ```
 */
export function hoistAnonymousTypes(
  schema: IrSchema,
  nameFn?: (context: HoistNameContext) => string,
): IrSchema {
  const output = hydrateIrSchema(schema);
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
