import { describe, expect, it } from "vitest";

import { parsePolicyExpressionSyntax } from "./parse-policy-expression";

function parses(source: string): void {
  expect(() => parsePolicyExpressionSyntax(source)).not.toThrow();
}

function rejects(source: string): void {
  expect(() => parsePolicyExpressionSyntax(source)).toThrow();
}

describe("parsePolicyExpressionSyntax", () => {
  it("parses boolean literals and precedence", () => {
    parses("true");
    parses("false");
    parses("!true");
    parses("!!principal.disabled");
    parses("principal.disabled == true");
    parses("(principal.disabled)");
    parses("principal.a == 'x' || principal.b == 'y' && principal.c == 'z'");
    parses("(principal.a == 'x' || principal.b == 'y') && principal.c == 'z'");
  });

  it("parses comparisons and in", () => {
    parses("principal.age == 100");
    parses("principal.score >= 10.5");
    parses("principal.name != 'a'");
    parses("principal.age > 10");
    parses("principal.age < 10");
    parses("principal.age <= 10");
    parses("principal.role in ['admin', 'owner']");
    parses("principal.id in resource.allowedIds");
    parses("principal.x in []");
  });

  it("parses has and nested paths", () => {
    parses("has(principal.department)");
    parses("has(principal.profile.department)");
    parses("has(principal.department) && principal.department == 'Finance'");
  });

  it("parses multiline whitespace", () => {
    parses("principal.a == 'x'\n  && principal.b == 'y'");
    parses("  principal.a == 'x'  ");
  });

  it("parses string escapes", () => {
    parses("principal.a == 'it\\'s'");
    parses("principal.a == 'a\\\\b'");
  });

  it("rejects empty and trailing tokens", () => {
    rejects("");
    rejects("   ");
    rejects("true false");
    rejects("principal.disabled == true principal.x == 'a'");
  });

  it("rejects double quotes and bad escapes", () => {
    rejects('principal.a == "x"');
    rejects("principal.a == 'a\\nb'");
    rejects("principal.a == 'unterminated");
  });

  it("rejects arithmetic and unknown operators", () => {
    rejects("principal.a + principal.b");
    rejects("principal.a - 1");
    rejects("principal.a * 2");
    rejects("principal.a / 2");
    rejects("principal.a = 'x'");
    rejects("principal.a & principal.b");
    rejects("principal.a | principal.b");
    rejects("principal.a % 2");
  });

  it("rejects indexing, calls and unknown identifiers", () => {
    rejects("principal.tags[0] == 'x'");
    rejects("principal.name() == 'x'");
    rejects("foo == 'x'");
    rejects("admin == 'x'");
    rejects("principal");
    rejects("has(principal)");
    rejects("has('x')");
    rejects("has()");
  });

  it("rejects bad arrays", () => {
    rejects("principal.a in ['a' 'b']");
    rejects("principal.a in ['a',]");
    rejects("principal.a in ['a'");
  });

  it("rejects bad parens", () => {
    rejects("(principal.a == 'x'");
    rejects("principal.a == 'x')");
    rejects("has(principal.a");
  });

  it("keeps source offsets", () => {
    const node = parsePolicyExpressionSyntax("principal.a == 'x'");
    expect(node.start).toBe(0);
    expect(node.end).toBe("principal.a == 'x'".length);
  });
});

describe("parsePolicyExpressionSyntax bunker", () => {
  it("rejects malformed has and in positions", () => {
    for (const bad of [
      "has principal.a",
      "has((principal.a))",
      "in ['a']",
      "== 'x'",
      "principal.a ==",
      "&& principal.a",
      "principal.a &&",
      "principal.a ||",
      "[,]",
      "[,'a']",
      "has(principal.a, principal.b)",
    ]) {
      expect(() => parsePolicyExpressionSyntax(bad), bad).toThrow();
    }
  });

  it("parses Comercial spec shapes", () => {
    expect(() =>
      parsePolicyExpressionSyntax(
        "principal.id == resource.ownerId || has(principal.department) && principal.department == 'Finance' && context.mfaVerified == true",
      ),
    ).not.toThrow();
    expect(() =>
      parsePolicyExpressionSyntax(
        "principal.disabled == true || resource.status == 'Locked'",
      ),
    ).not.toThrow();
    const arr = parsePolicyExpressionSyntax("[1, 2, 3, 4, 5]");
    expect(arr.kind).toBe("array");
  });
});

describe("parsePolicyExpressionSyntax syntax edges", () => {
  it("handles number edges", () => {
    for (const ok of [
      "0",
      "007",
      "0.0",
      "10.0",
      "1000000",
      "principal.a == 0",
      "principal.a == 0.5",
    ]) {
      expect(() => parsePolicyExpressionSyntax(ok), ok).not.toThrow();
    }
    for (const bad of [
      "1e10",
      "0x10",
      "10.",
      ".5",
      "01.02.03",
      "principal.a == -1",
      "principal.a == +1",
    ]) {
      expect(() => parsePolicyExpressionSyntax(bad), bad).toThrow();
    }
  });

  it("handles string edges", () => {
    for (const ok of [
      "principal.a == ''",
      "principal.a == 'a b'",
      "principal.a == 'a,b[c]'",
      "principal.a == 'üñî'",
      "principal.a == 'a\\\\b'",
      "principal.a == 'a;b'",
      "principal.a == 'a:b?c'",
    ]) {
      expect(() => parsePolicyExpressionSyntax(ok), ok).not.toThrow();
    }
    expect(() => parsePolicyExpressionSyntax("principal.a == `x`")).toThrow();
  });

  it("handles identifiers and keyword fields", () => {
    expect(() =>
      parsePolicyExpressionSyntax("principal.field_1 == 'x'"),
    ).not.toThrow();
    expect(() =>
      parsePolicyExpressionSyntax("principal._x == 'y'"),
    ).not.toThrow();
    expect(() =>
      parsePolicyExpressionSyntax("principal.in == 'x'"),
    ).not.toThrow();
    expect(() =>
      parsePolicyExpressionSyntax("principal.has == true"),
    ).not.toThrow();
    expect(() => parsePolicyExpressionSyntax("Has(principal.x)")).toThrow();
    expect(() => parsePolicyExpressionSyntax("Principal.x == 'a'")).toThrow();
    expect(() => parsePolicyExpressionSyntax("truex == 'a'")).toThrow();
    expect(() =>
      parsePolicyExpressionSyntax("principal.true == 'a'"),
    ).not.toThrow();
  });

  it("handles operators and nesting depth", () => {
    expect(() => parsePolicyExpressionSyntax("((((true))))")).not.toThrow();
    expect(() => parsePolicyExpressionSyntax("!(!(true))")).not.toThrow();
    expect(() => parsePolicyExpressionSyntax("!!!principal.a")).not.toThrow();
    expect(() =>
      parsePolicyExpressionSyntax("has( principal.a )"),
    ).not.toThrow();
    expect(() =>
      parsePolicyExpressionSyntax("has(\n principal.a \n)"),
    ).not.toThrow();
    expect(() =>
      parsePolicyExpressionSyntax("(principal.a) in ['x']"),
    ).not.toThrow();
    expect(() =>
      parsePolicyExpressionSyntax("principal.a in (['x'])"),
    ).not.toThrow();
    expect(() => parsePolicyExpressionSyntax("=== ")).toThrow();
    expect(() => parsePolicyExpressionSyntax("!==")).toThrow();
    expect(() => parsePolicyExpressionSyntax("&&&")).toThrow();
    expect(() => parsePolicyExpressionSyntax("|||")).toThrow();
    expect(() => parsePolicyExpressionSyntax("principal.")).toThrow();
    expect(() => parsePolicyExpressionSyntax(".principal")).toThrow();
    expect(() => parsePolicyExpressionSyntax("principal..x")).toThrow();
    expect(() => parsePolicyExpressionSyntax("principal.x.")).toThrow();
    expect(() => parsePolicyExpressionSyntax("// comment")).toThrow();
    expect(() => parsePolicyExpressionSyntax("/* comment */")).toThrow();
    expect(() => parsePolicyExpressionSyntax("principal.a;")).toThrow();
    expect(() => parsePolicyExpressionSyntax("has principal.a")).toThrow();
    expect(() => parsePolicyExpressionSyntax("()")).toThrow();
    expect(() => parsePolicyExpressionSyntax("(())")).toThrow();
    expect(() => parsePolicyExpressionSyntax("100abc")).toThrow();
    expect(() => parsePolicyExpressionSyntax("!")).toThrow();
    expect(() => parsePolicyExpressionSyntax("principal.a && !")).toThrow();
  });

  it("handles long chains fast", () => {
    const clauses: string[] = [];
    for (let i = 0; i < 30; i += 1) {
      clauses.push(`principal.f${i} == 'v${i}'`);
    }
    const node = parsePolicyExpressionSyntax(clauses.join(" && "));
    expect(node.kind).toBe("and");
    expect(parsePolicyExpressionSyntax(clauses.join(" || ")).kind).toBe("or");
    const bigArray = `[${Array.from({ length: 20 }, (_, i) => `'v${i}'`).join(", ")}]`;
    expect(parsePolicyExpressionSyntax(`principal.a in ${bigArray}`).kind).toBe(
      "in",
    );
  });

  it("locks operator precedence in the AST shape", () => {
    const orAnd = parsePolicyExpressionSyntax(
      "principal.a == 'x' || principal.b == 'y' && principal.c == 'z'",
    );
    expect(orAnd.kind).toBe("or");
    const orOptions = (orAnd as { options: { kind: string }[] }).options;
    expect(orOptions).toHaveLength(2);
    expect(orOptions[0]?.kind).toBe("comparison");
    expect(orOptions[1]?.kind).toBe("and");

    const paren = parsePolicyExpressionSyntax(
      "(principal.a == 'x' || principal.b == 'y') && principal.c == 'z'",
    );
    expect(paren.kind).toBe("and");

    const notCmp = parsePolicyExpressionSyntax("!principal.a == 'x'");
    expect(notCmp.kind).toBe("comparison");
    expect((notCmp as { left: { kind: string } }).left.kind).toBe("not");
  });

  it("reports offsets for malformed input", () => {
    for (const bad of [
      "principal.a + 1",
      "principal.a == 'x",
      "(principal.a",
    ] as const) {
      try {
        parsePolicyExpressionSyntax(bad);
        throw new Error(`should throw for ${bad}`);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toMatch(
          /offset|Unexpected|Missing|Unterminated/i,
        );
      }
    }
  });
});
