import type {
  Annotation,
  ConstantDef,
  EnumDef,
  EnumMember,
  Field,
  IrSchema,
  LiteralValue,
  ObjectEntry,
  TopLevelDoc,
  TypeDef,
  TypeRef,
} from "../../../core/types";
import { indent } from "../../strings/indent";

/**
 * Supported VDL IR nodes that can be re-rendered into canonical VDL source.
 *
 * The emitted text is a best-effort reconstruction from normalized IR. It does
 * not restore source features that are intentionally lost during analysis, such
 * as comments, includes, spreads, or reference-based constant values.
 */
export type GenerateVdlNode =
  | Partial<IrSchema>
  | ConstantDef
  | EnumDef
  | TypeDef
  | TopLevelDoc;

/**
 * Top-level IR nodes that may be emitted as part of a schema or independently.
 */
type TopLevelNode = ConstantDef | EnumDef | TypeDef | TopLevelDoc;

/**
 * Reconstructs canonical VDL source code from a normalized IR node.
 *
 * Schema generation sorts top-level nodes by it's source position so the emitted
 * document remains close to the original traversal order even though the IR is
 * stored in separate collections.
 *
 * When no position information is available, the code is generated following the
 * IR collection order (docs -> types -> enums -> constants) and the original order
 * of nodes within each collection.
 *
 * @param node - Schema or top-level IR node to render.
 * @returns Valid VDL source for the provided node.
 */
export function generateVdl(node: GenerateVdlNode): string {
  // Discriminate node type by presence of unique properties.
  // If no known properties are found, an empty string is returned.
  if ("entryPoint" in node) return generateSchema(node);
  if ("content" in node) return generateDoc(node);
  if ("typeRef" in node) return generateType(node);
  if ("members" in node) return generateEnum(node);
  if ("value" in node) return generateConstant(node);
  return "";
}

/**
 * Generates VDL source for a schema by rendering all top-level nodes in a
 * deterministic order based on their source position. Nodes without a position
 * are sorted after nodes with a position, and their relative order is determined
 * by their original order in the IR collections.
 *
 * @param schema - Partial IR schema to generate. Missing collections are treated as empty.
 * @returns Valid VDL source for the provided schema.
 */
function generateSchema(schema: Partial<IrSchema>): string {
  // Flatten all top-level nodes into a single array for sorting and rendering
  const nodes: TopLevelNode[] = [
    ...(schema.docs ?? []),
    ...(schema.types ?? []),
    ...(schema.enums ?? []),
    ...(schema.constants ?? []),
  ];

  return (
    nodes
      // Assign an index to each node
      .map((currentNode, index) => ({ currentNode, index }))
      // Sort the nodes using their original position or index as a tiebreaker
      .sort((left, right) => {
        return compareTopLevelNodes(
          left.currentNode,
          right.currentNode,
          schema.entryPoint,
          left.index,
          right.index,
        );
      })
      // Generate VDL for each node
      .map(({ currentNode }) => generateVdl(currentNode))
      // Filter out empty nodes
      .filter((source) => source.trim().length > 0)
      // Join nodes with an empty line in between
      .join("\n\n")
  );
}

/**
 * Orders two top-level nodes according to the schema rendering rules.
 *
 * Nodes are compared by file, then by line, then by column, and finally by
 * their original collection index to keep rendering stable when source
 * position data is incomplete or identical.
 *
 * @param left - First node to compare.
 * @param right - Second node to compare.
 * @param entryPoint - Preferred file path that should sort before all others.
 * @param leftIndex - Stable fallback order for the left node.
 * @param rightIndex - Stable fallback order for the right node.
 * @returns A negative number, zero, or a positive number based on sort order.
 */
function compareTopLevelNodes(
  left: TopLevelNode,
  right: TopLevelNode,
  entryPoint: string | undefined,
  leftIndex: number,
  rightIndex: number,
): number {
  const fileOrder = compareFilePaths(
    left.position.file,
    right.position.file,
    entryPoint,
  );
  if (fileOrder !== 0) return fileOrder;

  const lineOrder = left.position.line - right.position.line;
  if (lineOrder !== 0) return lineOrder;

  const columnOrder = left.position.column - right.position.column;
  if (columnOrder !== 0) return columnOrder;

  return leftIndex - rightIndex;
}

/**
 * Compares two file paths using the schema's preferred source ordering.
 *
 * The entry point, when present, is treated as the highest-priority file.
 * Empty file paths are pushed after concrete paths so incomplete position
 * metadata does not displace known source locations.
 *
 * @param left - Left file path.
 * @param right - Right file path.
 * @param entryPoint - Preferred file path for the schema, if any.
 * @returns A negative number, zero, or a positive number based on sort order.
 */
function compareFilePaths(
  left: string,
  right: string,
  entryPoint: string | undefined,
): number {
  if (left === right) return 0;
  if (entryPoint !== undefined && left === entryPoint) return -1;
  if (entryPoint !== undefined && right === entryPoint) return 1;
  if (left.length === 0) return 1;
  if (right.length === 0) return -1;
  return left.localeCompare(right);
}

/**
 * Renders a top-level documentation node.
 *
 * @param doc - Top-level doc node to render.
 * @returns A VDL docstring literal containing the provided content.
 */
function generateDoc(doc: TopLevelDoc): string {
  return renderDocstring(doc.content);
}

/**
 * Renders a type definition as canonical VDL source.
 *
 * The generated output includes any attached docstring and annotations before
 * the type declaration itself.
 *
 * @param typeDef - Type definition to render.
 * @returns VDL source for the provided type definition.
 */
function generateType(typeDef: TypeDef): string {
  return generateDecoratedBlock(
    typeDef.doc,
    typeDef.annotations,
    `type ${typeDef.name} ${generateTypeRef(typeDef.typeRef)}`,
  );
}

/**
 * Renders an enum definition as canonical VDL source.
 *
 * Each member is rendered in declaration order and wrapped in a VDL enum
 * block, preserving any docs or annotations attached to the enum or its
 * members.
 *
 * @param enumDef - Enum definition to render.
 * @returns VDL source for the provided enum definition.
 */
function generateEnum(enumDef: EnumDef): string {
  const members = enumDef.members.map((member) =>
    generateEnumMember(member, enumDef.enumType),
  );

  return generateDecoratedBlock(
    enumDef.doc,
    enumDef.annotations,
    `enum ${enumDef.name} ${generateBlockBody(members)}`,
  );
}

/**
 * Renders a single enum member declaration.
 *
 * String enums may omit explicit values when the value matches the member
 * name, while other enum members keep their assigned literal.
 *
 * @param enumMember - Enum member to render.
 * @param enumType - Declared enum storage type.
 * @returns VDL source for the provided enum member.
 */
function generateEnumMember(
  enumMember: EnumMember,
  enumType: EnumDef["enumType"],
): string {
  const assignment = shouldOmitEnumValue(enumMember, enumType)
    ? enumMember.name
    : `${enumMember.name} = ${generateLiteral(enumMember.value)}`;

  return generateDecoratedBlock(
    enumMember.doc,
    enumMember.annotations,
    assignment,
  );
}

/**
 * Determines whether an enum member can rely on its implicit string value.
 *
 * This is used to keep string enums compact when the member name and literal
 * value are already identical.
 *
 * @param enumMember - Enum member under evaluation.
 * @param enumType - Declared enum storage type.
 * @returns `true` when the value can be omitted from the rendered output.
 */
function shouldOmitEnumValue(
  enumMember: EnumMember,
  enumType: EnumDef["enumType"],
): boolean {
  return (
    enumType === "string" &&
    enumMember.value.kind === "string" &&
    enumMember.value.stringValue === enumMember.name
  );
}

/**
 * Renders a constant definition as canonical VDL source.
 *
 * The constant is emitted with its docstring and annotations, followed by the
 * fully rendered literal value.
 *
 * @param constantDef - Constant definition to render.
 * @returns VDL source for the provided constant definition.
 */
function generateConstant(constantDef: ConstantDef): string {
  return generateDecoratedBlock(
    constantDef.doc,
    constantDef.annotations,
    `const ${constantDef.name} = ${generateLiteral(constantDef.value)}`,
  );
}

/**
 * Renders a declaration together with its optional docstring and annotations.
 *
 * @param doc - Optional docstring content to place before the declaration.
 * @param annotations - Annotations to emit in source order.
 * @param declaration - Core declaration text to append last.
 * @returns A complete decorated VDL block.
 */
function generateDecoratedBlock(
  doc: string | undefined,
  annotations: Annotation[],
  declaration: string,
): string {
  const lines: string[] = [];

  if (doc !== undefined) {
    lines.push(renderDocstring(doc));
  }

  for (const annotation of annotations) {
    lines.push(generateAnnotation(annotation));
  }

  lines.push(declaration);

  return lines.join("\n");
}

/**
 * Wraps raw documentation text in VDL triple quotes.
 *
 * @param content - Docstring content to render.
 * @returns A quoted VDL docstring.
 */
function renderDocstring(content: string): string {
  return `"""${content.replace(/"""/g, '\\"\\"\\"')}"""`;
}

/**
 * Renders a single annotation in VDL source form.
 *
 * @param annotation - Annotation to render.
 * @returns The annotation as source text.
 */
function generateAnnotation(annotation: Annotation): string {
  if (annotation.argument === undefined) {
    return `@${annotation.name}`;
  }

  return `@${annotation.name}(${generateLiteral(annotation.argument)})`;
}

/**
 * Renders a type reference into VDL source syntax.
 *
 * This covers primitives, named types, enums, arrays, maps, and inline object
 * shapes, returning an empty string when the reference is incomplete.
 *
 * @param typeRef - Type reference to render.
 * @returns VDL source for the provided type reference.
 */
function generateTypeRef(typeRef: TypeRef): string {
  switch (typeRef.kind) {
    case "primitive":
      return typeRef.primitiveName ?? "";
    case "type":
      return typeRef.typeName ?? "";
    case "enum":
      return typeRef.enumName ?? "";
    case "array":
      return appendArrayDimensions(
        typeRef.arrayType === undefined
          ? ""
          : generateTypeRef(typeRef.arrayType),
        typeRef.arrayDims,
      );
    case "map":
      return `map[${typeRef.mapType === undefined ? "" : generateTypeRef(typeRef.mapType)}]`;
    case "object":
      return generateObjectType(typeRef.objectFields ?? []);
    default:
      return "";
  }
}

/**
 * Appends the requested array dimensions to a base type name.
 *
 * @param baseType - Type name or nested type expression to decorate.
 * @param arrayDims - Number of array dimensions to append.
 * @returns The base type followed by the requested array suffix.
 */
function appendArrayDimensions(baseType: string, arrayDims = 1): string {
  const normalizedDimensions = arrayDims > 0 ? arrayDims : 1;
  return `${baseType}${"[]".repeat(normalizedDimensions)}`;
}

/**
 * Renders an inline object type with its fields in declaration order.
 *
 * @param fields - Object fields to render.
 * @returns VDL block syntax for the object shape.
 */
function generateObjectType(fields: Field[]): string {
  const fieldBlocks = fields.map((field) =>
    generateDecoratedBlock(
      field.doc,
      field.annotations,
      `${field.name}${field.optional ? "?" : ""} ${generateTypeRef(field.typeRef)}`,
    ),
  );

  return generateBlockBody(fieldBlocks);
}

/**
 * Wraps a set of rendered blocks in VDL brace syntax.
 *
 * Empty block lists are rendered as an empty object literal, while non-empty
 * blocks are indented and separated to preserve readability.
 *
 * @param blocks - Inner blocks to wrap.
 * @returns A brace-delimited VDL block.
 */
function generateBlockBody(blocks: string[]): string {
  if (blocks.length === 0) {
    return "{}";
  }

  return `{\n${indent(joinComplexBlocks(blocks))}\n}`;
}

/**
 * Joins rendered blocks while preserving visual separation for nested content.
 *
 * Blocks containing line breaks are spaced more generously so complex nested
 * declarations remain easy to read in the generated source.
 *
 * @param blocks - Blocks to join.
 * @returns The blocks combined into a single string.
 */
function joinComplexBlocks(blocks: string[]): string {
  let output = "";

  for (let index = 0; index < blocks.length; index += 1) {
    const currentBlock = blocks[index];

    if (currentBlock === undefined) {
      continue;
    }

    if (index > 0) {
      const previousBlock = blocks[index - 1] ?? "";
      output +=
        previousBlock.includes("\n") || currentBlock.includes("\n")
          ? "\n\n"
          : "\n";
    }

    output += currentBlock;
  }

  return output;
}

/**
 * Renders a literal value into canonical VDL syntax.
 *
 * This covers primitive values, arrays, objects, and malformed or missing
 * inputs by falling back to the safest representable text.
 *
 * @param value - Literal value to render.
 * @returns VDL source for the provided literal.
 */
function generateLiteral(value: LiteralValue): string {
  switch (value.kind) {
    case "string":
      return JSON.stringify(value.stringValue ?? "");
    case "int":
      return String(value.intValue ?? 0);
    case "float":
      return formatFloatLiteral(value.floatValue);
    case "bool":
      return value.boolValue === true ? "true" : "false";
    case "array":
      return generateArrayLiteral(value.arrayItems ?? []);
    case "object":
      return generateObjectLiteral(value.objectEntries ?? []);
    default:
      return "";
  }
}

/**
 * Renders an array literal and chooses a compact or multiline form.
 *
 * @param items - Array items to render.
 * @returns VDL source for the array literal.
 */
function generateArrayLiteral(items: LiteralValue[]): string {
  if (items.length === 0) {
    return "[]";
  }

  const renderedItems = items.map((item) => generateLiteral(item));

  if (renderedItems.every((item) => !item.includes("\n"))) {
    return `[${renderedItems.join(" ")}]`;
  }

  return `[\n${indent(renderedItems.join("\n"))}\n]`;
}

/**
 * Renders an object literal with each entry on its own line.
 *
 * @param entries - Object entries to render.
 * @returns VDL source for the object literal.
 */
function generateObjectLiteral(entries: ObjectEntry[]): string {
  if (entries.length === 0) {
    return "{}";
  }

  return `{\n${indent(entries.map((entry) => generateObjectEntry(entry)).join("\n"))}\n}`;
}

/**
 * Renders a single object entry as key-value source text.
 *
 * @param entry - Object entry to render.
 * @returns The rendered object entry.
 */
function generateObjectEntry(entry: ObjectEntry): string {
  return `${entry.key} ${generateLiteral(entry.value)}`;
}

/**
 * Formats a floating-point literal into VDL-compatible text.
 *
 * Exponential notation is expanded so generated output stays explicit and
 * stable across environments.
 *
 * @param value - Numeric value to format.
 * @returns The value as a VDL float literal.
 */
function formatFloatLiteral(value: number | undefined): string {
  if (value === undefined) {
    return "0.0";
  }

  const text = String(value);

  if (!text.includes("e") && !text.includes("E")) {
    return text.includes(".") ? text : `${text}.0`;
  }

  return expandExponentialFloat(text);
}

/**
 * Expands an exponential float representation into plain decimal form.
 *
 * @param value - Float literal in scientific notation.
 * @returns The same numeric value written as a decimal string.
 */
function expandExponentialFloat(value: string): string {
  const normalizedValue = value.toLowerCase();
  const [coefficient = "0", exponentText = "0"] = normalizedValue.split("e");
  const exponent = Number(exponentText);
  const negative = coefficient.startsWith("-");
  const unsignedCoefficient = negative ? coefficient.slice(1) : coefficient;
  const [wholePart = "0", fractionalPart = ""] = unsignedCoefficient.split(".");
  const digits = `${wholePart}${fractionalPart}`;
  const decimalIndex = wholePart.length + exponent;

  let expanded = "";

  if (decimalIndex <= 0) {
    expanded = `0.${"0".repeat(-decimalIndex)}${digits}`;
  } else if (decimalIndex >= digits.length) {
    expanded = `${digits}${"0".repeat(decimalIndex - digits.length)}.0`;
  } else {
    expanded = `${digits.slice(0, decimalIndex)}.${digits.slice(decimalIndex)}`;
  }

  if (!expanded.includes(".")) {
    expanded = `${expanded}.0`;
  }

  return negative ? `-${expanded}` : expanded;
}
