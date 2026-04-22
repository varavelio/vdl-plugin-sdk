/**
 * This constant contains the fixed template header for the llms.txt and llms-full.txt files.
 */
export const llmsTemplate = `

# VDL Plugin SDK

Build VDL plugins in TypeScript with a focused CLI, typed IR access, utility helpers, and test builders.

This document is an AI-oriented entry layer for the SDK.

Use it to quickly determine:

1. What the package does.
2. Which import path matches the current task.
3. Which documentation links to read next.

Read only the sections and links relevant to your task.

## About the project

### What is VDL?

VDL is the open-source cross-language definition engine for modern stacks. Define your data structures, APIs, contracts, and generate type-safe code for your backend and frontend instantly.

- VDL GitHub: https://github.com/varavelio/vdl
- SDK GitHub: https://github.com/varavelio/vdl-plugin-sdk

### What is VDL Plugin SDK (this package)

VDL Plugin SDK is a TypeScript library for building VDL plugins (plugins are code generators).

## How to use this document

- Treat this file as a routing layer, not the full API reference.
- Identify the exact job first (runtime plugin code, helper utilities, or tests).
- Select the matching entry point.
- Follow linked docs only for the selected surface.
- Avoid broad assumptions across unrelated modules.

## Task to entry-point map

- Write or update plugin runtime logic in \`src/index.ts\` -> \`@varavel/vdl-plugin-sdk\`
- Reuse helper utilities in plugin logic -> \`@varavel/vdl-plugin-sdk/utils/<category>\`
- Build test fixtures and synthetic IR in tests -> \`@varavel/vdl-plugin-sdk/testing\`
- Type-check and bundle plugin output -> \`vdl-plugin\` CLI (\`check\`, \`build\`)

## Quick Start

A VDL plugin exports a \`generate\` handler created with \`definePlugin(...)\` from \`src/index.ts\`.

\`\`\`ts
import { definePlugin } from "@varavel/vdl-plugin-sdk";

export const generate = definePlugin((input) => {
  // Your plugin logic goes here

  // Explore plugin input as needed
  console.log(input.version); // The VDL version without the v prefix
  console.log(input.options); // Plugin options from vdl.config.vdl
  console.log(input.ir); // Typed VDL intermediate representation

  return {
    files: [
      {
        path: "hello.txt",
        content: "Hello from VDL Plugin SDK",
      },
    ],
  };
});
\`\`\`

Then run:

\`\`\`bash
npx vdl-plugin check
npx vdl-plugin build
\`\`\`

- \`check\` validates your TypeScript during development.
- \`build\` generates the release-ready plugin bundle at \`dist/index.js\`.

Output contract reminder:

- A plugin returns generated files.
- VDL consumes the built artifact at \`dist/index.js\`.

## What This Package Includes

Think of the SDK as five pieces that work together:

- The main package for authoring a plugin handler and working with the typed VDL IR.
- Built-in error primitives for clear diagnostics (\`PluginError\`, \`fail\`, \`assert\`).
- Tree-shakeable utility subpaths for reusable helper functions used in plugin logic.
- A separate \`testing\` entry point for building realistic IR fixtures in unit tests.
- A small CLI plus shared \`tsconfig\` presets for the normal plugin build workflow.

### Entry Points

| Import                                       | Use for                                                                                            |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| \`@varavel/vdl-plugin-sdk\`                  | Main plugin authoring surface: define your plugin, receive typed input, and return generated files |
| \`@varavel/vdl-plugin-sdk/utils/<category>\` | Tree-shakeable utility imports for one helper category                                             |
| \`@varavel/vdl-plugin-sdk/testing\`          | Test-only builders for creating plugin input and IR fixtures quickly                               |

#### \`@varavel/vdl-plugin-sdk\`

Use \`@varavel/vdl-plugin-sdk\` in your plugin runtime code. This is the package surface you start from when writing \`src/index.ts\`.

#### \`@varavel/vdl-plugin-sdk/utils/<category>\`

Use utility subpaths when your plugin code needs reusable transformations, string helpers, option helpers, or IR-oriented convenience functions.

Prefer specific imports for clarity and better tree-shaking.

#### \`@varavel/vdl-plugin-sdk/testing\`

Use \`@varavel/vdl-plugin-sdk/testing\` only in tests. It exposes independent IR builder functions for creating realistic plugin input and schema fixtures without hand-writing large object graphs.

Do not import this entry point in production plugin runtime code.

### Mental Model

- Reach for \`@varavel/vdl-plugin-sdk\` when you are writing the plugin itself.
- Reach for \`@varavel/vdl-plugin-sdk/utils/<category>\` when your plugin logic needs shared helper functions.
- Reach for \`@varavel/vdl-plugin-sdk/testing\` when you are constructing test fixtures.
- Treat the CLI and \`tsconfig\` presets as project scaffolding around those imports, not as part of your runtime code.

## CLI

Use the bundled binary in scripts or with \`npx\`:

\`\`\`bash
npx vdl-plugin check
npx vdl-plugin build

# Or with custom entry/out paths:
npx vdl-plugin build --entry packages/my-plugin/src/main.ts --out ../../dist/index.js
\`\`\`

- \`check\` runs TypeScript without emitting files.
- \`build\` bundles the required \`src/index.ts\` entry into \`dist/index.js\` by default. You can override these defaults using the \`--entry <path>\` and \`--out <path>\` options.
- **Note**: Remember that the final built plugin must always be located at \`dist/index.js\` relative to your project's root directory so that VDL can automatically discover and load it.

## Importing Raw Files

The SDK's builder includes out-of-the-box support for importing files as raw plaintext strings. This is extremely useful for bundling templates, HTML, or SQL queries directly into your plugin without needing the \`fs\` module at runtime.

Simply append \`?raw\` to any relative import path:

\`\`\`ts
import { definePlugin } from "@varavel/vdl-plugin-sdk";
import query from "./query.sql?raw";

export const generate = definePlugin((input) => {
  return {
    files: [
      {
        path: "output.sql",
        content: query,
      },
    ],
  };
});
\`\`\`

## Error handling

\`definePlugin\` wraps your handler with a global safety boundary.

- Throw \`PluginError\` (or use \`fail\` or \`assert\`) for user-facing generation diagnostics.
- Use \`assert\` when validating required conditions while keeping TypeScript narrowing.
- Any unexpected thrown value is converted into a safe \`errors\` payload.

Example:

\`\`\`ts
import { assert, definePlugin, fail } from "@varavel/vdl-plugin-sdk";

export const generate = definePlugin((input) => {
  const serviceType = input.ir.types.find((typeDef) => typeDef.name === "Service");

  assert(serviceType, 'Missing required type "Service".', input.ir.position);

  if (serviceType.type.kind !== "object") {
    fail('Type "Service" must be an object.', serviceType.position);
  }

  return {
    files: [{ path: "service.txt", content: "ok" }],
  };
});
\`\`\`

For RPC plugins, use an \`assertValidIrForRpc\` validation call:

\`\`\`ts
import { definePlugin } from "@varavel/vdl-plugin-sdk";
import { assertValidIrForRpc } from "@varavel/vdl-plugin-sdk/utils/rpc";

export const generate = definePlugin((input) => {
  assertValidIrForRpc(input.ir);

  return {
    files: [{ path: "rpc.ts", content: "// generated" }],
  };
});
\`\`\`

## Agent checklist

Before writing code or answering SDK usage questions, verify:

1. Correct entry point selected for the task.
2. Runtime and test imports are not mixed.
3. Workflow commands follow \`check\` then \`build\`.

`.trim();
