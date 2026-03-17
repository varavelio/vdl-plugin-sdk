import path from "node:path";
import type { Block, Spec } from "comment-parser";
import type { JsDocEntry } from "./extract.ts";

export type MarkdownSection = {
  entries: JsDocEntry[];
  title?: string;
};

export type MarkdownRenderOptions = {
  sourceBaseUrl?: string;
  workspaceRootPath?: string;
};

function toHeading(level: number, title: string): string {
  return `${"#".repeat(level)} ${title}`;
}

function trimEmptyLines(lines: string[]): string[] {
  let start = 0;
  let end = lines.length;

  while (start < end && lines[start]?.trim() === "") {
    start += 1;
  }

  while (end > start && lines[end - 1]?.trim() === "") {
    end -= 1;
  }

  return lines.slice(start, end);
}

function renderTextLines(lines: string[]): string {
  const trimmedLines = trimEmptyLines(lines);

  if (trimmedLines.length === 0) {
    return "";
  }

  const renderedLines: string[] = [];
  let currentParagraph: string[] = [];
  let insideCodeFence = false;

  function flushParagraph() {
    if (currentParagraph.length === 0) {
      return;
    }

    renderedLines.push(currentParagraph.join(" "));
    currentParagraph = [];
  }

  for (const line of trimmedLines) {
    const trimmedLine = line.trimEnd();
    const normalizedLine = trimmedLine.trim();

    if (normalizedLine.startsWith("```")) {
      flushParagraph();
      renderedLines.push(normalizedLine);
      insideCodeFence = !insideCodeFence;
      continue;
    }

    if (insideCodeFence) {
      renderedLines.push(trimmedLine);
      continue;
    }

    if (normalizedLine === "") {
      flushParagraph();

      if (renderedLines[renderedLines.length - 1] !== "") {
        renderedLines.push("");
      }

      continue;
    }

    if (/^[-*]\s+/.test(normalizedLine) || /^\d+\.\s+/.test(normalizedLine)) {
      flushParagraph();
      renderedLines.push(normalizedLine);
      continue;
    }

    currentParagraph.push(normalizedLine);
  }

  flushParagraph();

  return trimEmptyLines(renderedLines).join("\n");
}

function stripCommentPrefix(line: string): string {
  if (line.trim() === "/**" || line.trim() === "*/") {
    return "";
  }

  return line.replace(/^\s*\*( ?)?/, "");
}

/**
 * Extracts the description part of a parsed JSDoc block and formats it as
 * simple Markdown paragraphs and lists.
 */
export function getBlockDescription(block: Block): string {
  if (block.description.trim()) {
    return renderTextLines(block.description.split("\n"));
  }

  const descriptionLines: string[] = [];

  for (const line of block.source.slice(1, -1)) {
    if (line.tokens.tag) {
      break;
    }

    descriptionLines.push(stripCommentPrefix(line.source));
  }

  return renderTextLines(descriptionLines);
}

function extractTagBodyLines(tag: Spec): string[] {
  const tagName = tag.tag.replace(/^@/, "");
  const rawLines = tag.source.map((line) => stripCommentPrefix(line.source));

  if (rawLines.length === 0) {
    return [];
  }

  const firstLine =
    rawLines[0]?.replace(new RegExp(`^@?${tagName}\\s*`), "") ?? "";
  return trimEmptyLines([firstLine, ...rawLines.slice(1)]);
}

function renderParamTag(tag: Spec): string {
  const description = tag.description.replace(/^[-:]\s*/, "").trim();
  const typeLabel = tag.type ? ` (${tag.type})` : "";

  return description
    ? `- \`${tag.name}\`${typeLabel}: ${description}`
    : `- \`${tag.name}\`${typeLabel}`;
}

function renderExampleTag(tag: Spec): string {
  const bodyLines = extractTagBodyLines(tag);

  if (bodyLines.length === 0) {
    return "";
  }

  if (bodyLines[0]?.startsWith("```")) {
    return bodyLines.join("\n");
  }

  return ["```ts", ...bodyLines, "```"].join("\n");
}

function renderGenericTag(tag: Spec): string {
  return renderTextLines(extractTagBodyLines(tag));
}

function renderQuotedText(text: string): string {
  return text
    .split("\n")
    .map((line) => (line.trim() === "" ? ">" : `> ${line}`))
    .join("\n");
}

function appendSection(sections: string[], content: string) {
  if (!content.trim()) {
    return;
  }

  if (sections.length > 0) {
    sections.push("");
  }

  sections.push(content);
}

function getSourceLink(
  entry: JsDocEntry,
  options: MarkdownRenderOptions,
): string {
  if (!options.sourceBaseUrl || !options.workspaceRootPath) {
    return "";
  }

  const relativeFilePath = path
    .relative(options.workspaceRootPath, entry.filePath)
    .split(path.sep)
    .join("/");
  const lineSuffix = entry.lineNumber > 0 ? `#L${entry.lineNumber}` : "";

  return `> Source: [${relativeFilePath}:${entry.lineNumber}](${options.sourceBaseUrl}/${relativeFilePath}${lineSuffix})`;
}

function renderTag(tag: Spec): string {
  const tagName = tag.tag.replace(/^@/, "");

  if (tagName === "param") {
    return ["**Parameter**", renderParamTag(tag)].join("\n");
  }

  if (tagName === "returns" || tagName === "return") {
    return ["**Returns**", renderGenericTag(tag)].join("\n");
  }

  if (tagName === "example") {
    return ["**Example**", renderExampleTag(tag)].join("\n");
  }

  if (tagName === "see") {
    return renderQuotedText(renderGenericTag(tag));
  }

  return [
    `**${tagName.charAt(0).toUpperCase()}${tagName.slice(1)}**`,
    renderGenericTag(tag),
  ].join("\n");
}

function renderEntryBody(
  entry: JsDocEntry,
  options: MarkdownRenderOptions,
): string {
  const sections: string[] = [];
  const description = getBlockDescription(entry.block);

  appendSection(sections, description);

  for (const tag of entry.block.tags) {
    const renderedTag = renderTag(tag);

    appendSection(sections, renderedTag);
  }

  appendSection(sections, getSourceLink(entry, options));

  return sections.join("\n");
}

function renderEntry(
  entry: JsDocEntry,
  headingLevel: number,
  options: MarkdownRenderOptions,
): string {
  return [
    toHeading(headingLevel, entry.title),
    "",
    renderEntryBody(entry, options),
  ].join("\n");
}

/**
 * Renders a single parsed JSDoc entry as a standalone Markdown page.
 */
export function renderMarkdownEntryPage(
  entry: JsDocEntry,
  options: MarkdownRenderOptions = {},
): string {
  return [
    toHeading(1, entry.title),
    "",
    renderEntryBody(entry, options),
    "",
  ].join("\n");
}

/**
 * Renders parsed JSDoc entries into a simple Markdown page while keeping the
 * original entry order from the source files.
 */
export function renderMarkdownPage(
  pageTitle: string,
  sections: MarkdownSection[],
  options: MarkdownRenderOptions = {},
): string {
  const parts = [toHeading(1, pageTitle)];
  const multiSection =
    sections.filter((section) => section.entries.length > 0).length > 1;

  for (const section of sections) {
    if (section.entries.length === 0) {
      continue;
    }

    if (section.title) {
      parts.push("", toHeading(2, section.title));
    }

    const entryHeadingLevel = multiSection || section.title ? 3 : 2;

    for (const entry of section.entries) {
      parts.push("", renderEntry(entry, entryHeadingLevel, options));
    }
  }

  if (parts.length === 1) {
    parts.push("", "No JSDoc entries found.");
  }

  parts.push("");
  return parts.join("\n");
}
