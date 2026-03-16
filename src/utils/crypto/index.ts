import { hash as ohashHash } from "ohash";

/**
 * Hashes any JavaScript value into a deterministic string.
 *
 * The value is serialized first and then hashed, which makes this helper useful
 * for cache keys, content fingerprints, and change detection inside plugins.
 *
 * This helper is not intended for password hashing or other security-sensitive
 * cryptographic workflows.
 *
 * Powered by `ohash` (MIT): https://github.com/unjs/ohash
 *
 * @param input - Any JavaScript value to hash.
 * @returns A stable hash string for the provided input.
 *
 * @example
 * ```ts
 * hash({ foo: "bar" });
 * // returns a deterministic hash string such as "g82Nh7Lh3CUR..."
 * ```
 */
export function hash(input: unknown): string {
  return ohashHash(input);
}
