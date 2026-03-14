import { describe, expect, it } from "vitest";

import { pascalCase } from "./pascal-case";

describe("pascalCase", () => {
  it.each([
    ["user profile name", "UserProfileName"],
    ["user_profile-name", "UserProfileName"],
    ["UserProfileName", "UserProfileName"],
    ["userProfileName", "UserProfileName"],
    ["HTTPServerURL", "HttpServerUrl"],
    ["XMLHttpRequest", "XmlHttpRequest"],
    ["GraphQLResolver", "GraphQlResolver"],
    ["version2Value", "Version2Value"],
    ["2024 release version", "2024ReleaseVersion"],
    ["api/v1\\users:list", "ApiV1UsersList"],
  ])("converts %j to %j", (input, expected) => {
    expect(pascalCase(input)).toBe(expected);
  });

  it("collapses repeated separators and surrounding whitespace", () => {
    expect(pascalCase("  user__profile---name  ")).toBe("UserProfileName");
  });

  it("returns an empty string for empty or separator-only values", () => {
    expect(pascalCase("")).toBe("");
    expect(pascalCase("   ")).toBe("");
    expect(pascalCase("__---...__")).toBe("");
    expect(pascalCase("🚀---+++")).toBe("");
  });
});
