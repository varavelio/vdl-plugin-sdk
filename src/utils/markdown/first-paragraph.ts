/**
 * Returns the first paragraph-like content line from a Markdown document.
 *
 * This helper is useful for generating short descriptions, summaries, preview
 * snippets, or metadata fields from longer Markdown content without parsing the
 * full document structure.
 *
 * Blank lines are ignored, heading lines are skipped, and the first remaining
 * content line is returned in trimmed form. If the document does not contain
 * paragraph content, the function returns `undefined`.
 *
 * @param content - Markdown document content to inspect.
 * @returns The first non-heading content line, or `undefined` when absent.
 *
 * @example
 * ```ts
 * firstParagraph("# Changelog\n\nAdds new RPC helpers.");
 * // "Adds new RPC helpers."
 * ```
 */
export function firstParagraph(content: string): string | undefined {
  return content
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0 && !line.startsWith("#"));
}
