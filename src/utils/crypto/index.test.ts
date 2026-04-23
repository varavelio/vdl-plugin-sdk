import { describe, expect, it } from "vitest";
import { fingerprint, hash } from "./index";

describe("crypto", () => {
  it("keeps hash output deterministic", () => {
    expect(hash({ foo: "bar", baz: "qux" })).toBe(
      "9nMwOfcM8M06tjTZT0Uu68tWDaJQ_rmW6b9nZ1VRoAg",
    );
    expect(hash({ foo: "bar", nested: [1, 2, 3] })).toBe(
      "xQ6Bpf9NjDF4RYMq_fze2qhU7xCCP1vegvPcoUpwCvg",
    );
  });

  it("produces deterministic hexadecimal fingerprints", () => {
    expect(fingerprint({ foo: "bar", baz: "qux" })).toBe("20665513");
    expect(fingerprint({ foo: "bar", nested: [1, 2, 3] })).toBe("1c1b0e66");
  });

  it("changes the fingerprint when the input changes", () => {
    expect(fingerprint({ foo: "bar" })).not.toBe(fingerprint({ foo: "baz" }));
  });
});
