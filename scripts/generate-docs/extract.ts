import { readFile } from "node:fs/promises";
import { type Block, parse } from "comment-parser";

const JSDOC_BLOCK_RE = /\/\*\*[\s\S]*?\*\//g;
const EXPORT_RE =
  /export\s+(?:const|function|class|type|interface|enum)\s+([A-Za-z0-9_]+)/;
const DECLARATION_RE =
  /(?:const|function|class|type|interface|enum)\s+([A-Za-z0-9_]+)/;
const OBJECT_METHOD_RE = /^([A-Za-z0-9_]+)\s*\(/;

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
  for (const line of sourceAfterBlock.split("\n")) {
    const trimmedLine = line.trim();

    if (
      trimmedLine === "" ||
      trimmedLine === "{" ||
      trimmedLine === "}" ||
      trimmedLine === "},"
    ) {
      continue;
    }

    return trimmedLine;
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
