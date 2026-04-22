/**
 * Wraps source text in a fenced Markdown code block.
 *
 * This helper is intended for generators that emit documentation examples,
 * snippets, or inline reference material and need a reliable way to format code
 * as Markdown without repeating string templates throughout the codebase.
 *
 * When a language is provided, it becomes the fence info string so downstream
 * renderers can apply syntax highlighting. Backticks inside the code content are
 * escaped so generated blocks remain safe to embed inside surrounding Markdown.
 *
 * @param code - Code or text content to place inside the fenced block.
 * @param lang - Optional language identifier for syntax highlighting.
 * @returns A complete fenced Markdown code block.
 *
 * @example
 * ```ts
 * wrapCode("const answer = 42;", "ts");
 * // "```ts\nconst answer = 42;\n```"
 * ```
 */
export function wrapCode(code: string, lang = ""): string {
  return `\`\`\`${lang}\n${code.replace(/`/g, "\\`")}\n\`\`\``;
}
