import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { TypeDef } from "../../../core/types";
import * as irb from "../../../testing";
import { dedent } from "../../strings/dedent";
import { generateVdl } from "./vdl";

describe("generateVdlGolden", () => {
  const fixturesRootPath = path.join(__dirname, "fixtures");
  const fixtureNames = readdirSync(fixturesRootPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => {
      const fixturePath = path.join(fixturesRootPath, entry.name);
      return (
        existsSync(path.join(fixturePath, "main.vdl")) &&
        existsSync(path.join(fixturePath, "expected.vdl"))
      );
    })
    .map((entry) => entry.name)
    .sort();

  for (const fixtureName of fixtureNames) {
    it(`${fixtureName} matches expected.vdl`, () => {
      const fixturePath = path.join(fixturesRootPath, fixtureName);
      const expectedPath = path.join(fixturePath, "expected.vdl");
      const mainPath = path.join(fixturePath, "main.vdl");

      const expected = readFileSync(expectedPath, "utf8").trim();
      const ir = execSync(`npx vdl compile "${mainPath}"`).toString();
      const got = generateVdl(JSON.parse(ir)).trim();

      expect(got).toBe(expected);
    });
  }
});

describe("generateVdl", () => {
  it("generates decorated type definitions with nested type references", () => {
    const userType = irb.typeDef(
      "User",
      irb.objectType([
        irb.field("id", irb.primitiveType("string"), {
          doc: "Unique identifier",
          annotations: [irb.annotation("id")],
        }),
        irb.field(
          "profile",
          irb.objectType([
            irb.field("createdAt", irb.primitiveType("datetime")),
            irb.field("tags", irb.arrayType(irb.primitiveType("string"))),
          ]),
        ),
        irb.field("metadata", irb.mapType(irb.primitiveType("string")), {
          optional: true,
        }),
        irb.field("status", irb.enumType("Status", "string")),
      ]),
      {
        doc: "Represents a user",
        annotations: [
          irb.annotation("entity"),
          irb.annotation(
            "meta",
            irb.objectLiteral({
              owner: irb.stringLiteral("core"),
              modes: irb.arrayLiteral([
                irb.stringLiteral("read"),
                irb.stringLiteral("write"),
              ]),
            }),
          ),
        ],
      },
    );

    expect(generateVdl(userType)).toBe(
      dedent(`
      """
      Represents a user
      """
      @entity
      @meta({
        owner "core"
        modes ["read" "write"]
      })
      type User {
        """
        Unique identifier
        """
        @id
        id string

        profile {
          createdAt datetime
          tags string[]
        }

        metadata? map[string]
        status Status
      }
    `),
    );
  });

  it("omits redundant string enum assignments and keeps explicit values", () => {
    const statusEnum = irb.enumDef(
      "Status",
      "string",
      [
        irb.enumMember("Active", irb.stringLiteral("Active")),
        irb.enumMember("Archived", irb.stringLiteral("archived"), {
          doc: "Used for soft deletion",
          annotations: [
            irb.annotation("deprecated", irb.stringLiteral("Use Disabled")),
          ],
        }),
      ],
      {
        doc: "Lifecycle state",
        annotations: [irb.annotation("stable")],
      },
    );

    expect(generateVdl(statusEnum)).toBe(
      dedent(`
      """
      Lifecycle state
      """
      @stable
      enum Status {
        Active

        """
        Used for soft deletion
        """
        @deprecated("Use Disabled")
        Archived = "archived"
      }
    `),
    );
  });

  it("keeps explicit numeric enum values", () => {
    const priorityEnum = irb.enumDef("Priority", "int", [
      irb.enumMember("Low", irb.intLiteral(1)),
      irb.enumMember("Medium", irb.intLiteral(2)),
      irb.enumMember("High", irb.intLiteral(3)),
    ]);

    expect(generateVdl(priorityEnum)).toBe(
      dedent(`
      enum Priority {
        Low = 1
        Medium = 2
        High = 3
      }
    `),
    );
  });

  it("generates constants with nested object and array literals", () => {
    const configConstant = irb.constantDef(
      "defaultConfig",
      irb.objectLiteral({
        enabled: irb.boolLiteral(true),
        retryBackoffMs: irb.arrayLiteral([
          irb.intLiteral(100),
          irb.intLiteral(250),
          irb.intLiteral(500),
        ]),
        transport: irb.objectLiteral({
          host: irb.stringLiteral("localhost"),
          tls: irb.boolLiteral(false),
        }),
      }),
      {
        doc: "Default runtime configuration",
        annotations: [irb.annotation("generated", irb.boolLiteral(true))],
      },
    );

    expect(generateVdl(configConstant)).toBe(
      dedent(`
      """
      Default runtime configuration
      """
      @generated(true)
      const defaultConfig = {
        enabled true
        retryBackoffMs [100 250 500]
        transport {
          host "localhost"
          tls false
        }
      }
    `),
    );
  });

  it("sorts top-level schema nodes by source position and includes standalone docs", () => {
    const topLevelDoc = {
      position: irb.position({ line: 1, column: 1 }),
      content: "Schema overview",
    };
    const typeDef = irb.typeDef("User", irb.primitiveType("string"));
    typeDef.position = irb.position({ line: 20, column: 1 });

    const enumDef = irb.enumDef("Status", "string", [
      irb.enumMember("Active", irb.stringLiteral("Active")),
    ]);
    enumDef.position = irb.position({ line: 10, column: 1 });

    const constantDef = irb.constantDef(
      "apiVersion",
      irb.stringLiteral("1.0.0"),
    );
    constantDef.position = irb.position({ line: 30, column: 1 });

    expect(
      generateVdl(
        irb.schema({
          types: [typeDef],
          enums: [enumDef],
          constants: [constantDef],
          docs: [topLevelDoc],
        }),
      ),
    ).toBe(
      dedent(`
      """
      Schema overview
      """

      enum Status {
        Active
      }

      type User string

      const apiVersion = "1.0.0"
    `),
    );
  });

  it("strips docstrings when docstrings mode is set to strip", () => {
    const typeDef = irb.typeDef(
      "User",
      irb.objectType([
        irb.field("id", irb.primitiveType("string"), {
          doc: "Field documentation",
        }),
      ]),
      {
        doc: "Type documentation",
        annotations: [irb.annotation("entity")],
      },
    );
    typeDef.position = irb.position({ line: 10, column: 1 });

    const enumDef = irb.enumDef(
      "Status",
      "string",
      [
        irb.enumMember("Active", irb.stringLiteral("Active"), {
          doc: "Member documentation",
        }),
      ],
      {
        doc: "Enum documentation",
      },
    );
    enumDef.position = irb.position({ line: 20, column: 1 });

    const constantDef = irb.constantDef(
      "apiVersion",
      irb.stringLiteral("1.0.0"),
      {
        doc: "Constant documentation",
      },
    );
    constantDef.position = irb.position({ line: 30, column: 1 });

    const schema = irb.schema({
      docs: [
        {
          position: irb.position({ line: 1, column: 1 }),
          content: "Standalone documentation",
        },
      ],
      types: [typeDef],
      enums: [enumDef],
      constants: [constantDef],
    });

    expect(generateVdl(schema, { docstrings: "strip" })).toBe(
      dedent(`
      @entity
      type User {
        id string
      }

      enum Status {
        Active
      }

      const apiVersion = "1.0.0"
    `),
    );
  });

  it("strips only the first docstring when docstrings mode is set to strip-first", () => {
    const schema = irb.schema({
      docs: [
        {
          position: irb.position({ line: 1, column: 1 }),
          content: "Top-level documentation",
        },
      ],
      types: [
        irb.typeDef(
          "User",
          irb.objectType([
            irb.field("id", irb.primitiveType("string"), {
              doc: "Field documentation",
            }),
          ]),
          {
            doc: "Type documentation",
          },
        ),
      ],
    });

    expect(generateVdl(schema, { docstrings: "strip-first" })).toBe(
      dedent(`
      """
      Type documentation
      """
      type User {
        """
        Field documentation
        """
        id string
      }
    `),
    );
  });

  it("keeps only the first docstring when docstrings mode is set to keep-first", () => {
    const schema = irb.schema({
      docs: [
        {
          position: irb.position({ line: 1, column: 1 }),
          content: "Top-level documentation",
        },
      ],
      types: [
        irb.typeDef(
          "User",
          irb.objectType([
            irb.field("id", irb.primitiveType("string"), {
              doc: "Field documentation",
            }),
          ]),
          {
            doc: "Type documentation",
            annotations: [irb.annotation("entity")],
          },
        ),
      ],
    });

    expect(generateVdl(schema, { docstrings: "keep-first" })).toBe(
      dedent(`
      """
      Top-level documentation
      """

      @entity
      type User {
        id string
      }
    `),
    );
  });

  it("supports strip-first for individual nodes with attached docstrings", () => {
    const typeDef = irb.typeDef("User", irb.primitiveType("string"), {
      doc: "Type documentation",
    });
    const enumDef = irb.enumDef(
      "Status",
      "string",
      [irb.enumMember("Active", irb.stringLiteral("Active"))],
      {
        doc: "Enum documentation",
      },
    );
    const constantDef = irb.constantDef(
      "apiVersion",
      irb.stringLiteral("1.0.0"),
      {
        doc: "Constant documentation",
      },
    );

    expect(generateVdl(typeDef, { docstrings: "strip-first" })).toBe(
      "type User string",
    );
    expect(generateVdl(enumDef, { docstrings: "strip-first" })).toBe(
      dedent(`
      enum Status {
        Active
      }
    `),
    );
    expect(generateVdl(constantDef, { docstrings: "strip-first" })).toBe(
      'const apiVersion = "1.0.0"',
    );
  });

  it("supports keep-first for individual nodes with attached docstrings", () => {
    const typeDef = irb.typeDef("User", irb.primitiveType("string"), {
      doc: "Type documentation",
    });
    const enumDef = irb.enumDef(
      "Status",
      "string",
      [irb.enumMember("Active", irb.stringLiteral("Active"))],
      {
        doc: "Enum documentation",
      },
    );
    const constantDef = irb.constantDef(
      "apiVersion",
      irb.stringLiteral("1.0.0"),
      {
        doc: "Constant documentation",
      },
    );

    expect(generateVdl(typeDef, { docstrings: "keep-first" })).toBe(
      dedent(`
      """
      Type documentation
      """
      type User string
    `),
    );
    expect(generateVdl(enumDef, { docstrings: "keep-first" })).toBe(
      dedent(`
      """
      Enum documentation
      """
      enum Status {
        Active
      }
    `),
    );
    expect(generateVdl(constantDef, { docstrings: "keep-first" })).toBe(
      dedent(`
      """
      Constant documentation
      """
      const apiVersion = "1.0.0"
    `),
    );
  });

  it("treats attached type docstrings as part of first-docstring modes", () => {
    const enumMemberType = {
      position: {
        file: "/workspaces/vdl-plugin-explorer/ir_local.vdl",
        line: 475,
        column: 1,
      },
      name: "EnumMember",
      doc: "Enum member definition",
      annotations: [],
      typeRef: {
        kind: "object",
        objectFields: [
          {
            position: {
              file: "/workspaces/vdl-plugin-explorer/ir_local.vdl",
              line: 477,
              column: 3,
            },
            name: "position",
            doc: "Source position of this member",
            optional: false,
            annotations: [],
            typeRef: {
              kind: "type",
              typeName: "Position",
            },
          },
          {
            position: {
              file: "/workspaces/vdl-plugin-explorer/ir_local.vdl",
              line: 480,
              column: 3,
            },
            name: "name",
            doc: "Member name",
            optional: false,
            annotations: [],
            typeRef: {
              kind: "primitive",
              primitiveName: "string",
            },
          },
          {
            position: {
              file: "/workspaces/vdl-plugin-explorer/ir_local.vdl",
              line: 483,
              column: 3,
            },
            name: "value",
            doc: "Fully resolved member value",
            optional: false,
            annotations: [],
            typeRef: {
              kind: "type",
              typeName: "LiteralValue",
            },
          },
          {
            position: {
              file: "/workspaces/vdl-plugin-explorer/ir_local.vdl",
              line: 486,
              column: 3,
            },
            name: "doc",
            doc: "Optional member documentation",
            optional: true,
            annotations: [],
            typeRef: {
              kind: "primitive",
              primitiveName: "string",
            },
          },
          {
            position: {
              file: "/workspaces/vdl-plugin-explorer/ir_local.vdl",
              line: 489,
              column: 3,
            },
            name: "annotations",
            doc: "Member annotations in source order",
            optional: false,
            annotations: [],
            typeRef: {
              kind: "array",
              arrayType: {
                kind: "type",
                typeName: "Annotation",
              },
              arrayDims: 1,
            },
          },
        ],
      },
      id: "enum-member-cc5dd2ca",
      urlPath: "#/types/enum-member-cc5dd2ca",
    } as unknown as TypeDef;

    expect(generateVdl(enumMemberType, { docstrings: "strip-first" })).toBe(
      dedent(`
      type EnumMember {
        """
        Source position of this member
        """
        position Position

        """
        Member name
        """
        name string

        """
        Fully resolved member value
        """
        value LiteralValue

        """
        Optional member documentation
        """
        doc? string

        """
        Member annotations in source order
        """
        annotations Annotation[]
      }
    `),
    );

    expect(generateVdl(enumMemberType, { docstrings: "keep-first" })).toBe(
      dedent(`
      """
      Enum member definition
      """
      type EnumMember {
        position Position
        name string
        value LiteralValue
        doc? string
        annotations Annotation[]
      }
    `),
    );
  });
});
