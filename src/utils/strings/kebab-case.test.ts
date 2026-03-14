import { describe, expect, it } from "vitest";

import { kebabCase } from "./kebab-case";

describe("kebabCase", () => {
  it.each([
    ["user profile name", "user-profile-name"],
    ["user_profile-name", "user-profile-name"],
    ["UserProfileName", "user-profile-name"],
    ["userProfileName", "user-profile-name"],
    ["HTTPServerURL", "http-server-url"],
    ["XMLHttpRequest", "xml-http-request"],
    ["GraphQLResolver", "graph-ql-resolver"],
    ["version2Value", "version2-value"],
    ["2024 release version", "2024-release-version"],
    ["api/v1\\users:list", "api-v1-users-list"],
  ])("converts %j to %j", (input, expected) => {
    expect(kebabCase(input)).toBe(expected);
  });

  it("collapses repeated separators and surrounding whitespace", () => {
    expect(kebabCase("  user__profile---name  ")).toBe("user-profile-name");
  });

  it("returns an empty string for empty or separator-only values", () => {
    expect(kebabCase("")).toBe("");
    expect(kebabCase("   ")).toBe("");
    expect(kebabCase("__---...__")).toBe("");
    expect(kebabCase("🚀---+++")).toBe("");
  });
});
