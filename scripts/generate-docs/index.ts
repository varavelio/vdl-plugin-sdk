import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  type ExtractTypeScriptJsDocsOptions,
  extractTypeScriptJsDocs,
  type JsDocEntry,
} from "./extract.ts";
import {
  getBlockDescription,
  type MarkdownSection,
  renderMarkdownEntryPage,
  renderMarkdownPage,
} from "./markdown.ts";

const currentFilePath = fileURLToPath(import.meta.url);
const generateDocsDirectoryPath = path.dirname(currentFilePath);
const scriptsDirectoryPath = path.resolve(generateDocsDirectoryPath, "..");
const workspaceRootPath = path.resolve(scriptsDirectoryPath, "..");
const docsApiDirectoryPath = path.join(workspaceRootPath, "docs", "api");
const docsAssetsDirectoryPath = path.join(workspaceRootPath, "docs", "assets");
const llmsDirectoryPath = path.join(docsAssetsDirectoryPath, "llms");
const llmsApiDirectoryPath = path.join(llmsDirectoryPath, "api");
const llmsIndexPath = path.join(docsAssetsDirectoryPath, "llms.txt");
const llmsFullIndexPath = path.join(docsAssetsDirectoryPath, "llms-full.txt");
const llmsBaseUrl = "https://vdl-plugin-sdk.varavel.com/llms";
const utilsSourceRootPath = path.join(workspaceRootPath, "src", "utils");
const utilsDirectoryNames = [
  "ir",
  "options",
  "strings",
  "arrays",
  "functions",
  "maps",
  "math",
  "objects",
  "sets",
  "paths",
  "crypto",
  "predicates",
  "misc",
] as const;
const coreSectionConfigs = [
  {
    title: "Core function",
    filePaths: [path.join(workspaceRootPath, "src", "define-plugin.ts")],
  },
  {
    title: "Core types",
    filePaths: [path.join(workspaceRootPath, "src", "types", "types.ts")],
  },
] as const;
const testingSectionConfigs = [
  {
    extractOptions: {
      includeUnexportedDeclarations: true,
    },
    filePaths: [
      path.join(workspaceRootPath, "src", "testing", "ir-builders.ts"),
    ],
  },
] as const;

type SectionConfig = {
  extractOptions?: ExtractTypeScriptJsDocsOptions;
  filePaths: readonly string[];
  title?: string;
};

type UtilityCategoryName = (typeof utilsDirectoryNames)[number];

type UtilityCategory = {
  directoryName: UtilityCategoryName;
  entries: JsDocEntry[];
  pageTitle: string;
};

function titleCase(value: string): string {
  if (value === "ir") {
    return "IR";
  }

  return value
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function listTypeScriptFiles(directoryPath: string): Promise<string[]> {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const nestedFilePaths = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directoryPath, entry.name);

      if (entry.isDirectory()) {
        return listTypeScriptFiles(entryPath);
      }

      return entry.name.endsWith(".ts") ? [entryPath] : [];
    }),
  );

  return nestedFilePaths.flat().sort();
}

async function collectEntriesFromFilePaths(
  filePaths: readonly string[],
  extractOptions: ExtractTypeScriptJsDocsOptions = {},
): Promise<JsDocEntry[]> {
  const nestedEntries = await Promise.all(
    filePaths.map((filePath) =>
      extractTypeScriptJsDocs(filePath, extractOptions),
    ),
  );

  return nestedEntries.flat();
}

async function collectSections(
  sectionConfigs: readonly SectionConfig[],
): Promise<MarkdownSection[]> {
  return Promise.all(
    sectionConfigs.map(async (sectionConfig) => ({
      entries: await collectEntriesFromFilePaths(
        sectionConfig.filePaths,
        sectionConfig.extractOptions,
      ),
      title: sectionConfig.title,
    })),
  );
}

/**
 * Collects every exported helper JSDoc from the configured utility categories.
 */
async function collectUtilityCategories(): Promise<UtilityCategory[]> {
  return Promise.all(
    utilsDirectoryNames.map(async (directoryName) => {
      const filePaths = await listTypeScriptFiles(
        path.join(utilsSourceRootPath, directoryName),
      );

      return {
        directoryName,
        entries: await collectEntriesFromFilePaths(filePaths),
        pageTitle: titleCase(directoryName),
      };
    }),
  );
}

async function writeMarkdownFile(filePath: string, contents: string) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, contents, "utf8");
  console.log(`generated ${path.relative(workspaceRootPath, filePath)}`);
}

function truncateText(text: string, maxLength: number): string {
  const normalizedText = text.replace(/\s+/g, " ").trim();

  if (normalizedText === "") {
    return "No description available.";
  }

  if (normalizedText.length <= maxLength) {
    return normalizedText;
  }

  return `${normalizedText.slice(0, maxLength).trimEnd()}...`;
}

function removeLeadingTitle(markdown: string): string {
  const lines = markdown.split("\n");

  if (!lines[0]?.startsWith("# ")) {
    return markdown.trim();
  }

  let contentStartIndex = 1;

  while (lines[contentStartIndex]?.trim() === "") {
    contentStartIndex += 1;
  }

  return lines.slice(contentStartIndex).join("\n").trim();
}

function getCoreLlmsUrl() {
  return `${llmsBaseUrl}/api/core.md`;
}

function getTestingLlmsUrl() {
  return `${llmsBaseUrl}/api/testing.md`;
}

function getUtilityEntryLlmsUrl(category: UtilityCategory, entry: JsDocEntry) {
  return `${llmsBaseUrl}/api/utils/${category.directoryName}/${entry.title}.md`;
}

/**
 * Builds the lightweight LLM index that links to the generated per-topic files.
 */
function buildLlmsIndex(utilityCategories: UtilityCategory[]): string {
  const parts = [
    "# VDL Plugin SDK",
    "",
    "> SDK to build plugins for VDL using TypeScript",
    "",
    "This index contains EVERYTHING this library offers. Analyze what you need and then download and read the documentation only for what you need at the corresponding link.",
    "",
    "## Core",
    "",
    'Usage: `import { definePlugin } from "@varavel/vdl-plugin-sdk";`',
    "",
    `Read more: ${getCoreLlmsUrl()}`,
    "",
    "## Testing",
    "",
    'Usage: `import { irb } from "@varavel/vdl-plugin-sdk/testing";`',
    "",
    `Read more: ${getTestingLlmsUrl()}`,
    "",
    "## Utils",
    "",
    'Usage: `import { strings, arrays, ... } from "@varavel/vdl-plugin-sdk/utils";`',
  ];

  for (const category of utilityCategories) {
    if (category.entries.length === 0) {
      continue;
    }

    parts.push("", `### ${category.pageTitle}`);

    for (const entry of category.entries) {
      const description = truncateText(getBlockDescription(entry.block), 100);

      parts.push(
        "",
        `#### ${entry.title}`,
        "",
        description,
        "",
        `Read more: ${getUtilityEntryLlmsUrl(category, entry)}`,
      );
    }
  }

  parts.push("");
  return parts.join("\n");
}

/**
 * Builds a single text file that keeps the same index structure as llms.txt
 * but inlines the full generated Markdown content for every topic.
 */
function buildLlmsFull(
  coreSections: MarkdownSection[],
  testingSections: MarkdownSection[],
  utilityCategories: UtilityCategory[],
): string {
  const parts = [
    "# VDL Plugin SDK",
    "",
    "> SDK to build plugins for VDL using TypeScript",
    "",
    "This index contains EVERYTHING this library offers. Analyze what you need and then read the embedded documentation directly in this file.",
    "",
    "## Core",
    "",
    'Usage: `import { definePlugin } from "@varavel/vdl-plugin-sdk";`',
    "",
    removeLeadingTitle(renderMarkdownPage("Core", coreSections)),
    "",
    "## Testing",
    "",
    'Usage: `import { irb } from "@varavel/vdl-plugin-sdk/testing";`',
    "",
    removeLeadingTitle(renderMarkdownPage("Testing", testingSections)),
    "",
    "## Utils",
    "",
    'Usage: `import { strings, arrays, ... } from "@varavel/vdl-plugin-sdk/utils";`',
  ];

  for (const category of utilityCategories) {
    if (category.entries.length === 0) {
      continue;
    }

    parts.push("", `### ${category.pageTitle}`);

    for (const entry of category.entries) {
      parts.push(
        "",
        `#### ${entry.title}`,
        "",
        removeLeadingTitle(renderMarkdownEntryPage(entry)),
      );
    }
  }

  parts.push("");
  return parts.join("\n");
}

async function writeApiDocs(
  coreSections: MarkdownSection[],
  testingSections: MarkdownSection[],
  utilityCategories: UtilityCategory[],
) {
  await writeMarkdownFile(
    path.join(docsApiDirectoryPath, "core.md"),
    renderMarkdownPage("Core", coreSections),
  );
  await writeMarkdownFile(
    path.join(docsApiDirectoryPath, "testing.md"),
    renderMarkdownPage("Testing", testingSections),
  );

  for (const category of utilityCategories) {
    await writeMarkdownFile(
      path.join(docsApiDirectoryPath, "utils", `${category.directoryName}.md`),
      renderMarkdownPage(category.pageTitle, [{ entries: category.entries }]),
    );
  }
}

async function writeLlmsDocs(
  coreSections: MarkdownSection[],
  testingSections: MarkdownSection[],
  utilityCategories: UtilityCategory[],
) {
  await writeMarkdownFile(
    path.join(llmsApiDirectoryPath, "core.md"),
    renderMarkdownPage("Core", coreSections),
  );
  await writeMarkdownFile(
    path.join(llmsApiDirectoryPath, "testing.md"),
    renderMarkdownPage("Testing", testingSections),
  );

  for (const category of utilityCategories) {
    for (const entry of category.entries) {
      await writeMarkdownFile(
        path.join(
          llmsApiDirectoryPath,
          "utils",
          category.directoryName,
          `${entry.title}.md`,
        ),
        renderMarkdownEntryPage(entry),
      );
    }
  }

  await writeMarkdownFile(llmsIndexPath, buildLlmsIndex(utilityCategories));
  await writeMarkdownFile(
    llmsFullIndexPath,
    buildLlmsFull(coreSections, testingSections, utilityCategories),
  );
}

/**
 * Generates the public API docs and the LLM-oriented docs from exported JSDoc
 * blocks. The generated folders are removed first so every run is a full reset.
 */
export async function generateDocs() {
  await Promise.all([
    rm(docsApiDirectoryPath, { force: true, recursive: true }),
    rm(llmsDirectoryPath, { force: true, recursive: true }),
    rm(llmsIndexPath, { force: true }),
    rm(llmsFullIndexPath, { force: true }),
  ]);

  const [coreSections, testingSections, utilityCategories] = await Promise.all([
    collectSections(coreSectionConfigs),
    collectSections(testingSectionConfigs),
    collectUtilityCategories(),
  ]);

  await writeApiDocs(coreSections, testingSections, utilityCategories);
  await writeLlmsDocs(coreSections, testingSections, utilityCategories);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  await generateDocs();
}
