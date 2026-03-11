/**
 * Returns a string option or the provided fallback when the key is missing.
 */
export function getOptionString(
  options: Record<string, string> | undefined,
  key: string,
  defaultValue: string,
): string {
  const value = options?.[key];
  return value === undefined ? defaultValue : value;
}

/**
 * Returns a boolean option using common truthy and falsy string values.
 *
 * Accepted truthy values: `true`, `1`, `yes`, `on`, `enabled`, `y`.
 *
 * Accepted falsy values: `false`, `0`, `no`, `off`, `disabled`, `n`.
 *
 * Invalid values fall back to the provided default.
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
    case "enabled":
    case "y":
      return true;
    case "false":
    case "0":
    case "no":
    case "off":
    case "disabled":
    case "n":
      return false;
    default:
      return defaultValue;
  }
}

/**
 * Returns a numeric option or the provided fallback when parsing fails.
 *
 * Empty, invalid, and non-finite values fall back to the default.
 */
export function getOptionNumber(
  options: Record<string, string> | undefined,
  key: string,
  defaultValue: number,
): number {
  const value = options?.[key];

  if (value === undefined) {
    return defaultValue;
  }

  const trimmedValue = value.trim();

  if (trimmedValue === "") {
    return defaultValue;
  }

  const parsedValue = Number(trimmedValue);
  return Number.isFinite(parsedValue) ? parsedValue : defaultValue;
}

/**
 * Returns a string array option from a separator-delimited value.
 *
 * Empty items are removed and each entry is trimmed.
 *
 * Missing values return the provided default.
 *
 * @example
 * // For options: { "features": "feature1, feature2, feature3" }
 * getOptionArray(options, "features", [], ",")
 * // returns ["feature1", "feature2", "feature3"]
 */
export function getOptionArray(
  options: Record<string, string> | undefined,
  key: string,
  defaultValue: string[] = [],
  separator = ",",
): string[] {
  const value = options?.[key];

  if (value === undefined) {
    return defaultValue;
  }

  const trimmedValue = value.trim();

  if (trimmedValue === "") {
    return [];
  }

  return trimmedValue
    .split(separator)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}
