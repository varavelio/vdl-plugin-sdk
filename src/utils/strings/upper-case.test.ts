import { describe, expect, it } from "vitest";

import { upperCase } from "./upper-case";

describe("upperCase", () => {
  it.each([
    ["user profile name", "USER PROFILE NAME"],
    ["user_profile-name", "USER PROFILE NAME"],
    ["UserProfileName", "USER PROFILE NAME"],
    ["userProfileName", "USER PROFILE NAME"],
    ["HTTPServerURL", "HTTP SERVER URL"],
    ["XMLHttpRequest", "XML HTTP REQUEST"],
    ["GraphQLResolver", "GRAPH QL RESOLVER"],
    ["version2Value", "VERSION2 VALUE"],
    ["2024 release version", "2024 RELEASE VERSION"],
    ["api/v1\\users:list", "API V1 USERS LIST"],
  ])("converts %j to %j", (input, expected) => {
    expect(upperCase(input)).toBe(expected);
  });

  it("collapses repeated separators and surrounding whitespace", () => {
    expect(upperCase("  user__profile---name  ")).toBe("USER PROFILE NAME");
  });

  it("returns an empty string for empty or separator-only values", () => {
    expect(upperCase("")).toBe("");
    expect(upperCase("   ")).toBe("");
    expect(upperCase("__---...__")).toBe("");
    expect(upperCase("🚀---+++")).toBe("");
  });
});
