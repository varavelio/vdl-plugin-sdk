/**
 * Returns a string option or the provided fallback when the key is missing.
 *
 * Unlike the numeric and enum helpers, this function preserves the raw option
 * value exactly as provided, including empty strings.
 *
 * @param options - Plugin options record.
 * @param key - Option name to read.
 * @param defaultValue - Value returned when the option is missing.
 * @returns The raw option string, or the default when the key is missing.
 *
 * @example
 * ```ts
 * getOptionString({ prefix: "Api" }, "prefix", "Model");
 * // returns "Api"
 * ```
 */
export function getOptionString(
  options: Record<string, string> | undefined,
  key: string,
  defaultValue: string,
): string {
  const value = options?.[key];
  return value === undefined ? defaultValue : value;
}
