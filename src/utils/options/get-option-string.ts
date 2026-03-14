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
