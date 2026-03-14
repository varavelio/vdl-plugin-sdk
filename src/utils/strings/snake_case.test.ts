import { describe, expect, it } from "vitest";

import { snakeCase } from "./snake_case";

describe("snakeCase", () => {
  it.each([
    ["user profile name", "user_profile_name"],
    ["user_profile-name", "user_profile_name"],
    ["UserProfileName", "user_profile_name"],
    ["userProfileName", "user_profile_name"],
    ["HTTPServerURL", "http_server_url"],
    ["XMLHttpRequest", "xml_http_request"],
    ["GraphQLResolver", "graph_ql_resolver"],
    ["version2Value", "version2_value"],
    ["2024 release version", "2024_release_version"],
    ["api/v1\\users:list", "api_v1_users_list"],
  ])("converts %j to %j", (input, expected) => {
    expect(snakeCase(input)).toBe(expected);
  });

  it("collapses repeated separators and surrounding whitespace", () => {
    expect(snakeCase("  user__profile---name  ")).toBe("user_profile_name");
  });

  it("returns an empty string for empty or separator-only values", () => {
    expect(snakeCase("")).toBe("");
    expect(snakeCase("   ")).toBe("");
    expect(snakeCase("__---...__")).toBe("");
    expect(snakeCase("🚀---+++")).toBe("");
  });
});
