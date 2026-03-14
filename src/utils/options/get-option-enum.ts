/**
 * Returns a string option constrained to a known set of allowed values.
 *
 * Missing, blank, and unsupported values fall back to the provided default.
 */
export function getOptionEnum<const T extends string>(
  options: Record<string, string> | undefined,
  key: string,
  allowedValues: readonly T[],
  defaultValue: T,
): T {
  const value = options?.[key];

  if (value === undefined) {
    return defaultValue;
  }

  const trimmedValue = value.trim();

  if (trimmedValue === "") {
    return defaultValue;
  }

  return allowedValues.includes(trimmedValue as T)
    ? (trimmedValue as T)
    : defaultValue;
}
