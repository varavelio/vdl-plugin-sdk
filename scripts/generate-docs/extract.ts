import { readFile } from "node:fs/promises";
import { type Block, parse } from "comment-parser";

const JSDOC_BLOCK_RE = /\/\*\*[\s\S]*?\*\//g;
const EXPORT_RE =
  /export\s+(?:(?:default|async|abstract)\s+)*(?:const|let|var|function|class|type|interface|enum)\s+([A-Za-z_$][\w$]*)/;
const EXPORT_NAMED_RE =
  /export\s*\{\s*([A-Za-z_$][\w$]*)\s*(?:,|\s+as\s+[A-Za-z_$][\w$]*\s*|\})/;
const DECLARATION_RE =
  /(?:(?:async|abstract)\s+)*(?:const|let|var|function|class|type|interface|enum)\s+([A-Za-z_$][\w$]*)/;
const OBJECT_METHOD_RE = /^([A-Za-z_$][\w$]*)\s*\(/;
const MAX_LOOKAHEAD_CHARACTERS = 500;
const MAX_LOOKAHEAD_RELEVANT_LINES = 8;

export type JsDocEntry = {
  block: Block;
  filePath: string;
  title: string;
};

export type ExtractTypeScriptJsDocsOptions = {
  includeUnexportedDeclarations?: boolean;
};

type JsDocMatch = {
  comment: string;
  end: number;
};

function collectJsDocMatches(fileContents: string): JsDocMatch[] {
  const matches: JsDocMatch[] = [];

  for (const match of fileContents.matchAll(JSDOC_BLOCK_RE)) {
    if (match.index === undefined) {
      continue;
    }

    matches.push({
      comment: match[0],
      end: match.index + match[0].length,
    });
  }

  return matches;
}

function getNextRelevantLine(sourceAfterBlock: string): string | null {
  const lookahead = sourceAfterBlock.slice(0, MAX_LOOKAHEAD_CHARACTERS);
  let insideBlockComment = false;
  let relevantLineCount = 0;
  let pendingLine = "";

  for (const rawLine of lookahead.split("\n")) {
    const trimmedLine = rawLine.trim();

    if (insideBlockComment) {
      if (trimmedLine.includes("*/")) {
        insideBlockComment = false;
      }

      continue;
    }

    if (trimmedLine.startsWith("/*")) {
      if (!trimmedLine.includes("*/")) {
        insideBlockComment = true;
      }

      continue;
    }

    if (
      trimmedLine === "" ||
      trimmedLine === "{" ||
      trimmedLine === "}" ||
      trimmedLine === "}," ||
      trimmedLine.startsWith("//") ||
      trimmedLine.startsWith("@")
    ) {
      continue;
    }

    relevantLineCount += 1;
    pendingLine = pendingLine ? `${pendingLine} ${trimmedLine}` : trimmedLine;

    if (
      /^(?:export(?:\s+(?:default|async|abstract))*)$/.test(pendingLine) &&
      relevantLineCount < MAX_LOOKAHEAD_RELEVANT_LINES
    ) {
      continue;
    }

    return pendingLine;
  }

  return null;
}

function inferEntryTitle(
  sourceAfterBlock: string,
  options: ExtractTypeScriptJsDocsOptions,
): string | null {
  const nextLine = getNextRelevantLine(sourceAfterBlock);

  if (!nextLine) {
    return null;
  }

  const exportMatch = nextLine.match(EXPORT_RE);

  if (exportMatch) {
    return exportMatch[1];
  }

  const exportNamedMatch = nextLine.match(EXPORT_NAMED_RE);

  if (exportNamedMatch) {
    return exportNamedMatch[1];
  }

  if (!options.includeUnexportedDeclarations) {
    return null;
  }

  const declarationMatch = nextLine.match(DECLARATION_RE);

  if (declarationMatch) {
    return declarationMatch[1];
  }

  const objectMethodMatch = nextLine.match(OBJECT_METHOD_RE);

  if (objectMethodMatch) {
    return objectMethodMatch[1];
  }

  return null;
}

/**
 * Extracts JSDoc blocks from a TypeScript file with a regex, parses each block
 * with comment-parser, and keeps only the blocks that are directly followed by
 * an exported declaration.
 */
export async function extractTypeScriptJsDocs(
  filePath: string,
  options: ExtractTypeScriptJsDocsOptions = {},
): Promise<JsDocEntry[]> {
  const fileContents = await readFile(filePath, "utf8");
  const matches = collectJsDocMatches(fileContents);

  return matches.flatMap((match) => {
    const title = inferEntryTitle(fileContents.slice(match.end), options);

    if (!title) {
      return [];
    }

    const block = parse(match.comment)[0];

    if (!block) {
      return [];
    }

    return [
      {
        block,
        filePath,
        title,
      },
    ];
  });
}
