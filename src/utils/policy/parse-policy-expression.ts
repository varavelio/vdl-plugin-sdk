/**
 * Internal lexer and parser for the VPP-3 policy language.
 *
 * This module is intentionally not part of the public API surface.
 * Plugin authors should use `assertValidIrForPolicy`, which parses,
 * validates and resolves expressions against the VDL IR in one step.
 */

export type SyntaxRef = {
  kind: "ref";
  root: string;
  path: string[];
  start: number;
  end: number;
};

export type SyntaxLiteral = {
  kind: "literal";
  value: string | number | boolean;
  literalKind: "string" | "int" | "float" | "bool";
  start: number;
  end: number;
};

export type SyntaxArray = {
  kind: "array";
  items: SyntaxExpr[];
  start: number;
  end: number;
};

export type SyntaxExpr =
  | { kind: "or"; options: SyntaxExpr[]; start: number; end: number }
  | { kind: "and"; clauses: SyntaxExpr[]; start: number; end: number }
  | { kind: "not"; value: SyntaxExpr; start: number; end: number }
  | {
      kind: "comparison";
      operator: "==" | "!=" | ">" | ">=" | "<" | "<=";
      left: SyntaxExpr;
      right: SyntaxExpr;
      start: number;
      end: number;
    }
  | {
      kind: "in";
      value: SyntaxExpr;
      candidates: SyntaxExpr;
      start: number;
      end: number;
    }
  | { kind: "has"; ref: SyntaxRef; start: number; end: number }
  | SyntaxRef
  | SyntaxLiteral
  | SyntaxArray;

type Token =
  | { kind: "ident"; text: string; start: number; end: number }
  | { kind: "string"; value: string; start: number; end: number }
  | {
      kind: "number";
      value: number;
      isFloat: boolean;
      start: number;
      end: number;
    }
  | { kind: "op"; text: string; start: number; end: number }
  | { kind: "lparen"; start: number; end: number }
  | { kind: "rparen"; start: number; end: number }
  | { kind: "lbracket"; start: number; end: number }
  | { kind: "rbracket"; start: number; end: number }
  | { kind: "comma"; start: number; end: number }
  | { kind: "dot"; start: number; end: number };

function isAlpha(code: number): boolean {
  return (
    (code >= 65 && code <= 90) || (code >= 97 && code <= 122) || code === 95
  );
}

function isDigit(code: number): boolean {
  return code >= 48 && code <= 57;
}

function isAlphaNum(code: number): boolean {
  return isAlpha(code) || isDigit(code);
}

function isSpace(code: number): boolean {
  return code === 32 || code === 9 || code === 10 || code === 13;
}

function snippet(source: string, offset: number): string {
  const from = offset < 20 ? 0 : offset - 20;
  const to = offset + 20 < source.length ? offset + 20 : source.length;
  return JSON.stringify(source.slice(from, to));
}

/**
 * Tokenizes a policy expression source string.
 *
 * @param source - Raw `allow` or `deny` expression text.
 * @returns Token list without whitespace.
 */
export function tokenizePolicyExpression(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < source.length) {
    const code = source.charCodeAt(i) as number;

    if (isSpace(code)) {
      i += 1;
      continue;
    }

    if (isAlpha(code)) {
      const start = i;
      i += 1;
      while (i < source.length && isAlphaNum(source.charCodeAt(i) as number)) {
        i += 1;
      }
      tokens.push({
        kind: "ident",
        text: source.slice(start, i),
        start,
        end: i,
      });
      continue;
    }

    if (isDigit(code)) {
      const start = i;
      while (i < source.length && isDigit(source.charCodeAt(i) as number)) {
        i += 1;
      }
      let isFloat = false;
      let value: number;
      if (
        source.charCodeAt(i) === 46 &&
        i + 1 < source.length &&
        isDigit(source.charCodeAt(i + 1) as number)
      ) {
        isFloat = true;
        i += 1;
        while (i < source.length && isDigit(source.charCodeAt(i) as number)) {
          i += 1;
        }
        value = Number(source.slice(start, i));
      } else {
        value = Number(source.slice(start, i));
      }
      if (!Number.isFinite(value)) {
        throw new Error(
          `Invalid number at offset ${start} in ${snippet(source, start)}`,
        );
      }
      tokens.push({ kind: "number", value, isFloat, start, end: i });
      continue;
    }

    if (code === 39) {
      const start = i;
      i += 1;
      let out = "";
      let closed = false;
      while (i < source.length) {
        const c = source.charCodeAt(i) as number;
        if (c === 92) {
          const next = i + 1 < source.length ? source.charCodeAt(i + 1) : -1;
          if (next === 39) {
            out += "'";
            i += 2;
            continue;
          }
          if (next === 92) {
            out += "\\";
            i += 2;
            continue;
          }
          throw new Error(
            `Unsupported escape at offset ${i} in ${snippet(source, i)}`,
          );
        }
        if (c === 39) {
          closed = true;
          i += 1;
          break;
        }
        out += source[i];
        i += 1;
      }
      if (!closed) {
        throw new Error(
          `Unterminated string at offset ${start} in ${snippet(source, start)}`,
        );
      }
      tokens.push({ kind: "string", value: out, start, end: i });
      continue;
    }

    const two = source.slice(i, i + 2);
    if (
      two === "==" ||
      two === "!=" ||
      two === ">=" ||
      two === "<=" ||
      two === "&&" ||
      two === "||"
    ) {
      tokens.push({ kind: "op", text: two, start: i, end: i + 2 });
      i += 2;
      continue;
    }

    const ch = source[i] as string;
    if (ch === ">" || ch === "<" || ch === "!") {
      tokens.push({ kind: "op", text: ch, start: i, end: i + 1 });
      i += 1;
      continue;
    }
    if (ch === "(") {
      tokens.push({ kind: "lparen", start: i, end: i + 1 });
      i += 1;
      continue;
    }
    if (ch === ")") {
      tokens.push({ kind: "rparen", start: i, end: i + 1 });
      i += 1;
      continue;
    }
    if (ch === "[") {
      tokens.push({ kind: "lbracket", start: i, end: i + 1 });
      i += 1;
      continue;
    }
    if (ch === "]") {
      tokens.push({ kind: "rbracket", start: i, end: i + 1 });
      i += 1;
      continue;
    }
    if (ch === ",") {
      tokens.push({ kind: "comma", start: i, end: i + 1 });
      i += 1;
      continue;
    }
    if (ch === ".") {
      tokens.push({ kind: "dot", start: i, end: i + 1 });
      i += 1;
      continue;
    }

    throw new Error(
      `Unexpected character ${JSON.stringify(ch)} at offset ${i} in ${snippet(source, i)}`,
    );
  }

  return tokens;
}

class Parser {
  private pos = 0;

  constructor(
    private readonly tokens: Token[],
    private readonly source: string,
  ) {}

  parse(): SyntaxExpr {
    if (this.tokens.length === 0) {
      throw new Error(`Empty expression in ${JSON.stringify(this.source)}`);
    }
    const expr = this.parseOr();
    const extra = this.peek();
    if (extra) {
      throw new Error(
        `Unexpected token at offset ${extra.start} in ${snippet(this.source, extra.start)}`,
      );
    }
    return expr;
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private next(): Token | undefined {
    const token = this.tokens[this.pos];
    this.pos += 1;
    return token;
  }

  private parseOr(): SyntaxExpr {
    const first = this.parseAnd();
    const options: SyntaxExpr[] = [first];
    for (;;) {
      const token = this.peek();
      if (token && token.kind === "op" && token.text === "||") {
        this.next();
        options.push(this.parseAnd());
        continue;
      }
      break;
    }
    if (options.length === 1) {
      return options[0] as SyntaxExpr;
    }
    return {
      kind: "or",
      options,
      start: first.start,
      end: (options[options.length - 1] as SyntaxExpr).end,
    };
  }

  private parseAnd(): SyntaxExpr {
    const first = this.parseCmp();
    const clauses: SyntaxExpr[] = [first];
    for (;;) {
      const token = this.peek();
      if (token && token.kind === "op" && token.text === "&&") {
        this.next();
        clauses.push(this.parseCmp());
        continue;
      }
      break;
    }
    if (clauses.length === 1) {
      return clauses[0] as SyntaxExpr;
    }
    return {
      kind: "and",
      clauses,
      start: first.start,
      end: (clauses[clauses.length - 1] as SyntaxExpr).end,
    };
  }

  private parseCmp(): SyntaxExpr {
    const left = this.parseUnary();
    const token = this.peek();
    if (!token) {
      return left;
    }
    if (
      token.kind === "op" &&
      (token.text === "==" ||
        token.text === "!=" ||
        token.text === ">" ||
        token.text === ">=" ||
        token.text === "<" ||
        token.text === "<=")
    ) {
      this.next();
      const right = this.parseUnary();
      return {
        kind: "comparison",
        operator: token.text as "==" | "!=" | ">" | ">=" | "<" | "<=",
        left,
        right,
        start: left.start,
        end: right.end,
      };
    }
    if (token.kind === "ident" && token.text === "in") {
      this.next();
      const right = this.parseUnary();
      return {
        kind: "in",
        value: left,
        candidates: right,
        start: left.start,
        end: right.end,
      };
    }
    return left;
  }

  private parseUnary(): SyntaxExpr {
    const token = this.peek();
    if (token && token.kind === "op" && token.text === "!") {
      this.next();
      const value = this.parseUnary();
      return { kind: "not", value, start: token.start, end: value.end };
    }
    return this.parsePrimary();
  }

  private parsePrimary(): SyntaxExpr {
    const token = this.peek();
    if (!token) {
      throw new Error(`Unexpected end in ${JSON.stringify(this.source)}`);
    }
    if (token.kind === "lparen") {
      this.next();
      const inner = this.parseOr();
      const closing = this.next();
      if (!closing || closing.kind !== "rparen") {
        throw new Error(
          `Missing closing parenthesis at offset ${token.start} in ${snippet(this.source, token.start)}`,
        );
      }
      return { ...inner, start: token.start, end: closing.end };
    }
    if (token.kind === "lbracket") {
      return this.parseArray();
    }
    if (token.kind === "string") {
      this.next();
      return {
        kind: "literal",
        value: token.value,
        literalKind: "string",
        start: token.start,
        end: token.end,
      };
    }
    if (token.kind === "number") {
      this.next();
      return {
        kind: "literal",
        value: token.value,
        literalKind: token.isFloat ? "float" : "int",
        start: token.start,
        end: token.end,
      };
    }
    if (token.kind === "ident") {
      if (token.text === "true" || token.text === "false") {
        this.next();
        return {
          kind: "literal",
          value: token.text === "true",
          literalKind: "bool",
          start: token.start,
          end: token.end,
        };
      }
      if (token.text === "has") {
        return this.parseHas();
      }
      if (
        token.text === "principal" ||
        token.text === "resource" ||
        token.text === "context"
      ) {
        return this.parseRef();
      }
      throw new Error(
        `Unknown identifier ${JSON.stringify(token.text)} at offset ${token.start} in ${snippet(this.source, token.start)}`,
      );
    }
    throw new Error(
      `Unexpected token at offset ${token.start} in ${snippet(this.source, token.start)}`,
    );
  }

  private parseHas(): SyntaxExpr {
    const start = this.next() as Token;
    const open = this.next();
    if (!open || open.kind !== "lparen") {
      throw new Error(
        `Missing opening parenthesis for has at offset ${start.start} in ${snippet(this.source, start.start)}`,
      );
    }
    const refToken = this.peek();
    if (!refToken || refToken.kind !== "ident") {
      throw new Error(
        `has() expects a reference at offset ${open.end} in ${snippet(this.source, open.end)}`,
      );
    }
    if (
      refToken.text !== "principal" &&
      refToken.text !== "resource" &&
      refToken.text !== "context"
    ) {
      throw new Error(
        `has() expects principal, resource or context at offset ${refToken.start} in ${snippet(this.source, refToken.start)}`,
      );
    }
    const ref = this.parseRef() as SyntaxRef;
    const closing = this.next();
    if (!closing || closing.kind !== "rparen") {
      throw new Error(
        `Missing closing parenthesis for has at offset ${start.start} in ${snippet(this.source, start.start)}`,
      );
    }
    return { kind: "has", ref, start: start.start, end: closing.end };
  }

  private parseRef(): SyntaxRef {
    const root = this.next() as Token;
    if (root.kind !== "ident") {
      throw new Error(`Expected root in ${JSON.stringify(this.source)}`);
    }
    const path: string[] = [];
    let end = root.end;
    const dot = this.peek();
    if (!dot || dot.kind !== "dot") {
      throw new Error(
        `Reference ${JSON.stringify(root.kind === "ident" ? (root as { text: string }).text : "")} needs a field path at offset ${root.start} in ${snippet(this.source, root.start)}`,
      );
    }
    for (;;) {
      const separator = this.next();
      if (!separator || separator.kind !== "dot") {
        break;
      }
      const field = this.next();
      if (!field || field.kind !== "ident") {
        throw new Error(
          `Expected field name at offset ${separator.end} in ${snippet(this.source, separator.end)}`,
        );
      }
      path.push(field.text);
      end = field.end;
      const next = this.peek();
      if (!next || next.kind !== "dot") {
        break;
      }
    }
    return {
      kind: "ref",
      root: (root as { text: string }).text,
      path,
      start: root.start,
      end,
    };
  }

  private parseArray(): SyntaxArray {
    const open = this.next() as Token;
    const items: SyntaxExpr[] = [];
    const next = this.peek();
    if (next && next.kind === "rbracket") {
      const closing = this.next() as Token;
      return { kind: "array", items, start: open.start, end: closing.end };
    }
    for (;;) {
      const item = this.parseOr();
      items.push(item);
      const separator = this.peek();
      if (separator && separator.kind === "comma") {
        this.next();
        const afterComma = this.peek();
        if (!afterComma) {
          throw new Error(
            `Trailing comma at offset ${separator.start} in ${snippet(this.source, separator.start)}`,
          );
        }
        if (afterComma.kind === "rbracket") {
          throw new Error(
            `Trailing comma at offset ${separator.start} in ${snippet(this.source, separator.start)}`,
          );
        }
        continue;
      }
      break;
    }
    const closing = this.next();
    if (!closing || closing.kind !== "rbracket") {
      throw new Error(
        `Missing closing bracket at offset ${open.start} in ${snippet(this.source, open.start)}`,
      );
    }
    return { kind: "array", items, start: open.start, end: closing.end };
  }
}

/**
 * Parses a policy expression into an unresolved syntax tree.
 *
 * @param source - Raw `allow` or `deny` expression text.
 * @returns Syntax tree with source offsets.
 */
export function parsePolicyExpressionSyntax(source: string): SyntaxExpr {
  const tokens = tokenizePolicyExpression(source);
  return new Parser(tokens, source).parse();
}
