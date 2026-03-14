import { describe, expect, it } from "vitest";

import { camelCase } from "./camel-case";

describe("camelCase", () => {
  it.each([
    ["user profile name", "userProfileName"],
    ["user_profile-name", "userProfileName"],
    ["UserProfileName", "userProfileName"],
    ["userProfileName", "userProfileName"],
    ["HTTPServerURL", "httpServerUrl"],
    ["XMLHttpRequest", "xmlHttpRequest"],
    ["GraphQLResolver", "graphQlResolver"],
    ["version2Value", "version2Value"],
    ["2024 release version", "2024ReleaseVersion"],
    ["api/v1\\users:list", "apiV1UsersList"],
  ])("converts %j to %j", (input, expected) => {
    expect(camelCase(input)).toBe(expected);
  });

  it("collapses repeated separators and surrounding whitespace", () => {
    expect(camelCase("  user__profile---name  ")).toBe("userProfileName");
  });

  it("returns an empty string for empty or separator-only values", () => {
    expect(camelCase("")).toBe("");
    expect(camelCase("   ")).toBe("");
    expect(camelCase("__---...__")).toBe("");
    expect(camelCase("🚀---+++")).toBe("");
  });
});
