import { hash as ohashHash } from "ohash";

/**
 * Hashes any JavaScript value into a deterministic string.
 *
 * The value is serialized first and then hashed, which makes this helper useful
 * for cache keys, content fingerprints, and change detection inside plugins.
 *
 * WARNING: This helper is not intended for password hashing or other security-sensitive
 * cryptographic workflows.
 *
 * @param input - Any JavaScript value to hash (strings, numbers, objects, etc).
 * @returns A stable hash string for the provided input.
 *
 * @example
 * ```ts
 * hash({ foo: "bar", baz: "qux" });
 * // returns a deterministic hash string such as "9nMwOfcM8M06tjTZT0Uu68tWDaJQ_rmW6b9nZ1VRoAg"
 * ```
 *
 * @see Powered by `ohash` (MIT): [https://github.com/unjs/ohash](https://github.com/unjs/ohash)
 */
export function hash(input: unknown): string {
  return ohashHash(input);
}

/**
 * Generates a short, stable, and URL-friendly 8-character hexadecimal string from
 * any JavaScript value.
 *
 * This helper is ideal for creating "pretty" identifiers, such as asset filenames,
 * CSS class names, or unique URL slugs, where brevity and readability are prioritized
 * over cryptographic strength.
 *
 * Unlike the `hash` function, this returns a fixed-length string consisting
 * only of hexadecimal characters ([0-9a-f]).
 *
 * WARNING: This helper is not intended for password hashing or other security-sensitive
 * cryptographic workflows.
 *
 * @param input - Any JavaScript value to fingerprint (strings, numbers, objects, etc).
 * @returns A short 8-character hexadecimal string.
 *
 * @example
 * ```ts
 * fingerprint({ foo: "bar", baz: "qux" });
 * // returns a short deterministic string such as "20665513"
 * ```
 *
 */
export function fingerprint(input: unknown): string {
  const hashedInput = hash(input);
  let state = 0x811c9dc5;

  for (let index = 0; index < hashedInput.length; index += 1) {
    state ^= hashedInput.charCodeAt(index);
    state = Math.imul(state, 0x01000193);
  }

  const hex = (state >>> 0).toString(16);
  return `${"0".repeat(Math.max(0, 8 - hex.length))}${hex}`;
}
