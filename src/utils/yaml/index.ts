import { parse as yamlParse, stringify as yamlStringify } from "yaml";

/**
 * Parses a YAML document string into a JavaScript value.
 *
 * @see Powered by `yaml` (ISC): [https://github.com/eemeli/yaml](https://github.com/eemeli/yaml)
 */
export function parse<T = unknown>(text: string): T {
  return yamlParse(text) as T;
}

/**
 * Serializes a JavaScript value into a YAML document string.
 *
 * @see Powered by `yaml` (ISC): [https://github.com/eemeli/yaml](https://github.com/eemeli/yaml)
 */
export function stringify(value: unknown): string {
  return yamlStringify(value);
}
