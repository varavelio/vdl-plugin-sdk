import { kebabCase } from "./kebab-case";

/**
 * Converts text into a stricter kebab-style slug.
 *
 * This helper is intended for identifiers that must be more conservative than
 * regular `kebabCase`, such as URL slugs, file-safe names, anchors, and stable
 * external keys.
 *
 * Diacritics are flattened to their ASCII counterparts, unsupported characters
 * are removed, and any surrounding hyphens are discarded from the final value.
 * Empty or symbol-only inputs return an empty string.
 *
 * @param str - Text to normalize into slug form.
 * @returns A lowercase slug containing only ASCII letters, digits, and hyphens.
 *
 * @example
 * ```ts
 * slugify("Canción Número 1");
 * // "cancion-numero-1"
 * ```
 */
export function slugify(str: string): string {
  return kebabCase(str.normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
    .replace(/[^a-z0-9-]/g, "")
    .replace(/^-+|-+$/g, "");
}
