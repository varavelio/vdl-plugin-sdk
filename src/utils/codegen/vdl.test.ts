import { describe, expect, it } from "vitest";
import * as irb from "../../testing";
import { dedent } from "../strings/dedent";
import { generateVdl } from "./index";

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
      """Represents a user"""
      @entity
      @meta({
        owner "core"
        modes ["read" "write"]
      })
      type User {
        """Unique identifier"""
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
      """Lifecycle state"""
      @stable
      enum Status {
        Active

        """Used for soft deletion"""
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
      """Default runtime configuration"""
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
      """Schema overview"""

      enum Status {
        Active
      }

      type User string

      const apiVersion = "1.0.0"
    `),
    );
  });
});
