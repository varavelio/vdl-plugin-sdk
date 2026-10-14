import { describe, expect, it } from "vitest";

import { PluginError } from "../../core";
import type { LiteralValue } from "../../core/types";
import * as irb from "../../testing";
import { assertValidIrForPolicy } from "./assert-valid-ir-for-policy";

function policyArg(entries: Record<string, LiteralValue>) {
  return irb.objectLiteral(entries);
}

function policyAnnotation(
  allow: string,
  extra: Record<string, LiteralValue> = {},
) {
  return irb.annotation(
    "policy",
    policyArg({ allow: irb.stringLiteral(allow), ...extra }),
  );
}

function baseSchema() {
  return {
    user: irb.typeDef(
      "User",
      irb.objectType([
        irb.field("id", irb.primitiveType("string")),
        irb.field("role", irb.primitiveType("string")),
        irb.field("department", irb.primitiveType("string"), {
          optional: true,
        }),
        irb.field("disabled", irb.primitiveType("bool")),
        irb.field("age", irb.primitiveType("int")),
        irb.field("score", irb.primitiveType("float")),
        irb.field("active", irb.primitiveType("bool")),
      ]),
    ),
    invoiceStatus: irb.enumDef("InvoiceStatus", "string", [
      irb.enumMember("Locked", irb.stringLiteral("Locked")),
      irb.enumMember("Unlocked", irb.stringLiteral("Unlocked")),
    ]),
    invoice: irb.typeDef(
      "Invoice",
      irb.objectType([
        irb.field("ownerId", irb.primitiveType("string")),
        irb.field("status", irb.enumType("InvoiceStatus", "string")),
        irb.field("amount", irb.primitiveType("int")),
        irb.field("score", irb.primitiveType("int"), { optional: true }),
        irb.field("allowedIds", irb.arrayType(irb.primitiveType("string"))),
        irb.field("expiresAt", irb.primitiveType("datetime")),
      ]),
    ),
    session: irb.typeDef(
      "SessionContext",
      irb.objectType([
        irb.field("mfaVerified", irb.primitiveType("bool")),
        irb.field("now", irb.primitiveType("datetime")),
      ]),
    ),
  };
}

function policyType(
  name: string,
  allow: string,
  opts: {
    deny?: string;
    version?: number;
    resource?: string;
    context?: string;
    extraFields?: ReturnType<typeof irb.field>[];
    annotations?: ReturnType<typeof irb.annotation>[];
  } = {},
) {
  const fields = [irb.field("principal", irb.namedType("User"))];
  if (opts.resource !== null) {
    fields.push(
      irb.field("resource", irb.namedType(opts.resource ?? "Invoice")),
    );
  }
  if (opts.context) {
    fields.push(irb.field("context", irb.namedType(opts.context)));
  }
  for (const extra of opts.extraFields ?? []) {
    fields.push(extra);
  }
  const entries: Record<string, LiteralValue> = {
    allow: irb.stringLiteral(allow),
  };
  if (opts.deny !== undefined) {
    entries.deny = irb.stringLiteral(opts.deny);
  }
  if (opts.version !== undefined) {
    entries.version = irb.intLiteral(opts.version);
  }
  const annotations = opts.annotations ?? [
    irb.annotation("policy", irb.objectLiteral(entries)),
  ];
  return irb.typeDef(name, irb.objectType(fields), { annotations });
}

function errorOf(action: () => void): PluginError {
  try {
    action();
    throw new Error("Expected PluginError");
  } catch (error) {
    if (!(error instanceof PluginError)) {
      throw error;
    }
    return error;
  }
}

describe("assertValidIrForPolicy", () => {
  it("returns empty when no policies exist", () => {
    const base = baseSchema();
    const ir = irb.schema({ types: [base.user] });
    expect(assertValidIrForPolicy(ir)).toEqual([]);
  });

  it("validates minimal principal-only policy", () => {
    const base = baseSchema();
    const policy = irb.typeDef(
      "CanAccess",
      irb.objectType([irb.field("principal", irb.namedType("User"))]),
      { annotations: [policyAnnotation("true")] },
    );
    const ir = irb.schema({ types: [base.user, policy] });
    const [result] = assertValidIrForPolicy(ir);
    expect(result?.name).toBe("CanAccess");
    expect(result?.principalType).toBe("User");
    expect(result?.resourceType).toBeUndefined();
    expect(result?.version).toBe(1);
    expect(result?.allow.kind).toBe("literal");
  });

  it("resolves full policy with resource and context", () => {
    const base = baseSchema();
    const policy = policyType(
      "CanApproveInvoice",
      "principal.id == resource.ownerId",
      {
        context: "SessionContext",
      },
    );
    const ir = irb.schema({
      types: [base.user, base.invoice, base.session, policy],
      enums: [base.invoiceStatus],
    });
    const [result] = assertValidIrForPolicy(ir);
    expect(result?.principalType).toBe("User");
    expect(result?.resourceType).toBe("Invoice");
    expect(result?.contextType).toBe("SessionContext");
    expect(result?.allow.kind).toBe("comparison");
    if (result === undefined) {
      throw new Error("expected one policy");
    }
    const ref = (result.allow as { left: { path: string[] } }).left;
    expect(ref.path).toEqual(["id"]);
  });

  it("accepts explicit version 1 and deny", () => {
    const base = baseSchema();
    const policy = policyType("CanDo", "principal.active == true", {
      deny: "principal.disabled == true",
      version: 1,
      resource: "Invoice",
    });
    // fix principal fields for this test (active/disabled exist on User)
    const fixed = irb.typeDef(
      "CanDo",
      irb.objectType([
        irb.field("principal", irb.namedType("User")),
        irb.field("resource", irb.namedType("Invoice")),
      ]),
      {
        annotations: [
          irb.annotation(
            "policy",
            irb.objectLiteral({
              allow: irb.stringLiteral("principal.active == true"),
              deny: irb.stringLiteral("principal.disabled == true"),
              version: irb.intLiteral(1),
            }),
          ),
        ],
      },
    );
    void policy;
    const ir = irb.schema({
      types: [base.user, base.invoice, fixed],
      enums: [base.invoiceStatus],
    });
    const [result] = assertValidIrForPolicy(ir);
    expect(result?.deny?.kind).toBe("comparison");
  });

  it("does not require Can prefix", () => {
    const base = baseSchema();
    const policy = irb.typeDef(
      "DoThing",
      irb.objectType([irb.field("principal", irb.namedType("User"))]),
      { annotations: [policyAnnotation("true")] },
    );
    const ir = irb.schema({ types: [base.user, policy] });
    expect(() => assertValidIrForPolicy(ir)).not.toThrow();
  });

  it("rejects policy on enum and constant", () => {
    const badEnum = irb.enumDef(
      "Bad",
      "string",
      [irb.enumMember("A", irb.stringLiteral("A"))],
      {
        annotations: [
          irb.annotation(
            "policy",
            irb.objectLiteral({ allow: irb.stringLiteral("true") }),
          ),
        ],
      },
    );
    expect(() =>
      assertValidIrForPolicy(irb.schema({ enums: [badEnum] })),
    ).toThrow(PluginError);

    const badConst = irb.constantDef("BadConst", irb.stringLiteral("x"), {
      annotations: [
        irb.annotation(
          "policy",
          irb.objectLiteral({ allow: irb.stringLiteral("true") }),
        ),
      ],
    });
    expect(() =>
      assertValidIrForPolicy(irb.schema({ constants: [badConst] })),
    ).toThrow(PluginError);
  });

  it("rejects bad annotation shapes", () => {
    const base = baseSchema();
    const cases: ReturnType<typeof irb.annotation>[] = [
      irb.annotation("policy"),
      irb.annotation("policy", irb.stringLiteral("x")),
      irb.annotation("policy", irb.objectLiteral({})),
      irb.annotation(
        "policy",
        irb.objectLiteral({ allow: irb.stringLiteral("  ") }),
      ),
      irb.annotation("policy", irb.objectLiteral({ allow: irb.intLiteral(1) })),
      irb.annotation(
        "policy",
        irb.objectLiteral({
          allow: irb.stringLiteral("true"),
          deny: irb.stringLiteral(" "),
        }),
      ),
      irb.annotation(
        "policy",
        irb.objectLiteral({
          allow: irb.stringLiteral("true"),
          deny: irb.intLiteral(1),
        }),
      ),
      irb.annotation(
        "policy",
        irb.objectLiteral({
          allow: irb.stringLiteral("true"),
          version: irb.intLiteral(2),
        }),
      ),
      irb.annotation(
        "policy",
        irb.objectLiteral({
          allow: irb.stringLiteral("true"),
          version: irb.stringLiteral("1"),
        }),
      ),
      irb.annotation(
        "policy",
        irb.objectLiteral({
          allow: irb.stringLiteral("true"),
          unknown: irb.stringLiteral("x"),
        }),
      ),
    ];
    for (const annotation of cases) {
      const policy = irb.typeDef(
        "CanX",
        irb.objectType([irb.field("principal", irb.namedType("User"))]),
        {
          annotations: [annotation],
        },
      );
      const ir = irb.schema({ types: [base.user, policy] });
      expect(() => assertValidIrForPolicy(ir)).toThrow(PluginError);
    }
  });

  it("rejects non-object policy types", () => {
    const policy = irb.typeDef("CanX", irb.primitiveType("string"), {
      annotations: [policyAnnotation("true")],
    });
    expect(() =>
      assertValidIrForPolicy(irb.schema({ types: [policy] })),
    ).toThrow(PluginError);
  });

  it("rejects missing principal, optional roots and extra fields", () => {
    const base = baseSchema();
    const noPrincipal = irb.typeDef(
      "CanX",
      irb.objectType([irb.field("resource", irb.namedType("Invoice"))]),
      { annotations: [policyAnnotation("true")] },
    );
    expect(() =>
      assertValidIrForPolicy(
        irb.schema({
          types: [base.user, base.invoice, noPrincipal],
          enums: [base.invoiceStatus],
        }),
      ),
    ).toThrow(PluginError);

    const optionalPrincipal = irb.typeDef(
      "CanY",
      irb.objectType([
        irb.field("principal", irb.namedType("User"), { optional: true }),
      ]),
      { annotations: [policyAnnotation("true")] },
    );
    expect(() =>
      assertValidIrForPolicy(
        irb.schema({ types: [base.user, optionalPrincipal] }),
      ),
    ).toThrow(PluginError);

    const extra = irb.typeDef(
      "CanZ",
      irb.objectType([
        irb.field("principal", irb.namedType("User")),
        irb.field("action", irb.primitiveType("string")),
      ]),
      { annotations: [policyAnnotation("true")] },
    );
    expect(() =>
      assertValidIrForPolicy(irb.schema({ types: [base.user, extra] })),
    ).toThrow(PluginError);
  });

  it("rejects out-of-order fields", () => {
    const base = baseSchema();
    const bad = irb.typeDef(
      "CanX",
      irb.objectType([
        irb.field("principal", irb.namedType("User")),
        irb.field("context", irb.namedType("SessionContext")),
        irb.field("resource", irb.namedType("Invoice")),
      ]),
      { annotations: [policyAnnotation("true")] },
    );
    const ir = irb.schema({
      types: [base.user, base.invoice, base.session, bad],
      enums: [base.invoiceStatus],
    });
    expect(() => assertValidIrForPolicy(ir)).toThrow(PluginError);
  });

  it("rejects non-named roots", () => {
    const base = baseSchema();
    for (const typeRef of [
      irb.primitiveType("string"),
      irb.enumType("InvoiceStatus", "string"),
      irb.arrayType(irb.primitiveType("string")),
      irb.mapType(irb.primitiveType("string")),
      irb.objectType([irb.field("id", irb.primitiveType("string"))]),
    ]) {
      const policy = irb.typeDef(
        "CanX",
        irb.objectType([irb.field("principal", typeRef)]),
        {
          annotations: [policyAnnotation("true")],
        },
      );
      const ir = irb.schema({
        types: [base.user, base.invoice, policy],
        enums: [base.invoiceStatus],
      });
      expect(() => assertValidIrForPolicy(ir)).toThrow(PluginError);
    }
  });

  it("catches unknown fields like resource.ownerId", () => {
    const user = irb.typeDef(
      "User",
      irb.objectType([irb.field("id", irb.primitiveType("string"))]),
    );
    const invoice = irb.typeDef(
      "Invoice",
      irb.objectType([irb.field("isPaid", irb.primitiveType("bool"))]),
    );
    const policy = irb.typeDef(
      "CanApproveInvoice",
      irb.objectType([
        irb.field("principal", irb.namedType("User")),
        irb.field("resource", irb.namedType("Invoice")),
      ]),
      { annotations: [policyAnnotation("principal.id == resource.ownerId")] },
    );
    const ir = irb.schema({ types: [user, invoice, policy] });
    const error = errorOf(() => assertValidIrForPolicy(ir));
    expect(error.message).toContain("ownerId");
  });

  it("rejects unknown roots and undeclared resource", () => {
    const base = baseSchema();
    const policy = irb.typeDef(
      "CanX",
      irb.objectType([irb.field("principal", irb.namedType("User"))]),
      { annotations: [policyAnnotation("resource.ownerId == 'x'")] },
    );
    expect(() =>
      assertValidIrForPolicy(
        irb.schema({
          types: [base.user, base.invoice, policy],
          enums: [base.invoiceStatus],
        }),
      ),
    ).toThrow(PluginError);
  });

  it("rejects type mismatches without conversion", () => {
    const base = baseSchema();
    const badExprs = [
      "principal.age == '100'",
      "principal.age == 10.5",
      "principal.active == 'true'",
      "principal.age > '10'",
      "principal.active > true",
      "principal.age in 'x'",
      "principal.age == resource.ownerId",
    ];
    for (const expr of badExprs) {
      const policy = policyType("CanX", expr, {});
      const ir = irb.schema({
        types: [base.user, base.invoice, policy],
        enums: [base.invoiceStatus],
      });
      expect(() => assertValidIrForPolicy(ir), expr).toThrow(PluginError);
    }
  });

  it("validates enums by member", () => {
    const base = baseSchema();
    const good = policyType("CanX", "resource.status == 'Locked'", {});
    expect(() =>
      assertValidIrForPolicy(
        irb.schema({
          types: [base.user, base.invoice, good],
          enums: [base.invoiceStatus],
        }),
      ),
    ).not.toThrow();

    const bad = policyType("CanX", "resource.status == 'Archived'", {});
    expect(() =>
      assertValidIrForPolicy(
        irb.schema({
          types: [base.user, base.invoice, bad],
          enums: [base.invoiceStatus],
        }),
      ),
    ).toThrow(PluginError);

    const nonString = policyType("CanX", "resource.status == 1", {});
    expect(() =>
      assertValidIrForPolicy(
        irb.schema({
          types: [base.user, base.invoice, nonString],
          enums: [base.invoiceStatus],
        }),
      ),
    ).toThrow(PluginError);
  });

  it("validates datetime only against datetime", () => {
    const base = baseSchema();
    const good = irb.typeDef(
      "CanX",
      irb.objectType([
        irb.field("principal", irb.namedType("User")),
        irb.field("resource", irb.namedType("Invoice")),
        irb.field("context", irb.namedType("SessionContext")),
      ]),
      { annotations: [policyAnnotation("resource.expiresAt > context.now")] },
    );
    expect(() =>
      assertValidIrForPolicy(
        irb.schema({
          types: [base.user, base.invoice, base.session, good],
          enums: [base.invoiceStatus],
        }),
      ),
    ).not.toThrow();

    const bad = irb.typeDef(
      "CanY",
      irb.objectType([
        irb.field("principal", irb.namedType("User")),
        irb.field("resource", irb.namedType("Invoice")),
      ]),
      { annotations: [policyAnnotation("resource.expiresAt > '2024-01-01'")] },
    );
    expect(() =>
      assertValidIrForPolicy(
        irb.schema({
          types: [base.user, base.invoice, bad],
          enums: [base.invoiceStatus],
        }),
      ),
    ).toThrow(PluginError);
  });

  it("validates in with homogeneous scalars", () => {
    const base = baseSchema();
    const good = policyType("CanX", "principal.role in ['admin', 'owner']", {});
    expect(() =>
      assertValidIrForPolicy(
        irb.schema({
          types: [base.user, base.invoice, good],
          enums: [base.invoiceStatus],
        }),
      ),
    ).not.toThrow();

    const goodRef = policyType(
      "CanX",
      "principal.id in resource.allowedIds",
      {},
    );
    expect(() =>
      assertValidIrForPolicy(
        irb.schema({
          types: [base.user, base.invoice, goodRef],
          enums: [base.invoiceStatus],
        }),
      ),
    ).not.toThrow();

    const empty = policyType("CanX", "principal.role in []", {});
    expect(() =>
      assertValidIrForPolicy(
        irb.schema({
          types: [base.user, base.invoice, empty],
          enums: [base.invoiceStatus],
        }),
      ),
    ).not.toThrow();

    const hetero = policyType("CanX", "principal.role in ['a', 1]", {});
    expect(() =>
      assertValidIrForPolicy(
        irb.schema({
          types: [base.user, base.invoice, hetero],
          enums: [base.invoiceStatus],
        }),
      ),
    ).toThrow(PluginError);

    const nested = policyType("CanX", "principal.role in [['a']]", {});
    expect(() =>
      assertValidIrForPolicy(
        irb.schema({
          types: [base.user, base.invoice, nested],
          enums: [base.invoiceStatus],
        }),
      ),
    ).toThrow(PluginError);
  });

  it("requires bool root results", () => {
    const base = baseSchema();
    for (const expr of ["principal.role", "principal.age + 1", "'x'"]) {
      const policy = policyType("CanX", expr, {});
      const ir = irb.schema({
        types: [base.user, base.invoice, policy],
        enums: [base.invoiceStatus],
      });
      // parser rejects '+' so both parser and checker paths are covered
      expect(() => assertValidIrForPolicy(ir), expr).toThrow();
    }
    const boolRef = policyType("CanX", "principal.active == true", {});
    // User.active exists as bool in baseSchema
    const userWithActive = irb.typeDef(
      "User",
      irb.objectType([irb.field("active", irb.primitiveType("bool"))]),
    );
    expect(() =>
      assertValidIrForPolicy(
        irb.schema({
          types: [userWithActive, base.invoice, boolRef],
          enums: [base.invoiceStatus],
        }),
      ),
    ).not.toThrow();
  });

  it("enforces has guards for ordering and in", () => {
    const base = baseSchema();
    const needsGuard = policyType("CanX", "resource.score > 100", {});
    expect(() =>
      assertValidIrForPolicy(
        irb.schema({
          types: [base.user, base.invoice, needsGuard],
          enums: [base.invoiceStatus],
        }),
      ),
    ).toThrow(PluginError);

    const guarded = policyType(
      "CanX",
      "has(resource.score) && resource.score > 100",
      {},
    );
    expect(() =>
      assertValidIrForPolicy(
        irb.schema({
          types: [base.user, base.invoice, guarded],
          enums: [base.invoiceStatus],
        }),
      ),
    ).not.toThrow();

    const equalityNoGuard = policyType(
      "CanX",
      "principal.department == 'Finance'",
      {},
    );
    expect(() =>
      assertValidIrForPolicy(
        irb.schema({
          types: [base.user, base.invoice, equalityNoGuard],
          enums: [base.invoiceStatus],
        }),
      ),
    ).not.toThrow();

    const notGuarded = policyType(
      "CanX",
      "!has(resource.score) && resource.score > 100",
      {},
    );
    expect(() =>
      assertValidIrForPolicy(
        irb.schema({
          types: [base.user, base.invoice, notGuarded],
          enums: [base.invoiceStatus],
        }),
      ),
    ).toThrow(PluginError);
  });

  it("requires each or branch safe alone", () => {
    const base = baseSchema();
    const bad = policyType(
      "CanX",
      "has(resource.score) && (resource.score > 1 || resource.score > 2)",
      {},
    );
    // has outside guards both or branches, so this passes
    expect(() =>
      assertValidIrForPolicy(
        irb.schema({
          types: [base.user, base.invoice, bad],
          enums: [base.invoiceStatus],
        }),
      ),
    ).not.toThrow();

    const badOr = policyType(
      "CanX",
      "resource.score > 1 || resource.score > 2",
      {},
    );
    expect(() =>
      assertValidIrForPolicy(
        irb.schema({
          types: [base.user, base.invoice, badOr],
          enums: [base.invoiceStatus],
        }),
      ),
    ).toThrow(PluginError);
  });

  it("rejects ! on non-bool and bad has usage", () => {
    const base = baseSchema();
    const badNot = policyType("CanX", "!principal.role == 'x'", {});
    // parses as (!principal.role) == 'x' -> ! on string fails
    expect(() =>
      assertValidIrForPolicy(
        irb.schema({
          types: [base.user, base.invoice, badNot],
          enums: [base.invoiceStatus],
        }),
      ),
    ).toThrow(PluginError);
  });

  it("resolves nested paths and rejects bad traversal", () => {
    const profile = irb.typeDef(
      "Profile",
      irb.objectType([irb.field("department", irb.primitiveType("string"))]),
    );
    const user = irb.typeDef(
      "User",
      irb.objectType([irb.field("profile", irb.namedType("Profile"))]),
    );
    const good = irb.typeDef(
      "CanX",
      irb.objectType([irb.field("principal", irb.namedType("User"))]),
      { annotations: [policyAnnotation("has(principal.profile.department)")] },
    );
    expect(() =>
      assertValidIrForPolicy(irb.schema({ types: [user, profile, good] })),
    ).not.toThrow();

    const badTraverse = irb.typeDef(
      "CanY",
      irb.objectType([irb.field("principal", irb.namedType("User"))]),
      {
        annotations: [
          policyAnnotation("principal.profile.department.x == 'a'"),
        ],
      },
    );
    // department is string, cannot traverse further
    const user2 = irb.typeDef(
      "User",
      irb.objectType([irb.field("profile", irb.namedType("Profile2"))]),
    );
    const profile2 = irb.typeDef(
      "Profile2",
      irb.objectType([irb.field("department", irb.primitiveType("string"))]),
    );
    expect(() =>
      assertValidIrForPolicy(
        irb.schema({ types: [user2, profile2, badTraverse] }),
      ),
    ).toThrow(PluginError);
  });

  it("sorts policies by name and fails fast", () => {
    const base = baseSchema();
    const good = irb.typeDef(
      "ACan",
      irb.objectType([irb.field("principal", irb.namedType("User"))]),
      { annotations: [policyAnnotation("true")] },
    );
    const bad = irb.typeDef("ZCan", irb.primitiveType("string"), {
      annotations: [policyAnnotation("true")],
    });
    const ir = irb.schema({ types: [base.user, good, bad] });
    // bad sorts after good but still fails fast on first violation encountered in type order?
    // policies are validated in schema order, first error wins
    expect(() => assertValidIrForPolicy(ir)).toThrow(PluginError);

    const twoGoodA = irb.typeDef(
      "BCan",
      irb.objectType([irb.field("principal", irb.namedType("User"))]),
      { annotations: [policyAnnotation("true")] },
    );
    const twoGoodB = irb.typeDef(
      "ACan",
      irb.objectType([irb.field("principal", irb.namedType("User"))]),
      { annotations: [policyAnnotation("true")] },
    );
    const both = assertValidIrForPolicy(
      irb.schema({ types: [base.user, twoGoodA, twoGoodB] }),
    );
    expect(both.map((item) => item.name)).toEqual(["ACan", "BCan"]);
  });
});

describe("assertValidIrForPolicy edges", () => {
  it("allows string ordering and bool literals", () => {
    const base = baseSchema();
    const ordering = policyType("CanX", "principal.role > 'a'", {});
    // rebuild without helper resource default to avoid confusion
    const orderingPolicy = irb.typeDef(
      "CanX",
      irb.objectType([irb.field("principal", irb.namedType("User"))]),
      { annotations: [policyAnnotation("principal.role > 'a'")] },
    );
    void ordering;
    expect(() =>
      assertValidIrForPolicy(
        irb.schema({ types: [base.user, orderingPolicy] }),
      ),
    ).not.toThrow();

    const boolAllow = irb.typeDef(
      "CanY",
      irb.objectType([irb.field("principal", irb.namedType("User"))]),
      { annotations: [policyAnnotation("false")] },
    );
    expect(() =>
      assertValidIrForPolicy(irb.schema({ types: [base.user, boolAllow] })),
    ).not.toThrow();
  });

  it("rejects in with non-array and object comparisons", () => {
    const base = baseSchema();
    const inString = irb.typeDef(
      "CanX",
      irb.objectType([irb.field("principal", irb.namedType("User"))]),
      { annotations: [policyAnnotation("principal.role in 'admin'")] },
    );
    expect(() =>
      assertValidIrForPolicy(irb.schema({ types: [base.user, inString] })),
    ).toThrow(PluginError);

    const profile = irb.typeDef(
      "Profile",
      irb.objectType([irb.field("department", irb.primitiveType("string"))]),
    );
    const user = irb.typeDef(
      "User",
      irb.objectType([irb.field("profile", irb.namedType("Profile"))]),
    );
    const objectCmp = irb.typeDef(
      "CanX",
      irb.objectType([irb.field("principal", irb.namedType("User"))]),
      {
        annotations: [
          policyAnnotation("principal.profile == principal.profile"),
        ],
      },
    );
    expect(() =>
      assertValidIrForPolicy(irb.schema({ types: [user, profile, objectCmp] })),
    ).toThrow(PluginError);
  });

  it("rejects has inside arrays and non-bool or branches", () => {
    const base = baseSchema();
    const hasInArray = irb.typeDef(
      "CanX",
      irb.objectType([irb.field("principal", irb.namedType("User"))]),
      {
        annotations: [
          policyAnnotation("principal.role in [has(principal.role)]"),
        ],
      },
    );
    expect(() =>
      assertValidIrForPolicy(irb.schema({ types: [base.user, hasInArray] })),
    ).toThrow(PluginError);

    const orString = irb.typeDef(
      "CanY",
      irb.objectType([irb.field("principal", irb.namedType("User"))]),
      { annotations: [policyAnnotation("principal.role || true")] },
    );
    expect(() =>
      assertValidIrForPolicy(irb.schema({ types: [base.user, orString] })),
    ).toThrow(PluginError);
  });

  it("rejects different enums and unknown types", () => {
    const statusA = irb.enumDef("StatusA", "string", [
      irb.enumMember("On", irb.stringLiteral("On")),
    ]);
    const statusB = irb.enumDef("StatusB", "string", [
      irb.enumMember("On", irb.stringLiteral("On")),
    ]);
    const holder = irb.typeDef(
      "Holder",
      irb.objectType([
        irb.field("a", irb.enumType("StatusA", "string")),
        irb.field("b", irb.enumType("StatusB", "string")),
      ]),
    );
    const user = irb.typeDef(
      "User",
      irb.objectType([irb.field("holder", irb.namedType("Holder"))]),
    );
    const cmpDiff = irb.typeDef(
      "CanX",
      irb.objectType([irb.field("principal", irb.namedType("User"))]),
      {
        annotations: [
          policyAnnotation("principal.holder.a == principal.holder.b"),
        ],
      },
    );
    const diffError = errorOf(() =>
      assertValidIrForPolicy(
        irb.schema({
          types: [user, holder, cmpDiff],
          enums: [statusA, statusB],
        }),
      ),
    );
    expect(diffError.message).toContain('"StatusA"');
    expect(diffError.message).toContain('"StatusB"');

    const unknownRef = irb.typeDef(
      "CanY",
      irb.objectType([irb.field("principal", irb.namedType("Missing"))]),
      { annotations: [policyAnnotation("true")] },
    );
    expect(() =>
      assertValidIrForPolicy(irb.schema({ types: [unknownRef] })),
    ).toThrow(PluginError);
  });

  it("allows has on maps and rejects map comparisons", () => {
    const user = irb.typeDef(
      "User",
      irb.objectType([
        irb.field("id", irb.primitiveType("string")),
        irb.field("meta", irb.mapType(irb.primitiveType("string"))),
      ]),
    );
    const hasMap = irb.typeDef(
      "CanX",
      irb.objectType([irb.field("principal", irb.namedType("User"))]),
      { annotations: [policyAnnotation("has(principal.meta)")] },
    );
    expect(() =>
      assertValidIrForPolicy(irb.schema({ types: [user, hasMap] })),
    ).not.toThrow();

    const cmpMap = irb.typeDef(
      "CanY",
      irb.objectType([irb.field("principal", irb.namedType("User"))]),
      { annotations: [policyAnnotation("principal.meta == principal.meta")] },
    );
    expect(() =>
      assertValidIrForPolicy(irb.schema({ types: [user, cmpMap] })),
    ).toThrow(PluginError);
  });

  it("rejects circular aliases and bad deny", () => {
    const typeA = irb.typeDef("AliasA", irb.namedType("AliasB"));
    const typeB = irb.typeDef("AliasB", irb.namedType("AliasA"));
    const user = irb.typeDef(
      "User",
      irb.objectType([irb.field("ref", irb.namedType("AliasA"))]),
    );
    const policy = irb.typeDef(
      "CanX",
      irb.objectType([irb.field("principal", irb.namedType("User"))]),
      { annotations: [policyAnnotation("principal.ref == 'x'")] },
    );
    expect(() =>
      assertValidIrForPolicy(
        irb.schema({ types: [user, typeA, typeB, policy] }),
      ),
    ).toThrow(PluginError);

    const base = baseSchema();
    const badDeny = irb.typeDef(
      "CanY",
      irb.objectType([irb.field("principal", irb.namedType("User"))]),
      {
        annotations: [
          irb.annotation(
            "policy",
            irb.objectLiteral({
              allow: irb.stringLiteral("true"),
              deny: irb.stringLiteral("principal.missing == 'x'"),
            }),
          ),
        ],
      },
    );
    expect(() =>
      assertValidIrForPolicy(irb.schema({ types: [base.user, badDeny] })),
    ).toThrow(PluginError);
  });
});

function allowPolicy(
  name: string,
  allow: string,
  types: ReturnType<typeof irb.typeDef>[],
  enums: ReturnType<typeof irb.enumDef>[] = [],
) {
  const policy = irb.typeDef(
    name,
    irb.objectType([irb.field("principal", irb.namedType("User"))]),
    {
      annotations: [
        irb.annotation(
          "policy",
          irb.objectLiteral({ allow: irb.stringLiteral(allow) }),
        ),
      ],
    },
  );
  return { ir: irb.schema({ types: [...types, policy], enums }), policy };
}

function userWith(fields: ReturnType<typeof irb.field>[]) {
  return irb.typeDef("User", irb.objectType(fields));
}

describe("assertValidIrForPolicy validation edges", () => {
  it("rejects version and arg variants", () => {
    const user = userWith([irb.field("id", irb.primitiveType("string"))]);
    const badArgs = [
      irb.annotation(
        "policy",
        irb.objectLiteral({
          allow: irb.stringLiteral("true"),
          version: irb.intLiteral(0),
        }),
      ),
      irb.annotation(
        "policy",
        irb.objectLiteral({
          allow: irb.stringLiteral("true"),
          version: irb.intLiteral(-1),
        }),
      ),
      irb.annotation(
        "policy",
        irb.objectLiteral({
          allow: irb.stringLiteral("true"),
          version: irb.floatLiteral(1),
        }),
      ),
      irb.annotation(
        "policy",
        irb.objectLiteral({
          allow: irb.stringLiteral("true"),
          version: irb.boolLiteral(true),
        }),
      ),
      irb.annotation(
        "policy",
        irb.objectLiteral({
          allow: irb.stringLiteral("true"),
          version: irb.arrayLiteral([]),
        }),
      ),
      irb.annotation(
        "policy",
        irb.objectLiteral({ allow: irb.boolLiteral(true) }),
      ),
      irb.annotation(
        "policy",
        irb.objectLiteral({ allow: irb.arrayLiteral([]) }),
      ),
      irb.annotation(
        "policy",
        irb.objectLiteral({
          allow: irb.stringLiteral("true"),
          Allow: irb.stringLiteral("true"),
        }),
      ),
      irb.annotation(
        "policy",
        irb.objectLiteral({ allow: irb.stringLiteral("\n\t ") }),
      ),
    ];
    for (const annotation of badArgs) {
      const policy = irb.typeDef(
        "CanX",
        irb.objectType([irb.field("principal", irb.namedType("User"))]),
        {
          annotations: [annotation],
        },
      );
      expect(() =>
        assertValidIrForPolicy(irb.schema({ types: [user, policy] })),
      ).toThrow(PluginError);
    }
  });

  it("allows principal plus context without resource", () => {
    const user = userWith([irb.field("id", irb.primitiveType("string"))]);
    const ctx = irb.typeDef(
      "Ctx",
      irb.objectType([irb.field("ip", irb.primitiveType("string"))]),
    );
    const policy = irb.typeDef(
      "CanX",
      irb.objectType([
        irb.field("principal", irb.namedType("User")),
        irb.field("context", irb.namedType("Ctx")),
      ]),
      {
        annotations: [
          irb.annotation(
            "policy",
            irb.objectLiteral({
              allow: irb.stringLiteral("context.ip == '1'"),
            }),
          ),
        ],
      },
    );
    const out = assertValidIrForPolicy(
      irb.schema({ types: [user, ctx, policy] }),
    );
    expect(out[0]?.contextType).toBe("Ctx");
    expect(out[0]?.resourceType).toBeUndefined();
  });

  it("rejects duplicate and empty policy fields", () => {
    const user = userWith([irb.field("id", irb.primitiveType("string"))]);
    const dup = irb.typeDef(
      "CanX",
      irb.objectType([
        irb.field("principal", irb.namedType("User")),
        irb.field("principal", irb.namedType("User")),
      ]),
      {
        annotations: [
          irb.annotation(
            "policy",
            irb.objectLiteral({ allow: irb.stringLiteral("true") }),
          ),
        ],
      },
    );
    expect(() =>
      assertValidIrForPolicy(irb.schema({ types: [user, dup] })),
    ).toThrow(PluginError);

    const empty = irb.typeDef("CanY", irb.objectType([]), {
      annotations: [
        irb.annotation(
          "policy",
          irb.objectLiteral({ allow: irb.stringLiteral("true") }),
        ),
      ],
    });
    expect(() =>
      assertValidIrForPolicy(irb.schema({ types: [user, empty] })),
    ).toThrow(PluginError);
  });

  it("rejects alias roots and unknown nested types", () => {
    const alias = irb.typeDef("MyString", irb.primitiveType("string"));
    const user = userWith([irb.field("id", irb.primitiveType("string"))]);
    const aliasPolicy = irb.typeDef(
      "CanX",
      irb.objectType([irb.field("principal", irb.namedType("MyString"))]),
      {
        annotations: [
          irb.annotation(
            "policy",
            irb.objectLiteral({ allow: irb.stringLiteral("true") }),
          ),
        ],
      },
    );
    expect(() =>
      assertValidIrForPolicy(irb.schema({ types: [user, alias, aliasPolicy] })),
    ).toThrow(PluginError);

    const holder = irb.typeDef(
      "Holder",
      irb.objectType([irb.field("x", irb.namedType("Missing"))]),
    );
    const user2 = irb.typeDef(
      "User2",
      irb.objectType([irb.field("h", irb.namedType("Holder"))]),
    );
    const nested = irb.typeDef(
      "CanY",
      irb.objectType([irb.field("principal", irb.namedType("User2"))]),
      {
        annotations: [
          irb.annotation(
            "policy",
            irb.objectLiteral({
              allow: irb.stringLiteral("principal.h.x == 'a'"),
            }),
          ),
        ],
      },
    );
    expect(() =>
      assertValidIrForPolicy(irb.schema({ types: [user2, holder, nested] })),
    ).toThrow(PluginError);
  });

  it("requires exact has for deep optional chains", () => {
    const level3 = irb.typeDef(
      "L3",
      irb.objectType([
        irb.field("v", irb.primitiveType("int"), { optional: true }),
      ]),
    );
    const level2 = irb.typeDef(
      "L2",
      irb.objectType([
        irb.field("l3", irb.namedType("L3"), { optional: true }),
      ]),
    );
    const user = irb.typeDef(
      "User",
      irb.objectType([irb.field("l2", irb.namedType("L2"))]),
    );
    const prefixOnly = irb.typeDef(
      "CanX",
      irb.objectType([irb.field("principal", irb.namedType("User"))]),
      {
        annotations: [
          irb.annotation(
            "policy",
            irb.objectLiteral({
              allow: irb.stringLiteral(
                "has(principal.l2) && principal.l2.l3.v > 1",
              ),
            }),
          ),
        ],
      },
    );
    expect(() =>
      assertValidIrForPolicy(
        irb.schema({ types: [user, level2, level3, prefixOnly] }),
      ),
    ).toThrow(PluginError);

    const equalityNoGuardNeeded = irb.typeDef(
      "CanEq",
      irb.objectType([irb.field("principal", irb.namedType("User"))]),
      {
        annotations: [
          irb.annotation(
            "policy",
            irb.objectLiteral({
              allow: irb.stringLiteral("principal.l2.l3.v == 1"),
            }),
          ),
        ],
      },
    );
    expect(() =>
      assertValidIrForPolicy(
        irb.schema({ types: [user, level2, level3, equalityNoGuardNeeded] }),
      ),
    ).not.toThrow();

    const full = irb.typeDef(
      "CanY",
      irb.objectType([irb.field("principal", irb.namedType("User"))]),
      {
        annotations: [
          irb.annotation(
            "policy",
            irb.objectLiteral({
              allow: irb.stringLiteral(
                "has(principal.l2.l3.v) && principal.l2.l3.v > 1",
              ),
            }),
          ),
        ],
      },
    );
    expect(() =>
      assertValidIrForPolicy(
        irb.schema({ types: [user, level2, level3, full] }),
      ),
    ).not.toThrow();
  });

  it("handles or branches and not propagation", () => {
    const user = userWith([
      irb.field("a", irb.primitiveType("string"), { optional: true }),
      irb.field("b", irb.primitiveType("string")),
    ]);
    const orGuarded = irb.typeDef(
      "CanX",
      irb.objectType([irb.field("principal", irb.namedType("User"))]),
      {
        annotations: [
          irb.annotation(
            "policy",
            irb.objectLiteral({
              allow: irb.stringLiteral(
                "(has(principal.a) && principal.a == '1') || principal.b == '2'",
              ),
            }),
          ),
        ],
      },
    );
    expect(() =>
      assertValidIrForPolicy(irb.schema({ types: [user, orGuarded] })),
    ).not.toThrow();

    const notGuarded = irb.typeDef(
      "CanY",
      irb.objectType([irb.field("principal", irb.namedType("User"))]),
      {
        annotations: [
          irb.annotation(
            "policy",
            irb.objectLiteral({
              allow: irb.stringLiteral(
                "has(principal.a) && !(principal.a == '1')",
              ),
            }),
          ),
        ],
      },
    );
    expect(() =>
      assertValidIrForPolicy(irb.schema({ types: [user, notGuarded] })),
    ).not.toThrow();
  });

  it("validates int enums with ints", () => {
    const priority = irb.enumDef("Priority", "int", [
      irb.enumMember("Low", irb.intLiteral(1)),
      irb.enumMember("High", irb.intLiteral(2)),
    ]);
    const ticket = irb.typeDef(
      "Ticket",
      irb.objectType([irb.field("priority", irb.enumType("Priority", "int"))]),
    );
    const user = userWith([irb.field("id", irb.primitiveType("string"))]);
    const good = irb.typeDef(
      "CanX",
      irb.objectType([
        irb.field("principal", irb.namedType("User")),
        irb.field("resource", irb.namedType("Ticket")),
      ]),
      {
        annotations: [
          irb.annotation(
            "policy",
            irb.objectLiteral({
              allow: irb.stringLiteral("resource.priority == 1"),
            }),
          ),
        ],
      },
    );
    expect(() =>
      assertValidIrForPolicy(
        irb.schema({ types: [user, ticket, good], enums: [priority] }),
      ),
    ).not.toThrow();

    const bad = irb.typeDef(
      "CanY",
      irb.objectType([
        irb.field("principal", irb.namedType("User")),
        irb.field("resource", irb.namedType("Ticket")),
      ]),
      {
        annotations: [
          irb.annotation(
            "policy",
            irb.objectLiteral({
              allow: irb.stringLiteral("resource.priority == 9"),
            }),
          ),
        ],
      },
    );
    expect(() =>
      assertValidIrForPolicy(
        irb.schema({ types: [user, ticket, bad], enums: [priority] }),
      ),
    ).toThrow(PluginError);

    const inGood = irb.typeDef(
      "CanZ",
      irb.objectType([
        irb.field("principal", irb.namedType("User")),
        irb.field("resource", irb.namedType("Ticket")),
      ]),
      {
        annotations: [
          irb.annotation(
            "policy",
            irb.objectLiteral({
              allow: irb.stringLiteral("resource.priority in [1, 2]"),
            }),
          ),
        ],
      },
    );
    expect(() =>
      assertValidIrForPolicy(
        irb.schema({ types: [user, ticket, inGood], enums: [priority] }),
      ),
    ).not.toThrow();
  });

  it("validates scalar arrays and mismatches", () => {
    const user = userWith([
      irb.field("age", irb.primitiveType("int")),
      irb.field("score", irb.primitiveType("float")),
      irb.field("active", irb.primitiveType("bool")),
    ]);
    for (const expr of [
      "principal.age in [1, 2, 3]",
      "principal.score in [1.5, 2.5]",
      "principal.active in [true, false]",
    ]) {
      const { ir } = allowPolicy("CanX", expr, [user]);
      expect(() => assertValidIrForPolicy(ir), expr).not.toThrow();
    }
    for (const expr of [
      "principal.age in [1, 1.5]",
      "principal.age in [1, 'a']",
      "principal.active in [true, 1]",
    ]) {
      const { ir } = allowPolicy("CanX", expr, [user]);
      expect(() => assertValidIrForPolicy(ir), expr).toThrow(PluginError);
    }
  });

  it("handles empty strings and special chars", () => {
    const user = userWith([irb.field("role", irb.primitiveType("string"))]);
    const { ir } = allowPolicy("CanX", "principal.role == ''", [user]);
    expect(() => assertValidIrForPolicy(ir)).not.toThrow();
  });

  it("validates the full spec example", () => {
    const user = irb.typeDef(
      "User",
      irb.objectType([
        irb.field("id", irb.primitiveType("string")),
        irb.field("name", irb.primitiveType("string")),
        irb.field("role", irb.primitiveType("string")),
        irb.field("department", irb.primitiveType("string"), {
          optional: true,
        }),
        irb.field("disabled", irb.primitiveType("bool")),
      ]),
    );
    const status = irb.enumDef("InvoiceStatus", "string", [
      irb.enumMember("Locked", irb.stringLiteral("Locked")),
      irb.enumMember("Unlocked", irb.stringLiteral("Unlocked")),
    ]);
    const invoice = irb.typeDef(
      "Invoice",
      irb.objectType([
        irb.field("ownerId", irb.primitiveType("string")),
        irb.field("status", irb.enumType("InvoiceStatus", "string")),
      ]),
    );
    const session = irb.typeDef(
      "SessionContext",
      irb.objectType([
        irb.field("mfaVerified", irb.primitiveType("bool")),
        irb.field("now", irb.primitiveType("datetime")),
      ]),
    );
    const policy = irb.typeDef(
      "CanApproveInvoice",
      irb.objectType([
        irb.field("principal", irb.namedType("User")),
        irb.field("resource", irb.namedType("Invoice")),
        irb.field("context", irb.namedType("SessionContext")),
      ]),
      {
        annotations: [
          irb.annotation(
            "policy",
            irb.objectLiteral({
              version: irb.intLiteral(1),
              allow: irb.stringLiteral(
                "principal.id == resource.ownerId || has(principal.department) && principal.department == 'Finance' && context.mfaVerified == true",
              ),
              deny: irb.stringLiteral(
                "principal.disabled == true || resource.status == 'Locked'",
              ),
            }),
          ),
        ],
      },
    );
    const out = assertValidIrForPolicy(
      irb.schema({ types: [user, invoice, session, policy], enums: [status] }),
    );
    expect(out).toHaveLength(1);
    expect(out[0]?.allow.kind).toBe("or");
    expect(out[0]?.deny?.kind).toBe("or");
    expect(out[0]?.principalType).toBe("User");
  });

  it("points expression errors at the annotation", () => {
    const user = userWith([irb.field("id", irb.primitiveType("string"))]);
    const annotation = irb.annotation(
      "policy",
      irb.objectLiteral({
        allow: irb.stringLiteral("principal.missing == 'x'"),
      }),
    );
    const policy = irb.typeDef(
      "CanX",
      irb.objectType([irb.field("principal", irb.namedType("User"))]),
      {
        annotations: [annotation],
      },
    );
    try {
      assertValidIrForPolicy(irb.schema({ types: [user, policy] }));
      throw new Error("should throw");
    } catch (error) {
      expect(error).toBeInstanceOf(PluginError);
      expect((error as PluginError).position).toEqual(annotation.position);
    }
  });

  it("handles required ordering and cross-root compares", () => {
    const user = userWith([irb.field("age", irb.primitiveType("int"))]);
    const invoice = irb.typeDef(
      "Invoice",
      irb.objectType([irb.field("amount", irb.primitiveType("int"))]),
    );
    const policy = irb.typeDef(
      "CanX",
      irb.objectType([
        irb.field("principal", irb.namedType("User")),
        irb.field("resource", irb.namedType("Invoice")),
      ]),
      {
        annotations: [
          irb.annotation(
            "policy",
            irb.objectLiteral({
              allow: irb.stringLiteral(
                "resource.amount > 100 && resource.amount > principal.age && principal.age == principal.age",
              ),
            }),
          ),
        ],
      },
    );
    expect(() =>
      assertValidIrForPolicy(irb.schema({ types: [user, invoice, policy] })),
    ).not.toThrow();
  });

  it("rejects traversal through arrays and primitives", () => {
    const user = userWith([
      irb.field("tags", irb.arrayType(irb.primitiveType("string"))),
      irb.field("id", irb.primitiveType("string")),
    ]);
    for (const expr of [
      "principal.tags.value == 'x'",
      "principal.id.foo == 'x'",
    ]) {
      const { ir } = allowPolicy("CanX", expr, [user]);
      expect(() => assertValidIrForPolicy(ir), expr).toThrow(PluginError);
    }
  });
});

describe("assertValidIrForPolicy guard and output edges", () => {
  it("resolves exact output shape for codegen", () => {
    const user = irb.typeDef(
      "User",
      irb.objectType([
        irb.field("id", irb.primitiveType("string")),
        irb.field("department", irb.primitiveType("string"), {
          optional: true,
        }),
      ]),
    );
    const policy = irb.typeDef(
      "CanX",
      irb.objectType([irb.field("principal", irb.namedType("User"))]),
      {
        annotations: [
          irb.annotation(
            "policy",
            irb.objectLiteral({
              allow: irb.stringLiteral(
                "has(principal.department) && principal.department == 'Finance'",
              ),
            }),
          ),
        ],
      },
    );
    const [out] = assertValidIrForPolicy(irb.schema({ types: [user, policy] }));
    expect(out?.name).toBe("CanX");
    expect(out?.allow.kind).toBe("and");
    if (out === undefined) {
      throw new Error("expected one policy");
    }
    const clauses = (out.allow as { clauses: { kind: string }[] }).clauses;
    expect(clauses).toHaveLength(2);
    expect(clauses[0]?.kind).toBe("has");
    const cmp = clauses[1] as {
      kind: string;
      left: {
        kind: string;
        root: string;
        path: string[];
        optional: boolean;
        valueType: { kind: string };
      };
    };
    expect(cmp.left.kind).toBe("ref");
    expect(cmp.left.root).toBe("principal");
    expect(cmp.left.path).toEqual(["department"]);
    expect(cmp.left.optional).toBe(true);
    expect(cmp.left.valueType).toEqual({ kind: "string" });
  });

  it("handles optional arrays and item guards", () => {
    const resource = irb.typeDef(
      "Res",
      irb.objectType([
        irb.field("ids", irb.arrayType(irb.primitiveType("string")), {
          optional: true,
        }),
        irb.field("reqIds", irb.arrayType(irb.primitiveType("string"))),
        irb.field("fallback", irb.primitiveType("string"), { optional: true }),
      ]),
    );
    const user = userWith([irb.field("id", irb.primitiveType("string"))]);
    const unguardedArray = irb.typeDef(
      "CanX",
      irb.objectType([
        irb.field("principal", irb.namedType("User")),
        irb.field("resource", irb.namedType("Res")),
      ]),
      {
        annotations: [
          irb.annotation(
            "policy",
            irb.objectLiteral({
              allow: irb.stringLiteral("principal.id in resource.ids"),
            }),
          ),
        ],
      },
    );
    expect(() =>
      assertValidIrForPolicy(
        irb.schema({ types: [user, resource, unguardedArray] }),
      ),
    ).toThrow(PluginError);

    const guardedArray = irb.typeDef(
      "CanY",
      irb.objectType([
        irb.field("principal", irb.namedType("User")),
        irb.field("resource", irb.namedType("Res")),
      ]),
      {
        annotations: [
          irb.annotation(
            "policy",
            irb.objectLiteral({
              allow: irb.stringLiteral(
                "has(resource.ids) && principal.id in resource.ids",
              ),
            }),
          ),
        ],
      },
    );
    expect(() =>
      assertValidIrForPolicy(
        irb.schema({ types: [user, resource, guardedArray] }),
      ),
    ).not.toThrow();

    const itemUnguarded = irb.typeDef(
      "CanZ",
      irb.objectType([
        irb.field("principal", irb.namedType("User")),
        irb.field("resource", irb.namedType("Res")),
      ]),
      {
        annotations: [
          irb.annotation(
            "policy",
            irb.objectLiteral({
              allow: irb.stringLiteral(
                "principal.id in [resource.fallback, 'x']",
              ),
            }),
          ),
        ],
      },
    );
    expect(() =>
      assertValidIrForPolicy(
        irb.schema({ types: [user, resource, itemUnguarded] }),
      ),
    ).toThrow(PluginError);
  });

  it("handles both-sides optional ordering with full guards", () => {
    const user = userWith([
      irb.field("a", irb.primitiveType("int"), { optional: true }),
    ]);
    const res = irb.typeDef(
      "Res",
      irb.objectType([
        irb.field("b", irb.primitiveType("int"), { optional: true }),
      ]),
    );
    const oneGuard = irb.typeDef(
      "CanX",
      irb.objectType([
        irb.field("principal", irb.namedType("User")),
        irb.field("resource", irb.namedType("Res")),
      ]),
      {
        annotations: [
          irb.annotation(
            "policy",
            irb.objectLiteral({
              allow: irb.stringLiteral(
                "has(principal.a) && principal.a > resource.b",
              ),
            }),
          ),
        ],
      },
    );
    expect(() =>
      assertValidIrForPolicy(irb.schema({ types: [user, res, oneGuard] })),
    ).toThrow(PluginError);

    const bothGuards = irb.typeDef(
      "CanY",
      irb.objectType([
        irb.field("principal", irb.namedType("User")),
        irb.field("resource", irb.namedType("Res")),
      ]),
      {
        annotations: [
          irb.annotation(
            "policy",
            irb.objectLiteral({
              allow: irb.stringLiteral(
                "has(principal.a) && has(resource.b) && principal.a > resource.b",
              ),
            }),
          ),
        ],
      },
    );
    expect(() =>
      assertValidIrForPolicy(irb.schema({ types: [user, res, bothGuards] })),
    ).not.toThrow();
  });

  it("handles nested boolean guard flow", () => {
    const user2 = userWith([
      irb.field("n", irb.primitiveType("int"), { optional: true }),
      irb.field("b", irb.primitiveType("string")),
    ]);
    const explicit: Array<[string, boolean]> = [
      ["has(principal.n) && (principal.n > 1 || principal.b == 'x')", true],
      ["(has(principal.n) && principal.n > 1) || principal.b == 'x'", true],
      ["!has(principal.n) || principal.n > 1", false],
      ["has(principal.n) && !!(principal.n > 1)", true],
      ["has(principal.n) && !(principal.n > 1)", true],
    ];
    for (const [expr, ok] of explicit) {
      const policy = irb.typeDef(
        "CanX",
        irb.objectType([irb.field("principal", irb.namedType("User"))]),
        {
          annotations: [
            irb.annotation(
              "policy",
              irb.objectLiteral({ allow: irb.stringLiteral(expr) }),
            ),
          ],
        },
      );
      // need User named User with n/b: user2 is named User? user2 uses name User via userWith -> name User. good.
      if (ok) {
        expect(
          () => assertValidIrForPolicy(irb.schema({ types: [user2, policy] })),
          expr,
        ).not.toThrow();
      } else {
        expect(
          () => assertValidIrForPolicy(irb.schema({ types: [user2, policy] })),
          expr,
        ).toThrow(PluginError);
      }
    }
  });

  it("handles whitespace-only denies and bool shapes", () => {
    const user = userWith([irb.field("active", irb.primitiveType("bool"))]);
    const denyFalse = irb.typeDef(
      "CanX",
      irb.objectType([irb.field("principal", irb.namedType("User"))]),
      {
        annotations: [
          irb.annotation(
            "policy",
            irb.objectLiteral({
              allow: irb.stringLiteral("  true  "),
              deny: irb.stringLiteral("false"),
            }),
          ),
        ],
      },
    );
    expect(() =>
      assertValidIrForPolicy(irb.schema({ types: [user, denyFalse] })),
    ).not.toThrow();

    const andBools = irb.typeDef(
      "CanY",
      irb.objectType([irb.field("principal", irb.namedType("User"))]),
      {
        annotations: [
          irb.annotation(
            "policy",
            irb.objectLiteral({
              allow: irb.stringLiteral("principal.active && true"),
            }),
          ),
        ],
      },
    );
    expect(() =>
      assertValidIrForPolicy(irb.schema({ types: [user, andBools] })),
    ).not.toThrow();
  });
});

describe("assertValidIrForPolicy syntax integration", () => {
  it("supports keyword field names and deny syntax errors", () => {
    const user = irb.typeDef(
      "User",
      irb.objectType([irb.field("in", irb.primitiveType("string"))]),
    );
    const ok = irb.typeDef(
      "CanX",
      irb.objectType([irb.field("principal", irb.namedType("User"))]),
      {
        annotations: [
          irb.annotation(
            "policy",
            irb.objectLiteral({
              allow: irb.stringLiteral("principal.in == 'x'"),
            }),
          ),
        ],
      },
    );
    expect(() =>
      assertValidIrForPolicy(irb.schema({ types: [user, ok] })),
    ).not.toThrow();

    const badDeny = irb.typeDef(
      "CanY",
      irb.objectType([irb.field("principal", irb.namedType("User"))]),
      {
        annotations: [
          irb.annotation(
            "policy",
            irb.objectLiteral({
              allow: irb.stringLiteral("true"),
              deny: irb.stringLiteral("principal.in + 1"),
            }),
          ),
        ],
      },
    );
    const error = (() => {
      try {
        assertValidIrForPolicy(irb.schema({ types: [user, badDeny] }));
        throw new Error("should throw");
      } catch (caught) {
        if (!(caught instanceof PluginError)) {
          throw caught;
        }
        return caught;
      }
    })();
    expect(error.message).toContain("deny");
  });
});
