import { spawn } from "node:child_process";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFilePath = fileURLToPath(import.meta.url);
const scriptsDirectoryPath = path.dirname(currentFilePath);
const workspaceRootPath = path.resolve(scriptsDirectoryPath, "..");
const docsApiDirectoryPath = path.join(workspaceRootPath, "docs", "api");
const typedocConfigPath = path.join(workspaceRootPath, "typedoc.json");
const typedocBinPath = path.join(
  workspaceRootPath,
  "node_modules",
  ".bin",
  "typedoc",
);
const rootIndexPath = path.join(docsApiDirectoryPath, "index.md");
const utilsDirectoryPath = path.join(docsApiDirectoryPath, "utils");
const utilsIndexPath = path.join(utilsDirectoryPath, "index.md");
const utilsNamespacesDirectoryPath = path.join(
  utilsDirectoryPath,
  "namespaces",
);

function toPosixPath(filePath) {
  return filePath.split(path.sep).join("/");
}

async function runCommand(command, args) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: workspaceRootPath,
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("exit", (exitCode) => {
      if (exitCode === 0) {
        resolve();
        return;
      }

      reject(new Error(`command failed with exit code ${exitCode ?? "null"}`));
    });
  });
}

async function listMarkdownFiles(directoryPath) {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const nestedResults = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directoryPath, entry.name);

      if (entry.isDirectory()) {
        return listMarkdownFiles(entryPath);
      }

      return entry.name.endsWith(".md") ? [entryPath] : [];
    }),
  );

  return nestedResults.flat().sort();
}

function getOutputPath(sourcePath) {
  if (sourcePath === rootIndexPath || sourcePath === utilsIndexPath) {
    return null;
  }

  if (sourcePath.startsWith(`${utilsNamespacesDirectoryPath}${path.sep}`)) {
    return path.join(utilsDirectoryPath, path.basename(sourcePath));
  }

  return sourcePath;
}

function splitMarkdownTarget(target) {
  const hashIndex = target.indexOf("#");

  if (hashIndex === -1) {
    return {
      hash: "",
      linkPath: target,
    };
  }

  return {
    hash: target.slice(hashIndex),
    linkPath: target.slice(0, hashIndex),
  };
}

function rewriteMarkdownLinks(
  contents,
  sourcePath,
  outputPath,
  outputPathBySourcePath,
) {
  return contents.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (fullMatch, label, target) => {
      if (
        target.startsWith("#") ||
        target.startsWith("/") ||
        /^[a-z][a-z0-9+.-]*:/i.test(target)
      ) {
        return fullMatch;
      }

      const { hash, linkPath } = splitMarkdownTarget(target);

      if (!linkPath.endsWith(".md")) {
        return fullMatch;
      }

      const resolvedTargetPath = path.resolve(
        path.dirname(sourcePath),
        linkPath,
      );

      if (!outputPathBySourcePath.has(resolvedTargetPath)) {
        return fullMatch;
      }

      const rewrittenTargetPath =
        outputPathBySourcePath.get(resolvedTargetPath);

      if (rewrittenTargetPath === null) {
        return fullMatch;
      }

      const nextTargetPath = toPosixPath(
        path.relative(path.dirname(outputPath), rewrittenTargetPath),
      );

      return `[${label}](${nextTargetPath || "./"}${hash})`;
    },
  );
}

async function postProcessDocs() {
  const markdownFilePaths = await listMarkdownFiles(docsApiDirectoryPath);
  const outputPathBySourcePath = new Map(
    markdownFilePaths.map((sourcePath) => [
      sourcePath,
      getOutputPath(sourcePath),
    ]),
  );
  const keptSourcePaths = markdownFilePaths.filter((sourcePath) => {
    return outputPathBySourcePath.get(sourcePath) !== null;
  });

  for (const sourcePath of keptSourcePaths) {
    const outputPath = outputPathBySourcePath.get(sourcePath);

    if (outputPath === null) {
      throw new Error(`unexpected null output path for ${sourcePath}`);
    }

    const contents = await readFile(sourcePath, "utf8");
    const nextContents = rewriteMarkdownLinks(
      contents,
      sourcePath,
      outputPath,
      outputPathBySourcePath,
    );

    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, nextContents, "utf8");
  }

  await rm(rootIndexPath, { force: true });
  await rm(utilsIndexPath, { force: true });
  await rm(utilsNamespacesDirectoryPath, { force: true, recursive: true });
}

await rm(docsApiDirectoryPath, { force: true, recursive: true });
await runCommand(typedocBinPath, ["--options", typedocConfigPath]);
await postProcessDocs();
