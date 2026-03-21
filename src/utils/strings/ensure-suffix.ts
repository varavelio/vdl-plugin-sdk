/**
 * Ensures that a string ends with a specific suffix.
 *
 * If the string already ends with the suffix, it is returned as is.
 * Otherwise, the suffix is appended to the string.
 *
 * @param str - The string to check.
 * @param suffix - The suffix to ensure.
 * @returns The string with the suffix ensured.
 *
 * @example
 * ```ts
 * ensureSuffix('User', 'Error')
 * // "UserError"
 *
 * ensureSuffix('UserError', 'Error')
 * // "UserError"
 * ```
 */
export function ensureSuffix(str: string, suffix: string): string {
  if (str.endsWith(suffix)) {
    return str;
  }
  return str + suffix;
}
