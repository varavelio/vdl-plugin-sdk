import { describe, expect, it } from "vitest";

import { lowerCase } from "./lower-case";

describe("lowerCase", () => {
  it.each([
    ["user profile name", "user profile name"],
    ["user_profile-name", "user profile name"],
    ["UserProfileName", "user profile name"],
    ["userProfileName", "user profile name"],
    ["HTTPServerURL", "http server url"],
    ["XMLHttpRequest", "xml http request"],
    ["GraphQLResolver", "graph ql resolver"],
    ["version2Value", "version2 value"],
    ["2024 release version", "2024 release version"],
    ["api/v1\\users:list", "api v1 users list"],
  ])("converts %j to %j", (input, expected) => {
    expect(lowerCase(input)).toBe(expected);
  });

  it("collapses repeated separators and surrounding whitespace", () => {
    expect(lowerCase("  user__profile---name  ")).toBe("user profile name");
  });

  it("returns an empty string for empty or separator-only values", () => {
    expect(lowerCase("")).toBe("");
    expect(lowerCase("   ")).toBe("");
    expect(lowerCase("__---...__")).toBe("");
    expect(lowerCase("🚀---+++")).toBe("");
  });
});
