import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFilePath = fileURLToPath(import.meta.url);
const scriptsDirectoryPath = path.dirname(currentFilePath);
const workspaceRootPath = path.resolve(scriptsDirectoryPath, "..");
const utilsRootPath = path.join(workspaceRootPath, "src", "utils");
const esToolkitDistRootPath = path.join(
  workspaceRootPath,
  "node_modules",
  "es-toolkit",
  "dist",
);

const generatedFileName = "es-toolkit.ts";
const generatorPathLabel = "scripts/generate-es-toolkit-utils.mjs";
const jsDocBlockPattern = /\/\*\*[\s\S]*?\*\//;
const esToolkitAttributionLine =
  " * @see Powered by `es-toolkit` (MIT License): https://github.com/toss/es-toolkit";

function symbol(symbolName, docsSourceName = symbolName) {
  return { docsSourceName, symbolName };
}

function category(
  localCategoryName,
  esToolkitCategoryName,
  description,
  symbols,
) {
  return {
    description,
    esToolkitCategoryName,
    localCategoryName,
    symbols: symbols.map((entry) => {
      return typeof entry === "string" ? symbol(entry) : entry;
    }),
  };
}

const categories = [
  category(
    "arrays",
    "array",
    "Deterministic array utility functions re-exported from es-toolkit.",
    [
      "at",
      "chunk",
      "compact",
      "countBy",
      "difference",
      "differenceBy",
      "differenceWith",
      "drop",
      "dropRight",
      "dropRightWhile",
      "dropWhile",
      "flatMap",
      "flatMapDeep",
      "flatten",
      "flattenDeep",
      "groupBy",
      "head",
      "initial",
      "intersection",
      "intersectionBy",
      "intersectionWith",
      "isSubset",
      "isSubsetWith",
      "keyBy",
      "last",
      "maxBy",
      "minBy",
      "orderBy",
      "partition",
      "sortBy",
      "tail",
      "take",
      "takeRight",
      "takeRightWhile",
      "takeWhile",
      "toFilled",
      "union",
      "unionBy",
      "unionWith",
      "uniq",
      "uniqBy",
      "uniqWith",
      "unzip",
      "unzipWith",
      "windowed",
      "without",
      "xor",
      "xorBy",
      "xorWith",
      "zip",
      "zipObject",
      "zipWith",
    ],
  ),
  category(
    "functions",
    "function",
    "Synchronous function utilities re-exported from es-toolkit.",
    [
      "after",
      "ary",
      "before",
      "curry",
      "curryRight",
      "flow",
      "flowRight",
      "identity",
      "memoize",
      "negate",
      "noop",
      "once",
      "partial",
      "partialRight",
      "rest",
      "spread",
      "unary",
    ],
  ),
  category(
    "maps",
    "map",
    "Map utility functions re-exported from es-toolkit.",
    [
      "every",
      "filter",
      "findKey",
      "findValue",
      "hasValue",
      "mapKeys",
      "mapValues",
      "reduce",
      "some",
    ],
  ),
  category(
    "math",
    "math",
    "Deterministic math utility functions re-exported from es-toolkit.",
    [
      "clamp",
      "inRange",
      "mean",
      "meanBy",
      "median",
      "medianBy",
      "range",
      "rangeRight",
      "round",
      "sum",
      "sumBy",
    ],
  ),
  category(
    "misc",
    "util",
    "Small synchronous miscellaneous helpers re-exported from es-toolkit.",
    [symbol("assert", "invariant"), "attempt", "invariant"],
  ),
  category(
    "objects",
    "object",
    "Object utility functions re-exported from es-toolkit.",
    [
      "clone",
      "cloneDeep",
      "findKey",
      "flattenObject",
      "invert",
      "mapKeys",
      "mapValues",
      "merge",
      "mergeWith",
      "omit",
      "omitBy",
      "pick",
      "pickBy",
      "toMerged",
    ],
  ),
  category(
    "predicates",
    "predicate",
    "Predicate helpers re-exported from es-toolkit.",
    [
      "isBoolean",
      "isDate",
      "isEmptyObject",
      "isEqual",
      "isError",
      "isFunction",
      "isJSON",
      symbol("isJSONArray", "isJSONValue"),
      symbol("isJSONObject", "isJSONValue"),
      "isJSONValue",
      "isMap",
      "isNil",
      "isNotNil",
      "isNull",
      "isNumber",
      "isPlainObject",
      "isPrimitive",
      "isRegExp",
      "isSet",
      "isString",
      "isUndefined",
    ],
  ),
  category(
    "sets",
    "set",
    "Set utility functions re-exported from es-toolkit.",
    ["countBy", "every", "filter", "find", "keyBy", "map", "reduce", "some"],
  ),
];

function toImportAlias(symbolName) {
  return `esToolkit_${symbolName}`;
}

function normalizeJsDocBlock(jsDocBlock) {
  const lines = jsDocBlock.split("\n");

  return lines
    .map((line, index) => {
      if (index === 0) {
        return "/**";
      }

      if (index === lines.length - 1) {
        return " */";
      }

      const trimmedLine = line.trim();

      if (trimmedLine === "" || trimmedLine === "*") {
        return " *";
      }

      return trimmedLine.startsWith("*")
        ? ` ${trimmedLine}`
        : ` * ${trimmedLine}`;
    })
    .join("\n");
}

function getFallbackJsDoc(symbolName) {
  return [
    "/**",
    ` * Re-exports \`${symbolName}\` from es-toolkit.`,
    " *",
    esToolkitAttributionLine,
    " */",
  ].join("\n");
}

function decorateJsDoc(jsDocBlock, symbolName) {
  const lines = normalizeJsDocBlock(
    jsDocBlock ?? getFallbackJsDoc(symbolName),
  ).split("\n");
  const closingLine = lines.pop();

  if (closingLine === undefined) {
    throw new Error("cannot decorate an empty JSDoc block");
  }

  if (lines[lines.length - 1]?.trim() !== "*") {
    lines.push(" *");
  }

  return [...lines, esToolkitAttributionLine, closingLine].join("\n");
}

function buildExportStatement(symbolName) {
  const importAlias = toImportAlias(symbolName);
  const singleLineStatement = `export const ${symbolName}: typeof ${importAlias} = ${importAlias};`;

  return singleLineStatement.length <= 80
    ? singleLineStatement
    : [
        `export const ${symbolName}: typeof ${importAlias} =`,
        `  ${importAlias};`,
      ].join("\n");
}

async function readSymbolJsDoc(
  esToolkitCategoryName,
  symbolName,
  docsSourceName,
) {
  const definitionFilePath = path.join(
    esToolkitDistRootPath,
    esToolkitCategoryName,
    `${docsSourceName}.d.ts`,
  );
  const definitionFileContents = await readFile(definitionFilePath, "utf8");
  const jsDocBlock =
    definitionFileContents.match(jsDocBlockPattern)?.[0] ?? null;

  return decorateJsDoc(jsDocBlock, symbolName);
}

async function buildCategorySource(categoryConfig) {
  const importLines = categoryConfig.symbols.map(({ symbolName }) => {
    return `  ${symbolName} as ${toImportAlias(symbolName)},`;
  });

  const exportBlocks = await Promise.all(
    categoryConfig.symbols.map(async ({ docsSourceName, symbolName }) => {
      const jsDocBlock = await readSymbolJsDoc(
        categoryConfig.esToolkitCategoryName,
        symbolName,
        docsSourceName,
      );

      return [jsDocBlock, buildExportStatement(symbolName)].join("\n");
    }),
  );

  return [
    `// This file is auto-generated by \`${generatorPathLabel}\`.`,
    "// DO NOT EDIT.",
    "",
    "/**",
    ` * ${categoryConfig.description}`,
    " * Licensed under the MIT License. https://github.com/toss/es-toolkit",
    " */",
    "",
    "import {",
    ...importLines,
    `} from "es-toolkit/${categoryConfig.esToolkitCategoryName}";`,
    "",
    exportBlocks.join("\n\n"),
    "",
  ].join("\n");
}

async function writeFileIfChanged(filePath, nextContents) {
  let currentContents = null;

  try {
    currentContents = await readFile(filePath, "utf8");
  } catch {
    currentContents = null;
  }

  if (currentContents === nextContents) {
    return false;
  }

  await writeFile(filePath, nextContents, "utf8");
  return true;
}

async function generateCategoryFile(categoryConfig) {
  const categoryDirectoryPath = path.join(
    utilsRootPath,
    categoryConfig.localCategoryName,
  );
  const outputFilePath = path.join(categoryDirectoryPath, generatedFileName);

  await mkdir(categoryDirectoryPath, { recursive: true });

  return {
    didChange: await writeFileIfChanged(
      outputFilePath,
      await buildCategorySource(categoryConfig),
    ),
    filePath: outputFilePath,
  };
}

async function main() {
  const results = await Promise.all(categories.map(generateCategoryFile));
  const changedResults = results.filter((result) => result.didChange);

  if (changedResults.length === 0) {
    console.log("es-toolkit utility wrappers are up to date.");
    return;
  }

  for (const result of changedResults) {
    console.log(`updated ${path.relative(workspaceRootPath, result.filePath)}`);
  }
}

await main();
