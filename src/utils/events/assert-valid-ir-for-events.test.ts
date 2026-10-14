import { describe, expect, it } from "vitest";

import { PluginError } from "../../core";
import * as irb from "../../testing";
import { assertValidIrForEvents } from "./assert-valid-ir-for-events";

function eventType(
  name: string,
  template: string,
  fields = [irb.field("userId", irb.primitiveType("string"))],
) {
  return irb.typeDef(name, irb.objectType(fields), {
    annotations: [irb.annotation("event", irb.stringLiteral(template))],
  });
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

describe("assertValidIrForEvents", () => {
  it("returns empty when no events exist", () => {
    const ir = irb.schema({
      types: [
        irb.typeDef(
          "User",
          irb.objectType([irb.field("id", irb.primitiveType("string"))]),
        ),
      ],
    });
    expect(assertValidIrForEvents(ir)).toEqual([]);
  });

  it("validates static templates without placeholders", () => {
    const type = eventType("UserLoginAudit", "audit.login", [
      irb.field("userId", irb.primitiveType("string")),
      irb.field("at", irb.primitiveType("datetime")),
    ]);
    const [result] = assertValidIrForEvents(irb.schema({ types: [type] }));
    expect(result?.subjectTemplate).toBe("audit.login");
    expect(result?.placeholders).toEqual([]);
    expect(result?.position).toEqual(type.position);
  });

  it("resolves placeholders in order", () => {
    const type = eventType(
      "TenantUserCreated",
      "tenant.{tenantId}.users.{userId}.created",
      [
        irb.field("tenantId", irb.primitiveType("string")),
        irb.field("userId", irb.primitiveType("string")),
        irb.field("email", irb.primitiveType("string")),
      ],
    );
    const [result] = assertValidIrForEvents(irb.schema({ types: [type] }));
    expect(result?.placeholders.map((item) => item.field)).toEqual([
      "tenantId",
      "userId",
    ]);
  });

  it("deduplicates repeated placeholders by first appearance", () => {
    const type = eventType(
      "UserAuditCreated",
      "audit.{tenantId}.users.{tenantId}.created",
      [irb.field("tenantId", irb.primitiveType("string"))],
    );
    const [result] = assertValidIrForEvents(irb.schema({ types: [type] }));
    expect(result?.placeholders).toHaveLength(1);

    const reordered = eventType("Reordered", "{b}.{a}.{b}", [
      irb.field("a", irb.primitiveType("string")),
      irb.field("b", irb.primitiveType("string")),
    ]);
    const [second] = assertValidIrForEvents(irb.schema({ types: [reordered] }));
    expect(second?.placeholders.map((item) => item.field)).toEqual(["b", "a"]);
  });

  it("handles adjacent and edge-position placeholders", () => {
    const adjacent = eventType("Adjacent", "{a}{b}", [
      irb.field("a", irb.primitiveType("string")),
      irb.field("b", irb.primitiveType("string")),
    ]);
    const [result] = assertValidIrForEvents(irb.schema({ types: [adjacent] }));
    expect(result?.placeholders.map((item) => item.field)).toEqual(["a", "b"]);

    const only = eventType("Only", "{userId}", [
      irb.field("userId", irb.primitiveType("string")),
    ]);
    expect(
      assertValidIrForEvents(irb.schema({ types: [only] }))[0]?.placeholders,
    ).toHaveLength(1);
  });

  it("resolves every primitive kind", () => {
    const type = eventType("AllPrimitives", "{s}.{i}.{f}.{b}.{d}", [
      irb.field("s", irb.primitiveType("string")),
      irb.field("i", irb.primitiveType("int")),
      irb.field("f", irb.primitiveType("float")),
      irb.field("b", irb.primitiveType("bool")),
      irb.field("d", irb.primitiveType("datetime")),
    ]);
    const [result] = assertValidIrForEvents(irb.schema({ types: [type] }));
    expect(result?.placeholders.map((item) => item.primitiveType)).toEqual([
      "string",
      "int",
      "float",
      "bool",
      "datetime",
    ]);
  });

  it("resolves named aliases to primitives", () => {
    const alias = irb.typeDef("OrderId", irb.primitiveType("string"));
    const type = eventType("OrderChanged", "orders.{orderId}", [
      irb.field("orderId", irb.namedType("OrderId")),
    ]);
    const [result] = assertValidIrForEvents(
      irb.schema({ types: [alias, type] }),
    );
    expect(result?.placeholders[0]?.primitiveType).toBe("string");
  });

  it("rejects optional placeholder fields", () => {
    const type = eventType("MaybeRouted", "orders.{orderId}", [
      irb.field("orderId", irb.primitiveType("string"), { optional: true }),
    ]);
    const error = errorOf(() =>
      assertValidIrForEvents(irb.schema({ types: [type] })),
    );
    expect(error.message).toContain("required");
  });

  it("allows empty templates as zero-placeholder subjects", () => {
    const type = eventType("Empty", "", [
      irb.field("id", irb.primitiveType("string")),
    ]);
    expect(
      assertValidIrForEvents(irb.schema({ types: [type] }))[0]?.placeholders,
    ).toEqual([]);
  });

  it("allows unicode static segments and odd field names", () => {
    const type = eventType("Weird", "t.{f0}.{_x}.fin", [
      irb.field("f0", irb.primitiveType("string")),
      irb.field("_x", irb.primitiveType("int")),
    ]);
    expect(
      assertValidIrForEvents(irb.schema({ types: [type] }))[0]?.placeholders,
    ).toHaveLength(2);

    const unicode = eventType("Uni", "tënant.{id}.fin", [
      irb.field("id", irb.primitiveType("string")),
    ]);
    expect(
      assertValidIrForEvents(irb.schema({ types: [unicode] }))[0]?.placeholders,
    ).toHaveLength(1);
  });

  it("sorts events by name", () => {
    const b = eventType("BEvent", "b", [
      irb.field("id", irb.primitiveType("string")),
    ]);
    const a = eventType("AEvent", "a", [
      irb.field("id", irb.primitiveType("string")),
    ]);
    const out = assertValidIrForEvents(irb.schema({ types: [b, a] }));
    expect(out.map((item) => item.name)).toEqual(["AEvent", "BEvent"]);
  });

  it("rejects missing and non-string arguments", () => {
    const missing = irb.typeDef(
      "Bad",
      irb.objectType([irb.field("id", irb.primitiveType("string"))]),
      {
        annotations: [irb.annotation("event")],
      },
    );
    expect(() =>
      assertValidIrForEvents(irb.schema({ types: [missing] })),
    ).toThrow(PluginError);

    for (const argument of [
      irb.intLiteral(1),
      irb.boolLiteral(true),
      irb.objectLiteral({ subject: irb.stringLiteral("x") }),
      irb.arrayLiteral([irb.stringLiteral("x")]),
    ]) {
      const bad = irb.typeDef(
        "Bad",
        irb.objectType([irb.field("id", irb.primitiveType("string"))]),
        {
          annotations: [irb.annotation("event", argument)],
        },
      );
      expect(() =>
        assertValidIrForEvents(irb.schema({ types: [bad] })),
      ).toThrow(PluginError);
    }
  });

  it("rejects event on enum and constant", () => {
    const badEnum = irb.enumDef(
      "Bad",
      "string",
      [irb.enumMember("A", irb.stringLiteral("A"))],
      {
        annotations: [irb.annotation("event", irb.stringLiteral("x"))],
      },
    );
    expect(() =>
      assertValidIrForEvents(irb.schema({ enums: [badEnum] })),
    ).toThrow(PluginError);

    const badConst = irb.constantDef("BadConst", irb.stringLiteral("x"), {
      annotations: [irb.annotation("event", irb.stringLiteral("x"))],
    });
    expect(() =>
      assertValidIrForEvents(irb.schema({ constants: [badConst] })),
    ).toThrow(PluginError);
  });

  it("rejects non-object payloads", () => {
    for (const typeRef of [
      irb.primitiveType("string"),
      irb.enumType("Status", "string"),
      irb.arrayType(irb.primitiveType("string")),
      irb.mapType(irb.primitiveType("string")),
    ]) {
      const bad = irb.typeDef("Bad", typeRef, {
        annotations: [irb.annotation("event", irb.stringLiteral("static"))],
      });
      expect(() =>
        assertValidIrForEvents(irb.schema({ types: [bad] })),
      ).toThrow(PluginError);
    }
  });

  it("rejects missing fields with the field name", () => {
    const type = eventType("DeliveryFailed", "logistics.{region}.failed", [
      irb.field("deliveryId", irb.primitiveType("string")),
    ]);
    const error = errorOf(() =>
      assertValidIrForEvents(irb.schema({ types: [type] })),
    );
    expect(error.message).toContain("region");
  });

  it("rejects nested placeholder paths", () => {
    const type = eventType("AccountCreated", "accounts.{user.id}.created", [
      irb.field(
        "user",
        irb.objectType([irb.field("id", irb.primitiveType("string"))]),
      ),
    ]);
    expect(() => assertValidIrForEvents(irb.schema({ types: [type] }))).toThrow(
      PluginError,
    );
  });

  it("rejects non-primitive placeholder fields", () => {
    const status = irb.enumDef("Status", "string", [
      irb.enumMember("On", irb.stringLiteral("On")),
    ]);
    const cases: Array<[string, ReturnType<typeof irb.field>]> = [
      [
        "obj",
        irb.field(
          "obj",
          irb.objectType([irb.field("id", irb.primitiveType("string"))]),
        ),
      ],
      ["arr", irb.field("arr", irb.arrayType(irb.primitiveType("string")))],
      ["map", irb.field("map", irb.mapType(irb.primitiveType("string")))],
      ["enum", irb.field("enum", irb.enumType("Status", "string"))],
    ];
    for (const [name, field] of cases) {
      const type = eventType(`Bad${name}`, `x.{${field.name}}`, [field]);
      expect(
        () =>
          assertValidIrForEvents(
            irb.schema({ types: [type], enums: [status] }),
          ),
        name,
      ).toThrow(PluginError);
    }

    const holder = irb.typeDef(
      "Holder",
      irb.objectType([irb.field("id", irb.primitiveType("string"))]),
    );
    const named = eventType("BadNamed", "x.{holder}", [
      irb.field("holder", irb.namedType("Holder")),
    ]);
    expect(() =>
      assertValidIrForEvents(irb.schema({ types: [holder, named] })),
    ).toThrow(PluginError);
  });

  it("rejects unknown and circular type references", () => {
    const unknown = eventType("BadUnknown", "x.{ref}", [
      irb.field("ref", irb.namedType("Missing")),
    ]);
    expect(() =>
      assertValidIrForEvents(irb.schema({ types: [unknown] })),
    ).toThrow(PluginError);

    const aliasA = irb.typeDef("AliasA", irb.namedType("AliasB"));
    const aliasB = irb.typeDef("AliasB", irb.namedType("AliasA"));
    const circular = eventType("BadCircular", "x.{ref}", [
      irb.field("ref", irb.namedType("AliasA")),
    ]);
    expect(() =>
      assertValidIrForEvents(irb.schema({ types: [aliasA, aliasB, circular] })),
    ).toThrow(PluginError);
  });

  it("rejects malformed templates", () => {
    const fields = [irb.field("userId", irb.primitiveType("string"))];
    for (const template of [
      "auth.{userId",
      "auth.{userId",
      "auth.{}",
      "auth.{{userId}}",
      "auth.{ userId }",
      "auth.{user-id}",
      "auth.{user.id}",
      "auth.foo}",
      "}",
    ]) {
      const type = eventType("Bad", template, fields);
      expect(
        () => assertValidIrForEvents(irb.schema({ types: [type] })),
        template,
      ).toThrow(PluginError);
    }
  });

  it("rejects case-mismatched placeholders", () => {
    const type = eventType("Bad", "x.{UserId}", [
      irb.field("userId", irb.primitiveType("string")),
    ]);
    expect(() => assertValidIrForEvents(irb.schema({ types: [type] }))).toThrow(
      PluginError,
    );
  });

  it("points template errors at the annotation", () => {
    const annotation = irb.annotation(
      "event",
      irb.stringLiteral("x.{missing}"),
    );
    const type = irb.typeDef(
      "Bad",
      irb.objectType([irb.field("id", irb.primitiveType("string"))]),
      {
        annotations: [annotation],
      },
    );
    const error = errorOf(() =>
      assertValidIrForEvents(irb.schema({ types: [type] })),
    );
    expect(error.position).toEqual(annotation.position);
  });
});
