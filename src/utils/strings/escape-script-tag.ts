/**
 * Escapes sequences that could prematurely close an HTML <script> tag.
 * Use this when injecting JSON data or raw strings into embedded scripts.
 *
 * @param str - The string to escape.
 * @returns The escaped string safe for embedding in a script tag.
 */
export function escapeScriptTag(str: string): string {
  return str
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
