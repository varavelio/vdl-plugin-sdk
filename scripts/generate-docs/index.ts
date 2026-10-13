/// <reference types="node" />

import { execFileSync } from "node:child_process";
import { readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
const docsApiDirectoryPath = path.join(
  docsDirectoryPath,
  "content",
  "docs",
  "api",
);
const typedocConfigPath = path.join(workspaceRootPath, "typedoc.json");

const utilityOrder = [
  "ir",
  "rpc",
  "options",
  "strings",
  "yaml",
  "toml",
  "arrays",
  "functions",
  "maps",
  "math",
  "markdown",
  "objects",
  "sets",
  "paths",
  "crypto",
  "predicates",
  "codegen",
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

  if (value === "rpc") {
    return "RPC";
  }

  if (value === "yaml") {
    return "YAML";
  }

  if (value === "toml") {
    return "TOML";
  }

  return value
    .split(/[/_-]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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
        "Build realistic plugin input and IR fixtures for tests with the testing builders.",
      directoryPath: "testing",
      importPath: "@varavel/vdl-plugin-sdk/testing",
      section: "testing",
      sortOrder: 0,
      title: "Testing",
    },
  ];

  for (const [index, utilityName] of utilityOrder.entries()) {
    modules.push({
      directoryPath: utilityName,
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
  const withoutFrontmatter = stripFrontmatter(markdown);
  const lines = withoutFrontmatter.split("\n");
  return lines.find((line) => line.startsWith("# ")) ?? "# Untitled";
}

function stripFrontmatter(markdown: string) {
  if (!markdown.startsWith("---\n")) {
    return markdown;
  }

  const endIndex = markdown.indexOf("\n---\n", 4);

  if (endIndex === -1) {
    return markdown;
  }

  return markdown.slice(endIndex + 5);
}

function stripLeadingHeading(markdown: string) {
  const body = stripFrontmatter(markdown);
  const lines = body.split("\n");

  if (!lines[0]?.startsWith("# ")) {
    return body.trim();
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
  const body = stripFrontmatter(markdown);
  const lines = body.split("\n");
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

async function flattenUtilityModules(utilityNames: readonly string[]) {
  const utilsDirectoryPath = path.join(docsApiDirectoryPath, "utils");

  for (const utilityName of utilityNames) {
    const nestedPath = path.join(utilsDirectoryPath, utilityName);
    const flatPath = path.join(docsApiDirectoryPath, utilityName);

    try {
      await rename(nestedPath, flatPath);
    } catch (error) {
      const errorCode = (error as NodeJS.ErrnoException).code;

      if (errorCode !== "ENOENT") {
        throw error;
      }
    }
  }

  try {
    await rm(utilsDirectoryPath, { force: true, recursive: true });
  } catch {
    // Ignore missing utils directory after flattening.
  }

  // Flattening reduces depth by one level for utility pages.
  // Fix cross-module relative links that climbed to the previous layout:
  // - member pages used `../../../core/` (now `../../core/`)
  // - overview pages used `../../core/` (now `../core/`)
  const markdownFilePaths = await listMarkdownFiles(docsApiDirectoryPath);

  await Promise.all(
    markdownFilePaths.map(async (markdownFilePath) => {
      const currentContents = await readFile(markdownFilePath, "utf8");
      let nextContents = currentContents;

      if (path.basename(markdownFilePath) === "index.md") {
        nextContents = nextContents
          .replaceAll("../../../", "../../")
          .replaceAll("../../core/", "../core/")
          .replaceAll("../../testing/", "../testing/");
      } else {
        nextContents = nextContents.replaceAll("../../../", "../../");
      }

      if (nextContents !== currentContents) {
        await writeFile(markdownFilePath, nextContents, "utf8");
      }
    }),
  );
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

function escapeYamlString(value: string) {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, " ")}"`;
}

function buildFrontmatter(title: string, description: string, weight: number) {
  const safeTitle = escapeYamlString(truncateText(title, 120));
  const safeDescription = escapeYamlString(truncateText(description, 200));

  return [
    "---",
    `title: ${safeTitle}`,
    `description: ${safeDescription}`,
    `weight: ${weight}`,
    "---",
    "",
  ].join("\n");
}

const docsApiRoutePrefix = "/docs/api";

function toAbsoluteApiLink(sourceApiDir: string, target: string) {
  if (
    target.startsWith("#") ||
    /^https?:\/\//.test(target) ||
    target.startsWith("mailto:") ||
    target.startsWith("/")
  ) {
    return target;
  }

  const [targetPath, hash = ""] = target.split("#");
  const suffix = hash.length > 0 ? `#${hash}` : "";

  if (targetPath === "") {
    return target;
  }

  // Resolve against the source file directory inside the API tree. Veta
  // renders `dir/file.md` at the `dir/file/` route, so relative links from
  // member pages would resolve one level too deep in the browser. Absolute
  // links stay correct regardless of page depth.
  const resolved = path.posix.normalize(
    path.posix.join(sourceApiDir, targetPath),
  );

  if (resolved === "index.md" || resolved === ".") {
    return sourceApiDir === "."
      ? `${docsApiRoutePrefix}/${suffix}`
      : `${docsApiRoutePrefix}/${sourceApiDir}/${suffix}`;
  }

  if (resolved.endsWith("/index.md")) {
    const dir = resolved.slice(0, -"/index.md".length);
    return `${docsApiRoutePrefix}/${dir}/${suffix}`;
  }

  if (resolved.endsWith(".md")) {
    return `${docsApiRoutePrefix}/${resolved.slice(0, -".md".length)}/${suffix}`;
  }

  return target;
}

async function rewriteAllApiMarkdownLinksForVeta() {
  const markdownFilePaths = await listMarkdownFiles(docsApiDirectoryPath);

  await Promise.all(
    markdownFilePaths.map(async (markdownFilePath) => {
      const currentContents = await readFile(markdownFilePath, "utf8");
      const apiRelativePath = path
        .relative(docsApiDirectoryPath, markdownFilePath)
        .split(path.sep)
        .join("/");
      const sourceApiDir = path.posix.dirname(apiRelativePath);
      const nextContents = rewriteMarkdownLinks(currentContents, (target) => {
        return toAbsoluteApiLink(sourceApiDir, target);
      });

      if (nextContents !== currentContents) {
        await writeFile(markdownFilePath, nextContents, "utf8");
      }
    }),
  );
}

function getModuleWeight(module: BuiltModule) {
  if (module.section === "core") {
    return 1;
  }

  if (module.section === "testing") {
    return 50;
  }

  return 10 + module.sortOrder;
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
    const moduleDir = module.overviewPath.replace(/\/index\.md$/, "");
    const vetaOverviewLink = `${docsApiRoutePrefix}/${moduleDir}/`;
    lines.push(
      `- [${module.title}](${vetaOverviewLink}) - \`${module.importPath}\``,
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
    buildFrontmatter(
      "API Reference",
      "Generated from the public TypeScript surface with TypeDoc and organized by import path.",
      3,
    ),
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

async function writeModuleFrontmatter(modules: BuiltModule[]) {
  await Promise.all(
    modules.map(async (module) => {
      const overviewFilePath = path.join(
        docsApiDirectoryPath,
        module.overviewPath,
      );
      const overviewBody = await readFile(overviewFilePath, "utf8");
      const overviewDescription =
        module.description ?? `Import from \`${module.importPath}\`.`;
      const overviewFrontmatter = buildFrontmatter(
        module.title,
        overviewDescription,
        getModuleWeight(module),
      );

      await writeFile(
        overviewFilePath,
        `${overviewFrontmatter}\n${stripFrontmatter(overviewBody).trim()}\n`,
        "utf8",
      );

      const moduleDirectoryPath = path.join(
        docsApiDirectoryPath,
        module.directoryPath,
      );
      const markdownFilePaths = await listMarkdownFiles(moduleDirectoryPath);
      const memberFilePaths = markdownFilePaths.filter((filePath) => {
        return path.basename(filePath) !== "index.md";
      });

      await Promise.all(
        memberFilePaths.map(async (memberFilePath) => {
          const memberBody = await readFile(memberFilePath, "utf8");
          const title = cleanMemberTitle(extractFirstHeading(memberBody));
          const summary = extractSummaryFromMarkdown(memberBody);
          const description =
            summary.length > 0
              ? summary
              : `Import from \`${module.importPath}\`.`;
          const frontmatter = buildFrontmatter(title, description, 999999);

          await writeFile(
            memberFilePath,
            `${frontmatter}\n${stripFrontmatter(memberBody).trim()}\n`,
            "utf8",
          );
        }),
      );
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

function runVetaBuild() {
  try {
    execFileSync("veta", ["build"], {
      cwd: docsDirectoryPath,
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
        "veta is required to build the documentation site. Install Veta before running `npm run build:docs`.",
      );
    }

    throw error;
  }
}

async function main() {
  await rm(docsApiDirectoryPath, { force: true, recursive: true });

  runTypeDoc();
  await renameCoreModuleDirectory();
  await flattenUtilityModules(utilityOrder);

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
  await writeModuleFrontmatter(builtModules);
  await rewriteAllApiMarkdownLinksForVeta();
  runVetaBuild();
}

await main();
