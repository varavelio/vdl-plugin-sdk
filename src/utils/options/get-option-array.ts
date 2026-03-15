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
 *
 * @param options - Plugin options record.
 * @param key - Option name to read.
 * @param defaultValue - Value returned when the option is missing.
 * @param separator - Delimiter used to split the raw string.
 * @returns A trimmed array of non-empty entries, an empty array for blank values, or the default when the key is missing.
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
