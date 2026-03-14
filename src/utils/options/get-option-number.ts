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
