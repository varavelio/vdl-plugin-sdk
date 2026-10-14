import { fail } from "../../core";
import type {
  EnumDef,
  IrSchema,
  LiteralValue,
  Position,
  TypeDef,
  TypeRef,
} from "../../core/types";
import { unwrapLiteral } from "../ir/unwrap-literal";
import type { SyntaxExpr } from "./parse-policy-expression";
import { parsePolicyExpressionSyntax } from "./parse-policy-expression";
import type {
  PolicyExpr,
  PolicyRef,
  PolicyRefSegment,
  PolicyRootName,
  PolicyValueType,
  ValidatedPolicy,
} from "./types";

const POLICY_ANNOTATION_NAME = "policy";
const SUPPORTED_VERSION = 1;

/**
 * Asserts that policy IR structures follow VPP-3 conventions.
 *
 * This helper validates `@policy` types in one fail-fast pass and returns
 * resolved policies with typed expressions for code generation.
 *
 * Validation covers annotation shape, policy type shape, expression syntax,
 * reference existence, comparison compatibility, enum values and optional
 * access guards. Every violation throws `PluginError`.
 *
 * @param ir - Fully resolved VDL IR schema to validate.
 * @returns Validated policies with resolved expressions, sorted by name.
 *
 * @example
 * ```ts
 * import { definePlugin } from "@varavel/vdl-plugin-sdk";
 * import { assertValidIrForPolicy } from "@varavel/vdl-plugin-sdk/utils/policy";
 *
 * export const generate = definePlugin((input) => {
 *   const policies = assertValidIrForPolicy(input.ir);
 *
 *   return {
 *     files: [{ path: "policies.ts", content: `// ${policies.length} policies` }],
 *   };
 * });
 * ```
 */
export function assertValidIrForPolicy(ir: IrSchema): ValidatedPolicy[] {
  rejectPolicyOutsideTypes(ir);

  const typesByName = new Map<string, TypeDef>();
  for (const typeDef of ir.types) {
    typesByName.set(typeDef.name, typeDef);
  }
  const enumsByName = new Map<string, EnumDef>();
  for (const enumDef of ir.enums) {
    enumsByName.set(enumDef.name, enumDef);
  }

  const policies: ValidatedPolicy[] = [];
  for (const typeDef of ir.types) {
    const annotation = typeDef.annotations.find(
      (item) => item.name === POLICY_ANNOTATION_NAME,
    );
    if (!annotation) {
      continue;
    }
    policies.push(
      validatePolicyType(
        typeDef,
        annotation.position,
        annotation.argument,
        typesByName,
        enumsByName,
      ),
    );
  }

  policies.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  return policies;
}

function rejectPolicyOutsideTypes(ir: IrSchema): void {
  for (const enumDef of ir.enums) {
    const annotation = enumDef.annotations.find(
      (item) => item.name === POLICY_ANNOTATION_NAME,
    );
    if (annotation) {
      fail(
        `Annotation @policy is only allowed on type declarations, found on enum ${JSON.stringify(enumDef.name)}.`,
        annotation.position,
      );
    }
  }
  for (const constant of ir.constants) {
    const annotation = constant.annotations.find(
      (item) => item.name === POLICY_ANNOTATION_NAME,
    );
    if (annotation) {
      fail(
        `Annotation @policy is only allowed on type declarations, found on constant ${JSON.stringify(constant.name)}.`,
        annotation.position,
      );
    }
  }
}

function validatePolicyType(
  typeDef: TypeDef,
  annotationPosition: Position,
  argument: LiteralValue | undefined,
  typesByName: Map<string, TypeDef>,
  enumsByName: Map<string, EnumDef>,
): ValidatedPolicy {
  if (argument === undefined || argument.kind !== "object") {
    fail(
      `Type ${JSON.stringify(typeDef.name)} annotation @policy must have an object argument with allow, deny and version.`,
      annotationPosition,
    );
  }

  const raw = unwrapLiteral<Record<string, unknown>>(argument as LiteralValue);
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    fail(
      `Type ${JSON.stringify(typeDef.name)} annotation @policy must have an object argument with allow, deny and version.`,
      annotationPosition,
    );
  }

  const allowedKeys = new Set(["allow", "deny", "version"]);
  for (const key of Object.keys(raw as Record<string, unknown>)) {
    if (!allowedKeys.has(key)) {
      fail(
        `Type ${JSON.stringify(typeDef.name)} annotation @policy has unknown key ${JSON.stringify(key)}.`,
        annotationPosition,
      );
    }
  }

  const record = raw as { allow?: unknown; deny?: unknown; version?: unknown };
  const allowRaw = record.allow;
  if (typeof allowRaw !== "string" || allowRaw.trim().length === 0) {
    fail(
      `Type ${JSON.stringify(typeDef.name)} annotation @policy requires a non-empty string allow expression.`,
      annotationPosition,
    );
  }

  const denyRaw = record.deny;
  if (
    denyRaw !== undefined &&
    (typeof denyRaw !== "string" || (denyRaw as string).trim().length === 0)
  ) {
    fail(
      `Type ${JSON.stringify(typeDef.name)} annotation @policy deny must be a non-empty string when present.`,
      annotationPosition,
    );
  }

  const entries = new Map(
    ((argument as LiteralValue).objectEntries ?? []).map((entry) => [
      entry.key,
      entry.value,
    ]),
  );
  const versionEntry = entries.get("version");
  if (versionEntry !== undefined && versionEntry.kind !== "int") {
    fail(
      `Type ${JSON.stringify(typeDef.name)} annotation @policy version must be an int.`,
      annotationPosition,
    );
  }
  const versionRaw = record.version;
  const version = versionRaw === undefined ? SUPPORTED_VERSION : versionRaw;
  if (
    typeof version !== "number" ||
    !Number.isInteger(version) ||
    version !== SUPPORTED_VERSION
  ) {
    fail(
      `Type ${JSON.stringify(typeDef.name)} annotation @policy has unsupported version ${JSON.stringify(version)}.`,
      annotationPosition,
    );
  }

  if (typeDef.typeRef.kind !== "object") {
    fail(
      `Type ${JSON.stringify(typeDef.name)} is annotated with @policy and must be an object type.`,
      typeDef.position,
    );
  }

  const fields = typeDef.typeRef.objectFields ?? [];
  if (fields.length === 0 || fields[0]?.name !== "principal") {
    fail(
      `Type ${JSON.stringify(typeDef.name)} is annotated with @policy and must declare principal as first field.`,
      typeDef.position,
    );
  }

  const names = fields.map((field) => field.name);
  const seen = new Set<string>();
  for (const name of names) {
    if (name !== "principal" && name !== "resource" && name !== "context") {
      fail(
        `Type ${JSON.stringify(typeDef.name)} is annotated with @policy and must only declare principal, resource and context fields, found ${JSON.stringify(name)}.`,
        typeDef.position,
      );
    }
    if (seen.has(name)) {
      fail(
        `Type ${JSON.stringify(typeDef.name)} is annotated with @policy and has duplicate field ${JSON.stringify(name)}.`,
        typeDef.position,
      );
    }
    seen.add(name);
  }

  const order = ["principal", "resource", "context"];
  let lastIndex = -1;
  for (const name of names) {
    const index = order.indexOf(name);
    if (index < lastIndex) {
      fail(
        `Type ${JSON.stringify(typeDef.name)} is annotated with @policy and must declare fields in principal, resource, context order.`,
        typeDef.position,
      );
    }
    lastIndex = index;
  }

  const roots = new Map<PolicyRootName, string>();
  for (const field of fields) {
    if (field.optional) {
      fail(
        `Field ${JSON.stringify(`${typeDef.name}.${field.name}`)} in policy ${JSON.stringify(typeDef.name)} must be required.`,
        field.position,
      );
    }
    const target = resolveNamedObjectType(field.typeRef, typesByName);
    if (!target) {
      fail(
        `Field ${JSON.stringify(`${typeDef.name}.${field.name}`)} in policy ${JSON.stringify(typeDef.name)} must reference a named object type.`,
        field.position,
      );
    }
    roots.set(field.name as PolicyRootName, target);
  }

  if (!roots.has("principal")) {
    fail(
      `Type ${JSON.stringify(typeDef.name)} is annotated with @policy and must declare principal.`,
      typeDef.position,
    );
  }

  const context = new PolicyContext(
    typeDef,
    annotationPosition,
    roots,
    typesByName,
    enumsByName,
  );
  const allow = context.resolveTopLevel(allowRaw as string, "allow");
  let deny: PolicyExpr | undefined;
  if (typeof denyRaw === "string") {
    deny = context.resolveTopLevel(denyRaw, "deny");
  }

  const validated: ValidatedPolicy = {
    name: typeDef.name,
    position: typeDef.position,
    version: SUPPORTED_VERSION,
    principalType: roots.get("principal") as string,
    allow,
  };
  const resourceType = roots.get("resource");
  if (resourceType) {
    validated.resourceType = resourceType;
  }
  const contextType = roots.get("context");
  if (contextType) {
    validated.contextType = contextType;
  }
  if (deny) {
    validated.deny = deny;
  }
  return validated;
}

function resolveNamedObjectType(
  typeRef: TypeRef,
  typesByName: Map<string, TypeDef>,
): string | undefined {
  if (typeRef.kind !== "type" || !typeRef.typeName) {
    return undefined;
  }
  const target = typesByName.get(typeRef.typeName);
  if (!target || target.typeRef.kind !== "object") {
    return undefined;
  }
  return target.name;
}

class PolicyContext {
  constructor(
    private readonly policyType: TypeDef,
    private readonly annotationPosition: Position,
    private readonly roots: Map<PolicyRootName, string>,
    private readonly typesByName: Map<string, TypeDef>,
    private readonly enumsByName: Map<string, EnumDef>,
  ) {}

  resolveTopLevel(source: string, which: "allow" | "deny"): PolicyExpr {
    let syntax: SyntaxExpr;
    try {
      syntax = parsePolicyExpressionSyntax(source);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      fail(
        `Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} expression is invalid: ${message}`,
        this.annotationPosition,
      );
    }
    const resolved = this.resolveExpr(
      syntax as SyntaxExpr,
      new Set<string>(),
      which,
    );
    if (!this.isBoolType(this.exprType(resolved))) {
      fail(
        `Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} expression must evaluate to bool.`,
        this.annotationPosition,
      );
    }
    return resolved;
  }

  private exprType(
    expr: PolicyExpr,
  ): PolicyValueType | { kind: "bool-marker" } {
    if (
      expr.kind === "or" ||
      expr.kind === "and" ||
      expr.kind === "not" ||
      expr.kind === "comparison" ||
      expr.kind === "in" ||
      expr.kind === "has"
    ) {
      return { kind: "bool-marker" } as unknown as PolicyValueType;
    }
    if (
      expr.kind === "ref" ||
      expr.kind === "literal" ||
      expr.kind === "array"
    ) {
      return (expr as PolicyRef | { valueType: PolicyValueType }).valueType;
    }
    return { kind: "bool-marker" } as unknown as PolicyValueType;
  }

  private isBoolType(type: PolicyValueType | { kind: string }): boolean {
    if ((type as { kind: string }).kind === "bool-marker") {
      return true;
    }
    return (type as PolicyValueType).kind === "bool";
  }

  private resolveExpr(
    syntax: SyntaxExpr,
    guards: Set<string>,
    which: string,
  ): PolicyExpr {
    switch (syntax.kind) {
      case "or": {
        const options = syntax.options.map((item) =>
          this.resolveExpr(item, new Set(guards), which),
        );
        for (const option of options) {
          this.requireBool(option, which);
        }
        return { kind: "or", options };
      }
      case "and": {
        const clauses: PolicyExpr[] = [];
        const running = new Set(guards);
        for (const item of syntax.clauses) {
          const resolved = this.resolveExpr(item, new Set(running), which);
          this.requireBool(resolved, which);
          clauses.push(resolved);
          for (const provided of this.providedGuards(resolved)) {
            running.add(provided);
          }
        }
        return { kind: "and", clauses };
      }
      case "not": {
        const value = this.resolveExpr(syntax.value, new Set(guards), which);
        this.requireBool(value, which);
        return { kind: "not", value };
      }
      case "comparison": {
        const left = this.resolveExpr(syntax.left, new Set(guards), which);
        const right = this.resolveExpr(syntax.right, new Set(guards), which);
        this.requireScalar(left, which);
        this.requireScalar(right, which);
        this.requireCompatible(
          syntax.operator === "==" || syntax.operator === "!="
            ? "equality"
            : "ordering",
          left,
          right,
          which,
        );
        if (syntax.operator !== "==" && syntax.operator !== "!=") {
          this.requireGuarded(left, right, guards, which);
        }
        return { kind: "comparison", operator: syntax.operator, left, right };
      }
      case "in": {
        const value = this.resolveExpr(syntax.value, new Set(guards), which);
        const candidates = this.resolveExpr(
          syntax.candidates,
          new Set(guards),
          which,
        );
        this.requireScalar(value, which);
        this.requireArray(candidates, which);
        this.requireInCompatible(value, candidates, which);
        this.requireInGuarded(value, candidates, guards, which);
        return { kind: "in", value, candidates };
      }
      case "has": {
        const ref = this.resolveRef(syntax.ref.root, syntax.ref.path, which);
        return { kind: "has", ref };
      }
      case "ref": {
        return this.resolveRef(syntax.root, syntax.path, which);
      }
      case "literal": {
        return this.resolveLiteral(syntax.value, syntax.literalKind);
      }
      case "array": {
        return this.resolveArray(syntax.items, guards, which);
      }
    }
  }

  private requireBool(expr: PolicyExpr, which: string): void {
    const type = this.exprType(expr);
    if (!this.isBoolType(type)) {
      fail(
        `Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} expression expects bool operands.`,
        this.annotationPosition,
      );
    }
  }

  private requireScalar(expr: PolicyExpr, which: string): void {
    if (expr.kind !== "ref" && expr.kind !== "literal") {
      fail(
        `Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} expression expects scalar operands.`,
        this.annotationPosition,
      );
    }
    const type = (expr as PolicyRef | { valueType: PolicyValueType }).valueType;
    if (type.kind === "object" || type.kind === "array") {
      fail(
        `Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} expression compares objects or arrays directly, compare fields instead.`,
        this.annotationPosition,
      );
    }
  }

  private requireArray(expr: PolicyExpr, which: string): void {
    if (
      expr.kind !== "array" &&
      !(expr.kind === "ref" && (expr as PolicyRef).valueType.kind === "array")
    ) {
      fail(
        `Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} in expects an array on the right side.`,
        this.annotationPosition,
      );
    }
  }

  private scalarKey(type: PolicyValueType): string {
    if (type.kind === "enum") {
      return `enum:${type.enumName}`;
    }
    return type.kind;
  }

  private requireCompatible(
    mode: "equality" | "ordering",
    left: PolicyExpr,
    right: PolicyExpr,
    which: string,
  ): void {
    const leftType = (left as PolicyRef | { valueType: PolicyValueType })
      .valueType;
    const rightType = (right as PolicyRef | { valueType: PolicyValueType })
      .valueType;

    if (mode === "ordering") {
      const allowed = new Set(["string", "int", "float", "datetime"]);
      if (!allowed.has(leftType.kind) || !allowed.has(rightType.kind)) {
        fail(
          `Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} ordering requires string, int, float or datetime operands.`,
          this.annotationPosition,
        );
      }
      if (leftType.kind !== rightType.kind) {
        fail(
          `Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} ordering needs matching types without conversion.`,
          this.annotationPosition,
        );
      }
      return;
    }

    if (leftType.kind === "enum" || rightType.kind === "enum") {
      this.requireEnumCompatible(left, right, which);
      return;
    }
    if (leftType.kind !== rightType.kind) {
      fail(
        `Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} equality needs matching types without conversion.`,
        this.annotationPosition,
      );
    }
    const allowed = new Set(["string", "int", "float", "bool", "datetime"]);
    if (!allowed.has(leftType.kind)) {
      fail(
        `Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} equality supports string, int, float, bool, datetime and enum only.`,
        this.annotationPosition,
      );
    }
  }

  private requireEnumCompatible(
    left: PolicyExpr,
    right: PolicyExpr,
    which: string,
  ): void {
    const leftType = (left as PolicyRef | { valueType: PolicyValueType })
      .valueType;
    const rightType = (right as PolicyRef | { valueType: PolicyValueType })
      .valueType;

    if (leftType.kind === "enum" && rightType.kind === "enum") {
      const leftEnum = (leftType as { enumName: string }).enumName;
      const rightEnum = (rightType as { enumName: string }).enumName;
      if (leftEnum !== rightEnum) {
        fail(
          `Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} compares different enums ${JSON.stringify(leftEnum)} and ${JSON.stringify(rightEnum)}.`,
          this.annotationPosition,
        );
      }
      return;
    }

    const enumSide = leftType.kind === "enum" ? left : right;
    const otherSide = leftType.kind === "enum" ? right : left;
    const enumName = (enumSide as PolicyRef | { valueType: PolicyValueType })
      .valueType as { kind: "enum"; enumName: string };
    const otherType = (otherSide as { valueType: PolicyValueType }).valueType;

    if (
      otherSide.kind !== "literal" ||
      (otherType.kind !== "string" && otherType.kind !== "int")
    ) {
      fail(
        `Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} compares enum ${(enumName as { enumName: string }).enumName} with a string or int literal only.`,
        this.annotationPosition,
      );
    }
    const literalValue = (otherSide as { value: string | number }).value as
      | string
      | number;
    if (
      !this.enumHasValue(
        (enumName as { enumName: string }).enumName,
        literalValue,
      )
    ) {
      fail(
        `Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} uses unknown enum value ${JSON.stringify(literalValue)} for enum ${JSON.stringify((enumName as { enumName: string }).enumName)}.`,
        this.annotationPosition,
      );
    }
  }

  private requireInCompatible(
    value: PolicyExpr,
    candidates: PolicyExpr,
    which: string,
  ): void {
    const leftType = (value as PolicyRef | { valueType: PolicyValueType })
      .valueType;
    let elementKind: string;
    let enumName: string | undefined;

    if (candidates.kind === "array") {
      const element = (candidates as { valueType: { element: unknown } })
        .valueType.element as { kind?: string; enumName?: string } | string;
      if (typeof element === "string") {
        elementKind = element;
      } else if (
        typeof element === "object" &&
        element !== null &&
        "enumName" in element
      ) {
        elementKind = `enum:${(element as { enumName: string }).enumName}`;
        enumName = (element as { enumName: string }).enumName;
      } else {
        elementKind = (element as { kind: string }).kind;
      }
      if ((candidates as { items: PolicyExpr[] }).items.length === 0) {
        return;
      }
    } else {
      const arrayType = (candidates as PolicyRef).valueType as {
        kind: "array";
        element: unknown;
      };
      const element = arrayType.element;
      if (typeof element === "string") {
        elementKind = element;
      } else {
        elementKind = `enum:${(element as { enumName: string }).enumName}`;
        enumName = (element as { enumName: string }).enumName;
      }
    }

    const leftKind =
      leftType.kind === "enum"
        ? `enum:${(leftType as { enumName: string }).enumName}`
        : leftType.kind;

    if (leftKind !== elementKind) {
      const enumLeft = leftType.kind === "enum";
      if (!(enumLeft && (elementKind === "string" || elementKind === "int"))) {
        fail(
          `Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} in needs compatible element types.`,
          this.annotationPosition,
        );
      }
    }

    if (leftType.kind === "enum" && enumName && leftKind !== elementKind) {
      // string array against enum left is checked per item elsewhere
    }

    if (candidates.kind === "array") {
      for (const item of (candidates as { items: PolicyExpr[] }).items) {
        if (item.kind !== "literal" && item.kind !== "ref") {
          fail(
            `Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} array holds scalars only.`,
            this.annotationPosition,
          );
        }
        const itemType = (item as PolicyRef | { valueType: PolicyValueType })
          .valueType;
        if (itemType.kind === "object" || itemType.kind === "array") {
          fail(
            `Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} array holds scalars only.`,
            this.annotationPosition,
          );
        }
        if (
          leftType.kind === "enum" &&
          item.kind === "literal" &&
          (itemType.kind === "string" || itemType.kind === "int")
        ) {
          const literalValue = (item as { value: string | number }).value as
            | string
            | number;
          if (
            !this.enumHasValue(
              (leftType as { enumName: string }).enumName,
              literalValue,
            )
          ) {
            fail(
              `Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} uses unknown enum value ${JSON.stringify(literalValue)}.`,
              this.annotationPosition,
            );
          }
          continue;
        }
        if (
          this.scalarKey(itemType) !== this.scalarKey(leftType) &&
          !(leftType.kind === "enum" && itemType.kind === "string")
        ) {
          // Allow enum left with string items already checked above
          if (leftType.kind !== "enum" || itemType.kind !== "enum") {
            fail(
              `Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} in needs homogeneous element types.`,
              this.annotationPosition,
            );
          }
        }
      }
    }
  }

  private requireGuarded(
    left: PolicyExpr,
    right: PolicyExpr,
    guards: Set<string>,
    which: string,
  ): void {
    for (const side of [left, right]) {
      if (
        side.kind === "ref" &&
        (side as PolicyRef).optional &&
        !this.isGuarded(side as PolicyRef, guards)
      ) {
        fail(
          `Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} needs has() guard for optional access ${JSON.stringify(this.refLabel(side as PolicyRef))}.`,
          this.annotationPosition,
        );
      }
    }
  }

  private requireInGuarded(
    value: PolicyExpr,
    candidates: PolicyExpr,
    guards: Set<string>,
    which: string,
  ): void {
    const refs: PolicyRef[] = [];
    if (value.kind === "ref") {
      refs.push(value as PolicyRef);
    }
    if (candidates.kind === "ref") {
      refs.push(candidates as PolicyRef);
    }
    if (candidates.kind === "array") {
      for (const item of (candidates as { items: PolicyExpr[] }).items) {
        if (item.kind === "ref") {
          refs.push(item as PolicyRef);
        }
      }
    }
    for (const ref of refs) {
      if (ref.optional && !this.isGuarded(ref, guards)) {
        fail(
          `Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} needs has() guard for optional access ${JSON.stringify(this.refLabel(ref))}.`,
          this.annotationPosition,
        );
      }
    }
  }

  private providedGuards(expr: PolicyExpr): string[] {
    if (expr.kind === "has") {
      return [this.refKey((expr as { ref: PolicyRef }).ref)];
    }
    if (expr.kind === "and") {
      const out: string[] = [];
      for (const clause of (expr as { clauses: PolicyExpr[] }).clauses) {
        out.push(...this.providedGuards(clause));
      }
      return out;
    }
    return [];
  }

  private refKey(ref: PolicyRef): string {
    return `${ref.root}.${ref.path.join(".")}`;
  }

  private refLabel(ref: PolicyRef): string {
    return `${ref.root}.${ref.path.join(".")}`;
  }

  private isGuarded(ref: PolicyRef, guards: Set<string>): boolean {
    if (!ref.optional) {
      return true;
    }
    for (let i = 0; i < ref.segments.length; i += 1) {
      const segment = ref.segments[i] as PolicyRefSegment;
      if (!segment.optional) {
        continue;
      }
      let covered = false;
      for (const guard of guards) {
        const dot = guard.indexOf(".");
        const guardRoot = guard.slice(0, dot);
        const guardPath = guard.slice(dot + 1).split(".");
        if (guardRoot !== ref.root) {
          continue;
        }
        if (guardPath.length <= i) {
          continue;
        }
        let matches = true;
        for (let j = 0; j <= i; j += 1) {
          if (guardPath[j] !== ref.path[j]) {
            matches = false;
            break;
          }
        }
        if (matches) {
          covered = true;
          break;
        }
      }
      if (!covered) {
        return false;
      }
    }
    return true;
  }

  private resolveRef(root: string, path: string[], which: string): PolicyRef {
    if (root !== "principal" && root !== "resource" && root !== "context") {
      fail(
        `Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} uses unknown root ${JSON.stringify(root)}.`,
        this.annotationPosition,
      );
    }
    const rootType = this.roots.get(root as PolicyRootName);
    if (!rootType) {
      fail(
        `Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} uses undeclared root ${JSON.stringify(root)}.`,
        this.annotationPosition,
      );
    }
    if (path.length === 0) {
      fail(
        `Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} reference ${JSON.stringify(root)} needs a field path.`,
        this.annotationPosition,
      );
    }

    const segments: PolicyRefSegment[] = [];
    const currentTypeName: string | undefined = rootType;
    let currentInlineFields:
      | { name: string; optional: boolean; typeRef: TypeRef }[]
      | undefined;

    if (currentTypeName) {
      const rootDef = this.typesByName.get(currentTypeName);
      if (!rootDef || rootDef.typeRef.kind !== "object") {
        fail(
          `Type ${JSON.stringify(this.policyType.name)} annotation @policy root ${JSON.stringify(root)} points to unknown object type.`,
          this.annotationPosition,
        );
      }
      currentInlineFields = (rootDef as TypeDef).typeRef.objectFields?.map(
        (field) => ({
          name: field.name,
          optional: field.optional,
          typeRef: field.typeRef,
        }),
      );
    }

    let optional = false;
    let finalType: PolicyValueType = { kind: "string" };

    for (let index = 0; index < path.length; index += 1) {
      const name = path[index] as string;
      const field = (currentInlineFields ?? []).find(
        (item) => item.name === name,
      );
      if (!field) {
        fail(
          `Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} uses unknown field ${JSON.stringify(`${root}.${path.slice(0, index + 1).join(".")}`)}.`,
          this.annotationPosition,
        );
      }
      const valueType = this.resolveValueType(
        (field as { typeRef: TypeRef }).typeRef,
        which,
      );
      const isOptional = (field as { optional: boolean }).optional;
      if (isOptional) {
        optional = true;
      }
      segments.push({ name, optional: isOptional, valueType });
      finalType = valueType;

      if (index < path.length - 1) {
        const next = this.objectFieldsOf(
          (field as { typeRef: TypeRef }).typeRef,
        );
        if (!next) {
          fail(
            `Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} cannot traverse through non-object field ${JSON.stringify(`${root}.${path.slice(0, index + 1).join(".")}`)}.`,
            this.annotationPosition,
          );
        }
        currentInlineFields = next;
      }
    }

    return {
      kind: "ref",
      root: root as PolicyRootName,
      path: [...path],
      segments,
      valueType: finalType,
      optional,
    };
  }

  private objectFieldsOf(
    typeRef: TypeRef,
  ): { name: string; optional: boolean; typeRef: TypeRef }[] | undefined {
    if (typeRef.kind === "object") {
      return (typeRef.objectFields ?? []).map((field) => ({
        name: field.name,
        optional: field.optional,
        typeRef: field.typeRef,
      }));
    }
    if (typeRef.kind === "type" && typeRef.typeName) {
      const target = this.typesByName.get(typeRef.typeName);
      if (target && target.typeRef.kind === "object") {
        return (target.typeRef.objectFields ?? []).map((field) => ({
          name: field.name,
          optional: field.optional,
          typeRef: field.typeRef,
        }));
      }
    }
    return undefined;
  }

  private resolveValueType(typeRef: TypeRef, which: string): PolicyValueType {
    const seen = new Set<string>();
    let current = typeRef;
    for (;;) {
      if (current.kind === "primitive" && current.primitiveName) {
        return { kind: current.primitiveName } as PolicyValueType;
      }
      if (current.kind === "enum" && current.enumName) {
        return { kind: "enum", enumName: current.enumName };
      }
      if (current.kind === "array" && current.arrayType) {
        if (current.arrayDims !== undefined && current.arrayDims !== 1) {
          fail(
            `Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} arrays hold scalars only.`,
            this.annotationPosition,
          );
        }
        const element = this.resolveValueType(current.arrayType, which);
        if (element.kind === "object" || element.kind === "array") {
          fail(
            `Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} arrays hold scalars only.`,
            this.annotationPosition,
          );
        }
        if (element.kind === "enum") {
          return {
            kind: "array",
            element: {
              kind: "enum",
              enumName: (element as { enumName: string }).enumName,
            },
          };
        }
        return {
          kind: "array",
          element: element.kind as
            | "string"
            | "int"
            | "float"
            | "bool"
            | "datetime",
        };
      }
      if (current.kind === "object") {
        return { kind: "object", typeName: "inline" };
      }
      if (current.kind === "map") {
        return { kind: "object", typeName: "map" };
      }
      if (current.kind === "type" && current.typeName) {
        if (seen.has(current.typeName)) {
          fail(
            `Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} has circular type reference.`,
            this.annotationPosition,
          );
        }
        seen.add(current.typeName);
        const target = this.typesByName.get(current.typeName);
        if (!target) {
          fail(
            `Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} points to unknown type ${JSON.stringify(current.typeName)}.`,
            this.annotationPosition,
          );
        }
        if ((target as TypeDef).typeRef.kind === "object") {
          return { kind: "object", typeName: (target as TypeDef).name };
        }
        current = (target as TypeDef).typeRef;
        continue;
      }
      fail(
        `Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} uses unsupported field type.`,
        this.annotationPosition,
      );
    }
  }

  private resolveLiteral(
    value: string | number | boolean,
    literalKind: string,
  ): PolicyExpr {
    if (literalKind === "string") {
      return {
        kind: "literal",
        value: value as string,
        valueType: { kind: "string" },
      };
    }
    if (literalKind === "int") {
      return {
        kind: "literal",
        value: value as number,
        valueType: { kind: "int" },
      };
    }
    if (literalKind === "float") {
      return {
        kind: "literal",
        value: value as number,
        valueType: { kind: "float" },
      };
    }
    return {
      kind: "literal",
      value: value as boolean,
      valueType: { kind: "bool" },
    };
  }

  private resolveArray(
    items: SyntaxExpr[],
    guards: Set<string>,
    which: string,
  ): PolicyExpr {
    const resolved = items.map((item) =>
      this.resolveExpr(item, new Set(guards), which),
    );
    for (const item of resolved) {
      if (item.kind !== "literal" && item.kind !== "ref") {
        fail(
          `Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} array holds scalars only.`,
          this.annotationPosition,
        );
      }
      const type = (item as PolicyRef | { valueType: PolicyValueType })
        .valueType;
      if (type.kind === "object" || type.kind === "array") {
        fail(
          `Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} array holds scalars only.`,
          this.annotationPosition,
        );
      }
    }
    if (resolved.length === 0) {
      return {
        kind: "array",
        items: [],
        valueType: { kind: "array", element: "string" },
      };
    }
    const first = (resolved[0] as PolicyRef | { valueType: PolicyValueType })
      .valueType;
    let element: PolicyValueType["kind"] extends never ? never : unknown;
    if (first.kind === "enum") {
      element = {
        kind: "enum",
        enumName: (first as { enumName: string }).enumName,
      };
    } else {
      element = first.kind;
    }
    for (const item of resolved) {
      const type = (item as PolicyRef | { valueType: PolicyValueType })
        .valueType;
      const key =
        type.kind === "enum"
          ? `enum:${(type as { enumName: string }).enumName}`
          : type.kind;
      const expected =
        typeof element === "string"
          ? element
          : `enum:${(element as { enumName: string }).enumName}`;
      if (key !== expected) {
        fail(
          `Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} array needs homogeneous element types.`,
          this.annotationPosition,
        );
      }
    }
    const valueType =
      typeof element === "string"
        ? {
            kind: "array",
            element: element as
              | "string"
              | "int"
              | "float"
              | "bool"
              | "datetime",
          }
        : {
            kind: "array",
            element: element as { kind: "enum"; enumName: string },
          };
    return {
      kind: "array",
      items: resolved,
      valueType: valueType as Extract<PolicyValueType, { kind: "array" }>,
    };
  }

  private enumHasValue(enumName: string, literal: string | number): boolean {
    const enumDef = this.enumsByName.get(enumName);
    if (!enumDef) {
      return false;
    }
    for (const member of enumDef.members) {
      if (typeof literal === "string" && member.name === literal) {
        return true;
      }
      const value = member.value;
      if (
        typeof literal === "string" &&
        value.kind === "string" &&
        value.stringValue === literal
      ) {
        return true;
      }
      if (
        typeof literal === "number" &&
        value.kind === "int" &&
        value.intValue === literal
      ) {
        return true;
      }
    }
    return false;
  }
}
