import type { Position } from "../../core/types";

/**
 * Root available inside a policy expression.
 *
 * Only roots declared by the policy type may be used.
 */
export type PolicyRootName = "principal" | "resource" | "context";

/**
 * Scalar value kind understood by the policy language.
 */
export type PolicyScalarKind =
  | "string"
  | "int"
  | "float"
  | "bool"
  | "datetime"
  | "enum";

/**
 * Resolved value type carried by refs and literals for code generation.
 */
export type PolicyValueType =
  | { kind: "string" }
  | { kind: "int" }
  | { kind: "float" }
  | { kind: "bool" }
  | { kind: "datetime" }
  | { kind: "enum"; enumName: string }
  | {
      kind: "array";
      element: PolicyScalarKind | { kind: "enum"; enumName: string };
    }
  | { kind: "object"; typeName: string };

/**
 * One segment of a resolved policy reference.
 */
export type PolicyRefSegment = {
  /** Field name for this segment. */
  name: string;
  /** True when this field is optional in VDL. */
  optional: boolean;
  /** Resolved type of this segment. */
  valueType: PolicyValueType;
};

/**
 * Reference to a policy input field, with resolved metadata.
 */
export type PolicyRef = {
  kind: "ref";
  /** Which policy root this reference starts from. */
  root: PolicyRootName;
  /** Field path after the root. */
  path: string[];
  /** Resolved metadata per path segment. */
  segments: PolicyRefSegment[];
  /** Resolved type of the final path element. */
  valueType: PolicyValueType;
  /** True when any segment is optional and the chain may be missing. */
  optional: boolean;
};

/**
 * Scalar literal inside a policy expression.
 */
export type PolicyLiteral = {
  kind: "literal";
  /** Native literal value. */
  value: string | number | boolean;
  /** Resolved literal type. */
  valueType: PolicyValueType;
};

/**
 * Array of scalar items used with `in`.
 */
export type PolicyArray = {
  kind: "array";
  /** Array items, each a scalar ref or literal. */
  items: PolicyExpr[];
  /** Array type with homogeneous element type. */
  valueType: Extract<PolicyValueType, { kind: "array" }>;
};

/**
 * Policy expression with resolved types for code generation.
 */
export type PolicyExpr =
  | { kind: "or"; options: PolicyExpr[] }
  | { kind: "and"; clauses: PolicyExpr[] }
  | { kind: "not"; value: PolicyExpr }
  | {
      kind: "comparison";
      operator: "==" | "!=" | ">" | ">=" | "<" | "<=";
      left: PolicyExpr;
      right: PolicyExpr;
    }
  | { kind: "in"; value: PolicyExpr; candidates: PolicyExpr }
  | { kind: "has"; ref: PolicyRef }
  | PolicyRef
  | PolicyLiteral
  | PolicyArray;

/**
 * Validated policy ready for code generation.
 */
export type ValidatedPolicy = {
  /** Policy type name, used as action identifier. */
  name: string;
  /** Source position of the policy type. */
  position: Position;
  /** Policy language version, currently always 1. */
  version: number;
  /** Name of the principal object type. */
  principalType: string;
  /** Name of the resource object type, when present. */
  resourceType?: string;
  /** Name of the context object type, when present. */
  contextType?: string;
  /** Resolved allow expression, always boolean. */
  allow: PolicyExpr;
  /** Resolved deny expression, when present. */
  deny?: PolicyExpr;
};
