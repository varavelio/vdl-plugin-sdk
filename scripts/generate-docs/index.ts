/// <reference types="node" />

import { execFileSync } from "node:child_process";
import {
  copyFile,
  mkdir,
  readdir,
  readFile,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { llmsTemplate } from "./llms-template.ts";

type DocsSection = "core" | "testing" | "utilities";

type ModuleDefinition = {
  description?: string;
  directoryPath: string;
  importPath: string;
  section: DocsSection;
  sortOrder: number;
  title: string;
};

type MemberPage = {
  content: string;
  groupKey: string;
  relativePath: string;
  summary: string;
  title: string;
};

type BuiltModule = ModuleDefinition & {
  memberPages: MemberPage[];
  overviewContent: string;
  overviewPath: string;
};

const require = createRequire(import.meta.url);

const currentFilePath = fileURLToPath(import.meta.url);
const scriptsDirectoryPath = path.dirname(currentFilePath);
const workspaceRootPath = path.resolve(scriptsDirectoryPath, "../..");
const docsDirectoryPath = path.join(workspaceRootPath, "docs");
const docsApiDirectoryPath = path.join(docsDirectoryPath, "api");
const docsLlmsIndexPath = path.join(docsDirectoryPath, "llms.txt");
const docsLlmsFullPath = path.join(docsDirectoryPath, "llms-full.txt");
const mkdocsConfigPath = path.join(workspaceRootPath, "mkdocs.yml");
const siteDirectoryPath = path.join(workspaceRootPath, "site");
const siteLlmsApiDirectoryPath = path.join(siteDirectoryPath, "llms", "api");
const typedocConfigPath = path.join(workspaceRootPath, "typedoc.json");

const llmsBaseUrl = "https://vdl-plugin-sdk.varavel.com/llms/api";
const mkdocsNavStartMarker = "      # AUTO-GENERATED API NAV START";
const mkdocsNavEndMarker = "      # AUTO-GENERATED API NAV END";

const utilityOrder = [
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

const groupOrder = [
  "functions",
  "variables",
  "type-aliases",
  "enumerations",
  "interfaces",
  "classes",
  "documents",
] as const;

const groupOrderIndex = new Map<string, number>(
  groupOrder.map((groupName, index) => [groupName, index]),
);

function titleCase(value: string) {
  if (value === "ir") {
    return "IR";
  }

  return value
    .split(/[/_-]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getGroupTitle(groupKey: string) {
  return titleCase(groupKey);
}

function getModuleDefinitions(): ModuleDefinition[] {
  const modules: ModuleDefinition[] = [
    {
      description:
        "Define plugins and use the typed VDL IR surface exported by the main SDK entry point.",
      directoryPath: "core",
      importPath: "@varavel/vdl-plugin-sdk",
      section: "core",
      sortOrder: 0,
      title: "Core",
    },
    {
      description:
        "Build realistic plugin input and IR fixtures for tests with the `irb` helpers.",
      directoryPath: "testing",
      importPath: "@varavel/vdl-plugin-sdk/testing",
      section: "testing",
      sortOrder: 0,
      title: "Testing",
    },
  ];

  for (const [index, utilityName] of utilityOrder.entries()) {
    modules.push({
      directoryPath: `utils/${utilityName}`,
      importPath: `@varavel/vdl-plugin-sdk/utils/${utilityName}`,
      section: "utilities",
      sortOrder: index,
      title: titleCase(utilityName),
    });
  }

  return modules;
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function truncateText(value: string, maxLength: number) {
  const normalized = normalizeWhitespace(value);

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}

function extractFirstHeading(markdown: string) {
  const lines = markdown.split("\n");
  return lines.find((line) => line.startsWith("# ")) ?? "# Untitled";
}

function stripLeadingHeading(markdown: string) {
  const lines = markdown.split("\n");

  if (!lines[0]?.startsWith("# ")) {
    return markdown.trim();
  }

  let index = 1;

  while (lines[index]?.trim() === "") {
    index += 1;
  }

  return lines.slice(index).join("\n").trim();
}

function cleanMemberTitle(rawHeading: string) {
  return rawHeading
    .replace(/^#\s+/, "")
    .replace(
      /^(Function|Variable|Type Alias|Enumeration|Interface|Class):\s+/,
      "",
    )
    .replace(/\(\)$/, "")
    .trim();
}

function extractSummaryFromMarkdown(markdown: string) {
  const lines = markdown.split("\n");
  let index = 0;

  if (lines[index]?.startsWith("# ")) {
    index += 1;
  }

  while (lines[index]?.trim() === "") {
    index += 1;
  }

  if (lines[index]?.startsWith("_Import from `")) {
    index += 1;

    while (lines[index]?.trim() === "") {
      index += 1;
    }
  }

  if (lines[index]?.startsWith("```")) {
    index += 1;

    while (index < lines.length && !lines[index]?.startsWith("```")) {
      index += 1;
    }

    if (index < lines.length) {
      index += 1;
    }

    while (lines[index]?.trim() === "") {
      index += 1;
    }
  }

  if (lines[index]?.startsWith("Defined in:")) {
    index += 1;

    while (lines[index]?.trim() === "") {
      index += 1;
    }
  }

  const paragraphLines: string[] = [];

  while (index < lines.length) {
    const line = lines[index] ?? "";

    if (line.startsWith("## ")) {
      break;
    }

    if (line.trim() === "") {
      if (paragraphLines.length > 0) {
        break;
      }

      index += 1;
      continue;
    }

    paragraphLines.push(line.trim());
    index += 1;
  }

  return normalizeWhitespace(paragraphLines.join(" "));
}

async function listMarkdownFiles(directoryPath: string): Promise<string[]> {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const nestedFilePaths = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directoryPath, entry.name);

      if (entry.isDirectory()) {
        return listMarkdownFiles(entryPath);
      }

      return entry.name.endsWith(".md") ? [entryPath] : [];
    }),
  );

  return nestedFilePaths.flat().sort();
}

function rewriteMarkdownLinks(
  markdown: string,
  rewriter: (target: string) => string,
) {
  return markdown.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_match, label, target) => {
      return `[${label}](${rewriter(target)})`;
    },
  );
}

function rewriteCoreModuleTarget(target: string) {
  if (target.startsWith("#") || /^https?:\/\//.test(target)) {
    return target;
  }

  return target.replace(/(^|\/)index\//g, (_match, prefix: string) => {
    return `${prefix}core/`;
  });
}

async function rewriteAllApiMarkdownLinksForCoreRename() {
  const markdownFilePaths = await listMarkdownFiles(docsApiDirectoryPath);

  await Promise.all(
    markdownFilePaths.map(async (markdownFilePath) => {
      const currentContents = await readFile(markdownFilePath, "utf8");
      const nextContents = rewriteMarkdownLinks(
        currentContents,
        rewriteCoreModuleTarget,
      );

      if (nextContents !== currentContents) {
        await writeFile(markdownFilePath, nextContents, "utf8");
      }
    }),
  );
}

async function renameCoreModuleDirectory() {
  const typedocCoreDirectoryPath = path.join(docsApiDirectoryPath, "index");
  const docsCoreDirectoryPath = path.join(docsApiDirectoryPath, "core");

  try {
    await rename(typedocCoreDirectoryPath, docsCoreDirectoryPath);
  } catch (error) {
    const errorCode = (error as NodeJS.ErrnoException).code;

    if (errorCode !== "ENOENT") {
      throw error;
    }
  }

  await rewriteAllApiMarkdownLinksForCoreRename();
}

async function decorateModuleOverview(moduleDefinition: ModuleDefinition) {
  const overviewPath = path.join(
    docsApiDirectoryPath,
    moduleDefinition.directoryPath,
    "index.md",
  );
  const currentContents = await readFile(overviewPath, "utf8");
  const body = stripLeadingHeading(currentContents);
  const nextContents = [
    `# ${moduleDefinition.title}`,
    "",
    `_Import from \`${moduleDefinition.importPath}\`._`,
    ...(moduleDefinition.description !== undefined
      ? ["", moduleDefinition.description]
      : []),
    "",
    body,
    "",
  ].join("\n");

  await writeFile(overviewPath, nextContents, "utf8");
}

async function decorateMemberPages(moduleDefinition: ModuleDefinition) {
  const moduleDirectoryPath = path.join(
    docsApiDirectoryPath,
    moduleDefinition.directoryPath,
  );
  const markdownFilePaths = await listMarkdownFiles(moduleDirectoryPath);
  const memberMarkdownFilePaths = markdownFilePaths.filter((filePath) => {
    return path.basename(filePath) !== "index.md";
  });

  await Promise.all(
    memberMarkdownFilePaths.map(async (memberMarkdownFilePath) => {
      const currentContents = await readFile(memberMarkdownFilePath, "utf8");
      const title = cleanMemberTitle(extractFirstHeading(currentContents));
      const body = stripLeadingHeading(currentContents);
      const nextContents = [
        `# ${title}`,
        "",
        `_Import from \`${moduleDefinition.importPath}\`._`,
        "",
        body,
        "",
      ].join("\n");

      await writeFile(memberMarkdownFilePath, nextContents, "utf8");
    }),
  );
}

async function buildModule(
  moduleDefinition: ModuleDefinition,
): Promise<BuiltModule> {
  const moduleDirectoryPath = path.join(
    docsApiDirectoryPath,
    moduleDefinition.directoryPath,
  );
  const overviewPath = path.posix.join(
    moduleDefinition.directoryPath,
    "index.md",
  );
  const overviewContent = await readFile(
    path.join(moduleDirectoryPath, "index.md"),
    "utf8",
  );
  const markdownFilePaths = await listMarkdownFiles(moduleDirectoryPath);
  const memberPages = await Promise.all(
    markdownFilePaths
      .filter((filePath) => path.basename(filePath) !== "index.md")
      .map(async (filePath) => {
        const relativePath = path.posix.join(
          moduleDefinition.directoryPath,
          path
            .relative(moduleDirectoryPath, filePath)
            .split(path.sep)
            .join("/"),
        );
        const content = await readFile(filePath, "utf8");
        const relativeDirectory = path.posix.dirname(
          path.posix.relative(moduleDefinition.directoryPath, relativePath),
        );
        const groupKey = relativeDirectory.split("/")[0] ?? "documents";

        return {
          content,
          groupKey,
          relativePath,
          summary: extractSummaryFromMarkdown(content),
          title: cleanMemberTitle(extractFirstHeading(content)),
        } satisfies MemberPage;
      }),
  );

  memberPages.sort((left, right) => {
    const leftGroupIndex =
      groupOrderIndex.get(left.groupKey) ?? Number.POSITIVE_INFINITY;
    const rightGroupIndex =
      groupOrderIndex.get(right.groupKey) ?? Number.POSITIVE_INFINITY;

    return (
      leftGroupIndex - rightGroupIndex || left.title.localeCompare(right.title)
    );
  });

  return {
    ...moduleDefinition,
    memberPages,
    overviewContent,
    overviewPath,
  };
}

function sortModules(modules: BuiltModule[]) {
  return [...modules].sort((left, right) => {
    if (left.section !== right.section) {
      return left.section.localeCompare(right.section);
    }

    return (
      left.sortOrder - right.sortOrder || left.title.localeCompare(right.title)
    );
  });
}

function getModulesBySection(modules: BuiltModule[], section: DocsSection) {
  return modules.filter((module) => module.section === section);
}

function appendModuleReferenceList(
  lines: string[],
  heading: string,
  modules: BuiltModule[],
) {
  if (modules.length === 0) {
    return;
  }

  lines.push(`## ${heading}`, "");

  for (const module of modules) {
    lines.push(
      `- [${module.title}](${module.overviewPath}) - \`${module.importPath}\``,
    );

    if (module.description !== undefined) {
      lines.push(`  ${module.description}`);
    }
  }

  lines.push("");
}

async function writeApiOverview(modules: BuiltModule[]) {
  const coreModules = getModulesBySection(modules, "core");
  const utilityModules = getModulesBySection(modules, "utilities");
  const testingModules = getModulesBySection(modules, "testing");
  const lines = [
    "# API Reference",
    "",
    "Generated from the public TypeScript surface with TypeDoc and organized by import path.",
    "",
  ];

  appendModuleReferenceList(lines, "Core", coreModules);
  appendModuleReferenceList(lines, "Utilities", utilityModules);
  appendModuleReferenceList(lines, "Testing", testingModules);

  await writeFile(
    path.join(docsApiDirectoryPath, "index.md"),
    `${lines.join("\n").trim()}\n`,
    "utf8",
  );
}

function getPagesForGroup(module: BuiltModule, groupKey: string) {
  return module.memberPages.filter((page) => page.groupKey === groupKey);
}

function buildModuleNavLines(module: BuiltModule, indent: string) {
  const lines = [
    `${indent}- ${module.title}:`,
    `${indent}    - Overview: api/${module.overviewPath}`,
  ];

  for (const groupKey of groupOrder) {
    const pages = getPagesForGroup(module, groupKey);

    if (pages.length === 0) {
      continue;
    }

    lines.push(`${indent}    - ${getGroupTitle(groupKey)}:`);

    for (const page of pages) {
      lines.push(`${indent}        - ${page.title}: api/${page.relativePath}`);
    }
  }

  return lines;
}

async function updateMkDocsNav(modules: BuiltModule[]) {
  const mkdocsContents = await readFile(mkdocsConfigPath, "utf8");
  const startMarkerIndex = mkdocsContents.indexOf(mkdocsNavStartMarker);
  const endMarkerIndex = mkdocsContents.indexOf(mkdocsNavEndMarker);

  if (
    startMarkerIndex === -1 ||
    endMarkerIndex === -1 ||
    endMarkerIndex < startMarkerIndex
  ) {
    throw new Error("mkdocs.yml is missing the generated API nav markers");
  }

  const coreModules = getModulesBySection(modules, "core");
  const utilityModules = getModulesBySection(modules, "utilities");
  const testingModules = getModulesBySection(modules, "testing");
  const generatedNavLines = ["      - Overview: api/index.md"];

  for (const module of coreModules) {
    generatedNavLines.push(...buildModuleNavLines(module, "      "));
  }

  if (utilityModules.length > 0) {
    generatedNavLines.push("      - Utils:");

    for (const module of utilityModules) {
      generatedNavLines.push(...buildModuleNavLines(module, "          "));
    }
  }

  for (const module of testingModules) {
    generatedNavLines.push(...buildModuleNavLines(module, "      "));
  }

  const before = mkdocsContents.slice(
    0,
    startMarkerIndex + mkdocsNavStartMarker.length,
  );
  const after = mkdocsContents.slice(endMarkerIndex);
  const nextContents = `${before}\n${generatedNavLines.join("\n")}\n${after}`;

  await writeFile(mkdocsConfigPath, nextContents, "utf8");
}

function getLlmsUrl(relativePath: string) {
  return `${llmsBaseUrl}/${relativePath}`;
}

function rewriteRelativeLinksForLlms(
  markdown: string,
  currentRelativePath: string,
) {
  return rewriteMarkdownLinks(markdown, (target) => {
    if (target.startsWith("#") || /^https?:\/\//.test(target)) {
      return target;
    }

    const [targetPath, hash = ""] = target.split("#");
    const resolvedPath = path.posix.normalize(
      path.posix.join(path.posix.dirname(currentRelativePath), targetPath),
    );

    if (!resolvedPath.endsWith(".md")) {
      return target;
    }

    return hash.length > 0
      ? `${getLlmsUrl(resolvedPath)}#${hash}`
      : getLlmsUrl(resolvedPath);
  });
}

function removeLeadingTitle(markdown: string) {
  const lines = markdown.split("\n");

  if (!lines[0]?.startsWith("# ")) {
    return markdown.trim();
  }

  let index = 1;

  while (lines[index]?.trim() === "") {
    index += 1;
  }

  return lines.slice(index).join("\n").trim();
}

type LlmsModuleRenderOptions = {
  groupHeadingLevel: number;
  itemHeadingLevel: number;
  moduleHeadingLevel?: number;
};

function buildLlmsModuleHeading(
  module: BuiltModule,
  options: LlmsModuleRenderOptions,
) {
  return options.moduleHeadingLevel !== undefined
    ? `${"#".repeat(options.moduleHeadingLevel)} ${module.title}`
    : undefined;
}

function buildLlmsIndexModuleBlock(module: BuiltModule) {
  const lines = [`import: \`${module.importPath}\``];

  if (module.description !== undefined) {
    lines.push(module.description);
  }

  lines.push(getLlmsUrl(module.overviewPath));

  return lines.join("\n");
}

function buildLlmsFullModuleBlocks(module: BuiltModule) {
  return [
    `import: \`${module.importPath}\``,
    rewriteRelativeLinksForLlms(
      removeLeadingTitle(module.overviewContent),
      module.overviewPath,
    ),
  ];
}

function buildLlmsIndexMemberBlock(page: MemberPage, memberHeading: string) {
  return [
    `${memberHeading} ${page.title}`,
    truncateText(page.summary, 140),
    getLlmsUrl(page.relativePath),
  ].join("\n");
}

function buildLlmsFullMemberBlock(page: MemberPage, memberHeading: string) {
  return [
    `${memberHeading} ${page.title}`,
    rewriteRelativeLinksForLlms(
      removeLeadingTitle(page.content),
      page.relativePath,
    ),
  ].join("\n");
}

function buildModuleLlmsIndex(
  module: BuiltModule,
  options: LlmsModuleRenderOptions,
) {
  const groupHeading = "#".repeat(options.groupHeadingLevel);
  const memberHeading = "#".repeat(options.itemHeadingLevel);
  const heading = buildLlmsModuleHeading(module, options);
  const parts: string[] = [buildLlmsIndexModuleBlock(module)];

  if (heading !== undefined) {
    parts.unshift(heading);
  }

  for (const groupKey of groupOrder) {
    const pages = getPagesForGroup(module, groupKey);

    if (pages.length === 0) {
      continue;
    }

    parts.push(`${groupHeading} ${getGroupTitle(groupKey)}`);

    for (const page of pages) {
      parts.push(buildLlmsIndexMemberBlock(page, memberHeading));
    }
  }

  return parts.join("\n\n");
}

function buildModuleLlmsFull(
  module: BuiltModule,
  options: LlmsModuleRenderOptions,
) {
  const groupHeading = "#".repeat(options.groupHeadingLevel);
  const memberHeading = "#".repeat(options.itemHeadingLevel);
  const heading = buildLlmsModuleHeading(module, options);
  const parts: string[] = [...buildLlmsFullModuleBlocks(module)];

  if (heading !== undefined) {
    parts.unshift(heading);
  }

  for (const groupKey of groupOrder) {
    const pages = getPagesForGroup(module, groupKey);

    if (pages.length === 0) {
      continue;
    }

    parts.push(`${groupHeading} ${getGroupTitle(groupKey)}`);

    for (const page of pages) {
      parts.push(buildLlmsFullMemberBlock(page, memberHeading));
    }
  }

  return parts.join("\n\n");
}

function appendLlmsSection(
  parts: string[],
  sectionTitle: string,
  modules: BuiltModule[],
  options: LlmsModuleRenderOptions,
  full: boolean,
) {
  if (modules.length === 0) {
    return;
  }

  parts.push("", `## ${sectionTitle}`);

  for (const module of modules) {
    parts.push(
      "",
      full
        ? buildModuleLlmsFull(module, options)
        : buildModuleLlmsIndex(module, options),
    );
  }
}

async function writeLlmsFiles(modules: BuiltModule[]) {
  const llmsIndexParts = [llmsTemplate];
  const llmsFullParts = [llmsTemplate];

  appendLlmsSection(
    llmsIndexParts,
    "Core",
    getModulesBySection(modules, "core"),
    { groupHeadingLevel: 3, itemHeadingLevel: 4 },
    false,
  );
  appendLlmsSection(
    llmsFullParts,
    "Core",
    getModulesBySection(modules, "core"),
    { groupHeadingLevel: 3, itemHeadingLevel: 4 },
    true,
  );
  appendLlmsSection(
    llmsIndexParts,
    "Utilities",
    getModulesBySection(modules, "utilities"),
    { groupHeadingLevel: 4, itemHeadingLevel: 5, moduleHeadingLevel: 3 },
    false,
  );
  appendLlmsSection(
    llmsFullParts,
    "Utilities",
    getModulesBySection(modules, "utilities"),
    { groupHeadingLevel: 4, itemHeadingLevel: 5, moduleHeadingLevel: 3 },
    true,
  );
  appendLlmsSection(
    llmsIndexParts,
    "Testing",
    getModulesBySection(modules, "testing"),
    { groupHeadingLevel: 3, itemHeadingLevel: 4 },
    false,
  );
  appendLlmsSection(
    llmsFullParts,
    "Testing",
    getModulesBySection(modules, "testing"),
    { groupHeadingLevel: 3, itemHeadingLevel: 4 },
    true,
  );

  await writeFile(
    docsLlmsIndexPath,
    `${llmsIndexParts.join("\n").trim()}\n`,
    "utf8",
  );
  await writeFile(
    docsLlmsFullPath,
    `${llmsFullParts.join("\n").trim()}\n`,
    "utf8",
  );
}

async function copyLlmsMarkdownMirror() {
  await rm(siteLlmsApiDirectoryPath, { force: true, recursive: true });

  const markdownFilePaths = await listMarkdownFiles(docsApiDirectoryPath);

  await Promise.all(
    markdownFilePaths.map(async (markdownFilePath) => {
      const relativePath = path.relative(
        docsApiDirectoryPath,
        markdownFilePath,
      );
      const targetPath = path.join(siteLlmsApiDirectoryPath, relativePath);

      await mkdir(path.dirname(targetPath), { recursive: true });
      await copyFile(markdownFilePath, targetPath);
    }),
  );
}

function runTypeDoc() {
  const typedocPackageJsonPath = require.resolve("typedoc/package.json");
  const typedocCliPath = path.join(
    path.dirname(typedocPackageJsonPath),
    "bin",
    "typedoc",
  );

  execFileSync(
    process.execPath,
    [typedocCliPath, "--options", typedocConfigPath],
    {
      cwd: workspaceRootPath,
      stdio: "inherit",
    },
  );
}

function runMkDocsBuild() {
  try {
    execFileSync("mkdocs", ["build", "--strict"], {
      cwd: workspaceRootPath,
      stdio: "inherit",
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      throw new Error(
        "mkdocs is required to build the documentation site. Install MkDocs with Material before running `npm run build:docs`.",
      );
    }

    throw error;
  }
}

async function main() {
  await rm(docsApiDirectoryPath, { force: true, recursive: true });

  runTypeDoc();
  await renameCoreModuleDirectory();

  const moduleDefinitions = getModuleDefinitions();

  await Promise.all(
    moduleDefinitions.map(async (moduleDefinition) => {
      await decorateModuleOverview(moduleDefinition);
      await decorateMemberPages(moduleDefinition);
    }),
  );

  const builtModules = sortModules(
    await Promise.all(moduleDefinitions.map(buildModule)),
  );

  await writeApiOverview(builtModules);
  await updateMkDocsNav(builtModules);
  await writeLlmsFiles(builtModules);
  runMkDocsBuild();
  await copyLlmsMarkdownMirror();
}

await main();
