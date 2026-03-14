import { describe, expect, it } from "vitest";

import { words } from "./words";

describe("words", () => {
  it("returns a single token for a plain lowercase word", () => {
    expect(words("user")).toEqual(["user"]);
  });

  it("returns a single token for a plain uppercase word", () => {
    expect(words("USER")).toEqual(["USER"]);
  });

  it("splits camelCase words", () => {
    expect(words("userProfileName")).toEqual(["user", "Profile", "Name"]);
  });

  it("splits PascalCase words", () => {
    expect(words("UserProfileName")).toEqual(["User", "Profile", "Name"]);
  });

  it("splits a single camelCase boundary", () => {
    expect(words("userProfile")).toEqual(["user", "Profile"]);
  });

  it("splits a single PascalCase boundary", () => {
    expect(words("UserProfile")).toEqual(["User", "Profile"]);
  });

  it("splits acronym-to-word boundaries", () => {
    expect(words("HTTPServerURL")).toEqual(["HTTP", "Server", "URL"]);
  });

  it("keeps consecutive acronym segments intact until a capitalized word starts", () => {
    expect(words("XMLHttpRequest")).toEqual(["XML", "Http", "Request"]);
  });

  it("handles a trailing acronym after regular words", () => {
    expect(words("parseHTTPURL")).toEqual(["parse", "HTTPURL"]);
  });

  it("handles alternating acronym and standard word segments", () => {
    expect(words("JSONDataAPIResponse")).toEqual([
      "JSON",
      "Data",
      "API",
      "Response",
    ]);
  });

  it("splits after digits before uppercase letters", () => {
    expect(words("version2Value")).toEqual(["version2", "Value"]);
  });

  it("keeps digits attached to lowercase prefixes when no uppercase boundary follows", () => {
    expect(words("version2024")).toEqual(["version2024"]);
  });

  it("keeps digits attached to the following lowercase word when separated only by lowercase text", () => {
    expect(words("mp3player")).toEqual(["mp3player"]);
  });

  it("splits mixed alphanumeric camelCase inputs repeatedly", () => {
    expect(words("v2EndpointID3Value")).toEqual([
      "v2",
      "Endpoint",
      "ID3",
      "Value",
    ]);
  });

  it("normalizes common non-alphanumeric separators", () => {
    expect(words("user_profile-name.test")).toEqual([
      "user",
      "profile",
      "name",
      "test",
    ]);
  });

  it("normalizes slashes, backslashes, and punctuation as separators", () => {
    expect(words("api/v1\\users:list")).toEqual(["api", "v1", "users", "list"]);
  });

  it("normalizes tabs and newlines as separators", () => {
    expect(words("user\tprofile\nname")).toEqual(["user", "profile", "name"]);
  });

  it("treats emoji and symbols as separators", () => {
    expect(words("user🚀profile+name")).toEqual(["user", "profile", "name"]);
  });

  it("collapses repeated separators and trims surrounding whitespace", () => {
    expect(words("  user__profile---name  ")).toEqual([
      "user",
      "profile",
      "name",
    ]);
  });

  it("collapses separators around camelCase boundaries", () => {
    expect(words("__userProfile--name__")).toEqual(["user", "Profile", "name"]);
  });

  it("preserves existing capitalization inside resulting tokens", () => {
    expect(words("GraphQLResolver")).toEqual(["Graph", "QL", "Resolver"]);
  });

  it("returns an empty array for empty or separator-only values", () => {
    expect(words("")).toEqual([]);
    expect(words("   ")).toEqual([]);
    expect(words("__---...__")).toEqual([]);
    expect(words("🚀---+++")).toEqual([]);
  });

  it("handles single-character inputs", () => {
    expect(words("a")).toEqual(["a"]);
    expect(words("A")).toEqual(["A"]);
    expect(words("1")).toEqual(["1"]);
  });

  it("keeps standalone numeric tokens", () => {
    expect(words("2024 release 10")).toEqual(["2024", "release", "10"]);
  });
});
