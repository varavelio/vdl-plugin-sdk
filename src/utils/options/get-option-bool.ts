/**
 * Returns a boolean option using common truthy and falsy string values.
 *
 * Accepted truthy values: `true`, `1`, `yes`, `on`, `enable`, `enabled`, `y`.
 *
 * Accepted falsy values: `false`, `0`, `no`, `off`, `disable`, `disabled`, `n`.
 *
 * Invalid values fall back to the provided default.
 *
 * @param options - Plugin options record.
 * @param key - Option name to read.
 * @param defaultValue - Value returned when the option is missing or invalid.
 * @returns The parsed boolean value, or the default when parsing fails.
 *
 * @example
 * ```ts
 * getOptionBool({ watch: "yes" }, "watch", false);
 * // returns true
 * ```
 */
export function getOptionBool(
  options: Record<string, string> | undefined,
  key: string,
  defaultValue: boolean,
): boolean {
  const value = options?.[key];

  if (value === undefined) {
    return defaultValue;
  }

  switch (value.trim().toLowerCase()) {
    case "true":
    case "1":
    case "yes":
    case "on":
    case "enable":
    case "enabled":
    case "y":
      return true;
    case "false":
    case "0":
    case "no":
    case "off":
    case "disable":
    case "disabled":
    case "n":
      return false;
    default:
      return defaultValue;
  }
}
