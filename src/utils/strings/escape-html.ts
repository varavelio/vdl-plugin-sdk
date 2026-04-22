/**
 * Converts special characters into safe HTML entities.
 * Prevents basic XSS when rendering user-provided text in the DOM.
 *
 * @param str - The string to escape.
 * @returns The escaped string safe for HTML rendering.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
