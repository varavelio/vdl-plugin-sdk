import { parse as tomlParse, stringify as tomlStringify } from "smol-toml";

/**
 * Parses a TOML document string into a JavaScript object.
 *
 * @see Powered by `smol-toml` (BSD-3-Clause): [https://github.com/squirrelchat/smol-toml](https://github.com/squirrelchat/smol-toml)
 */
export function parse<T = Record<string, unknown>>(text: string): T {
  return tomlParse(text) as T;
}

/**
 * Serializes a JavaScript object into a TOML document string.
 *
 * @see Powered by `smol-toml` (BSD-3-Clause): [https://github.com/squirrelchat/smol-toml](https://github.com/squirrelchat/smol-toml)
 */
export function stringify(value: Record<string, unknown>): string {
  return tomlStringify(value);
}
