import type { Position, PrimitiveType } from "../../core/types";

/**
 * Placeholder found in an event subject template.
 */
export type EventPlaceholder = {
  /** Payload field referenced by the placeholder. */
  field: string;
  /** Primitive type of the payload field. */
  primitiveType: PrimitiveType;
};

/**
 * Validated event ready for code generation.
 */
export type ValidatedEvent = {
  /** Event payload type name. */
  name: string;
  /** Source position of the event type. */
  position: Position;
  /** Literal subject template from the annotation, for catalogs. */
  subjectTemplate: string;
  /** Placeholder fields in order of first appearance, deduplicated. */
  placeholders: EventPlaceholder[];
};
