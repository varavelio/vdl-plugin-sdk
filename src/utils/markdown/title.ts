/**
 * Extracts the first Markdown heading from a document.
 *
 * This helper is intended for lightweight metadata discovery when a full
 * Markdown parser would be unnecessary. It returns the text content of the
 * first heading-like line found in the document and provides a stable fallback
 * when no heading is present.
 *
 * The function is well suited for generators that need a document title for
 * filenames, navigation labels, page metadata, or content indexes.
 *
 * @param content - Markdown document content to inspect.
 * @returns The first heading text, or `"Untitled"` when no heading is found.
 *
 * @example
 * ```ts
 * title("# API Reference\n\nGenerated docs");
 * // "API Reference"
 * ```
 *
 * @example
 * ```ts
 * title("No heading here");
 * // "Untitled"
 * ```
 */
export function title(content: string): string {
  const title = content.match(/^#+\s+(.*)$/m)?.[1];
  return title ? title.trim() : "Untitled";
}
