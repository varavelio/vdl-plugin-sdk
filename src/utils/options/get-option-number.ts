/**
 * Returns a numeric option or the provided fallback when parsing fails.
 *
 * Empty, invalid, and non-finite values fall back to the default.
 *
 * @param options - Plugin options record.
 * @param key - Option name to read.
 * @param defaultValue - Value returned when the option is missing or invalid.
 * @returns The parsed finite number, or the default when parsing fails.
 *
 * @example
 * ```ts
 * getOptionNumber({ retries: "3" }, "retries", 0);
 * // returns 3
 * ```
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
