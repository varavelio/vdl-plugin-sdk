import { assert, fail } from "../../core";
import type {
  IrSchema,
  LiteralValue,
  Position,
  PrimitiveType,
  TypeDef,
  TypeRef,
} from "../../core/types";
import { unwrapLiteral } from "../ir/unwrap-literal";
import type { EventPlaceholder, ValidatedEvent } from "./types";

const EVENT_ANNOTATION_NAME = "event";

/**
 * Asserts that event IR structures follow VPP-4 conventions.
 *
 * This helper validates `@event` types in one fail-fast pass and returns
 * resolved events with placeholder metadata for code generation.
 *
 * Validation covers annotation shape, object payloads, placeholder syntax,
 * top-level field existence, primitive field types and first-appearance
 * parameter order. Every violation throws `PluginError`.
 *
 * @param ir - Fully resolved VDL IR schema to validate.
 * @returns Validated events with placeholder metadata, sorted by name.
 *
 * @example
 * ```ts
 * import { definePlugin } from "@varavel/vdl-plugin-sdk";
 * import { assertValidIrForEvents } from "@varavel/vdl-plugin-sdk/utils/events";
 *
 * export const generate = definePlugin((input) => {
 *   const events = assertValidIrForEvents(input.ir);
 *
 *   return {
 *     files: events.map((event) => ({
 *       path: `${event.name}.ts`,
 *       content: `// ${event.subjectTemplate}`,
 *     })),
 *   };
 * });
 * ```
 */
export function assertValidIrForEvents(ir: IrSchema): ValidatedEvent[] {
  rejectEventOutsideTypes(ir);

  const typesByName = new Map<string, TypeDef>();
  for (const typeDef of ir.types) {
    typesByName.set(typeDef.name, typeDef);
  }

  const events: ValidatedEvent[] = [];
  for (const typeDef of ir.types) {
    const annotation = typeDef.annotations.find(
      (item) => item.name === EVENT_ANNOTATION_NAME,
    );
    if (!annotation) {
      continue;
    }
    events.push(
      validateEventType(
        typeDef,
        annotation.position,
        annotation.argument,
        typesByName,
      ),
    );
  }

  events.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  return events;
}

function rejectEventOutsideTypes(ir: IrSchema): void {
  for (const enumDef of ir.enums) {
    const annotation = enumDef.annotations.find(
      (item) => item.name === EVENT_ANNOTATION_NAME,
    );
    if (annotation) {
      fail(
        `Annotation @event is only allowed on type declarations, found on enum ${JSON.stringify(enumDef.name)}.`,
        annotation.position,
      );
    }
  }
  for (const constant of ir.constants) {
    const annotation = constant.annotations.find(
      (item) => item.name === EVENT_ANNOTATION_NAME,
    );
    if (annotation) {
      fail(
        `Annotation @event is only allowed on type declarations, found on constant ${JSON.stringify(constant.name)}.`,
        annotation.position,
      );
    }
  }
}

function validateEventType(
  typeDef: TypeDef,
  annotationPosition: Position,
  argument: LiteralValue | undefined,
  typesByName: Map<string, TypeDef>,
): ValidatedEvent {
  if (argument === undefined || argument.kind !== "string") {
    fail(
      `Type ${JSON.stringify(typeDef.name)} annotation @event must have a string subject template argument.`,
      annotationPosition,
    );
  }

  const template = unwrapLiteral<string>(argument as LiteralValue);
  if (typeof template !== "string") {
    fail(
      `Type ${JSON.stringify(typeDef.name)} annotation @event must have a string subject template argument.`,
      annotationPosition,
    );
  }

  assert(
    typeDef.typeRef.kind === "object",
    `Type ${JSON.stringify(typeDef.name)} is annotated with @event and must be an object type.`,
    typeDef.position,
  );

  const fields = typeDef.typeRef.objectFields ?? [];
  const names = parseSubjectTemplate(
    typeDef.name,
    template,
    annotationPosition,
  );

  const seen = new Set<string>();
  const placeholders: EventPlaceholder[] = [];
  for (const name of names) {
    if (seen.has(name)) {
      continue;
    }
    seen.add(name);
    const field = fields.find((item) => item.name === name);
    if (!field) {
      fail(
        `Type ${JSON.stringify(typeDef.name)} annotation @event placeholder ${JSON.stringify(name)} does not match any payload field.`,
        annotationPosition,
      );
    }
    if (field.optional) {
      fail(
        `Type ${JSON.stringify(typeDef.name)} annotation @event placeholder ${JSON.stringify(name)} must reference only required fields.`,
        annotationPosition,
      );
    }
    const primitiveType = resolvePrimitiveType(
      typeDef.name,
      field.typeRef,
      typesByName,
      annotationPosition,
    );
    if (!primitiveType) {
      fail(
        `Type ${JSON.stringify(typeDef.name)} annotation @event placeholder ${JSON.stringify(name)} must reference only primitive fields.`,
        annotationPosition,
      );
    }
    placeholders.push({
      field: name,
      primitiveType: primitiveType as PrimitiveType,
    });
  }

  return {
    name: typeDef.name,
    position: typeDef.position,
    subjectTemplate: template,
    placeholders,
  };
}

function parseSubjectTemplate(
  typeName: string,
  template: string,
  position: Position,
): string[] {
  const names: string[] = [];
  let index = 0;
  while (index < template.length) {
    const open = template.indexOf("{", index);
    if (open === -1) {
      break;
    }
    const close = template.indexOf("}", open + 1);
    if (close === -1) {
      fail(
        `Type ${JSON.stringify(typeName)} annotation @event subject template has an unclosed placeholder in its subject template.`,
        position,
      );
    }
    const inner = template.slice(open + 1, close);
    if (!isIdentifier(inner)) {
      fail(
        `Type ${JSON.stringify(typeName)} annotation @event placeholder ${JSON.stringify(inner)} must be a top-level field name.`,
        position,
      );
    }
    names.push(inner);
    index = close + 1;
  }
  const stray = template.indexOf("}", index);
  if (stray !== -1) {
    fail(
      `Type ${JSON.stringify(typeName)} annotation @event subject template has a stray closing brace in its subject template.`,
      position,
    );
  }
  return names;
}

function isIdentifier(value: string): boolean {
  if (value.length === 0) {
    return false;
  }
  const first = value.charCodeAt(0) as number;
  if (!isAlpha(first)) {
    return false;
  }
  for (let i = 1; i < value.length; i += 1) {
    if (!isAlphaNum(value.charCodeAt(i) as number)) {
      return false;
    }
  }
  return true;
}

function isAlpha(code: number): boolean {
  return (
    (code >= 65 && code <= 90) || (code >= 97 && code <= 122) || code === 95
  );
}

function isAlphaNum(code: number): boolean {
  return isAlpha(code) || (code >= 48 && code <= 57);
}

function resolvePrimitiveType(
  typeName: string,
  typeRef: TypeRef,
  typesByName: Map<string, TypeDef>,
  position: Position,
): PrimitiveType | undefined {
  const seen = new Set<string>();
  let current = typeRef;
  for (;;) {
    if (current.kind === "primitive" && current.primitiveName) {
      return current.primitiveName;
    }
    if (current.kind === "type" && current.typeName) {
      if (seen.has(current.typeName)) {
        fail(
          `Type ${JSON.stringify(typeName)} annotation @event has a circular type reference.`,
          position,
        );
      }
      seen.add(current.typeName);
      const target = typesByName.get(current.typeName);
      if (!target) {
        fail(
          `Type ${JSON.stringify(typeName)} annotation @event points to unknown type ${JSON.stringify(current.typeName)}.`,
          position,
        );
      }
      current = (target as TypeDef).typeRef;
      continue;
    }
    return undefined;
  }
}
