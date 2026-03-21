/**
 * Ensures that a string starts with a specific prefix.
 *
 * If the string already starts with the prefix, it is returned as is.
 * Otherwise, the prefix is prepended to the string.
 *
 * @param str - The string to check.
 * @param prefix - The prefix to ensure.
 * @returns The string with the prefix ensured.
 *
 * @example
 * ```ts
 * ensurePrefix('User', 'I')
 * // "IUser"
 *
 * ensurePrefix('IUser', 'I')
 * // "IUser"
 * ```
 */
export function ensurePrefix(str: string, prefix: string): string {
  if (str.startsWith(prefix)) {
    return str;
  }
  return prefix + str;
}
