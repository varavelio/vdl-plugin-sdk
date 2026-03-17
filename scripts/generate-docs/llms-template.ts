/**
 * This constant contains the fixed template headere for the llms.txt and llms-full.txt files.
 */
export const llmsTemplate = `

# VDL Plugin SDK

Build VDL plugins in TypeScript with a simple CLI, typed IR access, utility helpers, and test builders for plugin unit tests.

This document contains EVERYTHING this library offers. Analyze what you need, download and read the documentation only for what you need at the corresponding link.

## About the project

### What is VDL?

VDL is the open-source cross-language definition engine for modern stacks. Define your data structures, APIs, contracts, and generate type-safe code for your backend and frontend instantly.

- VDL GitHub: https://github.com/varavelio/vdl
- SDK GitHub: https://github.com/varavelio/vdl-plugin-sdk

### What is VDL Plugin SDK (this package)

VDL Plugin SDK is a TypeScript library for building VDL plugins (plugins are code generators).

## Quick Start

A VDL plugin exports a \`generate\` handler created with \`definePlugin(...)\` from \`src/index.ts\`.

\`\`\`ts
import { definePlugin } from "@varavel/vdl-plugin-sdk";

export const generate = definePlugin((input) => {
  // Your plugin logic goes here

  // Feel free to explore the plugin input
  console.log(input.version); // The VDL version without the v prefix
  console.log(input.options); // Plugin options from vdl.config.vdl
  console.log(input.ir); // Typed VDL intermediate representation

  return {
    files: [
      {
        path: "hello.txt",
        content: "Hello from VDL Plugin SDK",
      },
    ]
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

## What This Package Includes

Think of the SDK as four pieces that work together:

- The main package for authoring a plugin handler and working with the typed VDL IR.
- A separate \`utils\` entry point for reusable helper namespaces used in plugin logic.
- A separate \`testing\` entry point for building realistic IR fixtures in unit tests.
- A small CLI plus shared \`tsconfig\` presets for the normal plugin build workflow.

### Entry Points

| Import                              | Use for                                                                                            |
| ----------------------------------- | -------------------------------------------------------------------------------------------------- |
| \`@varavel/vdl-plugin-sdk\`         | Main plugin authoring surface: define your plugin, receive typed input, and return generated files |
| \`@varavel/vdl-plugin-sdk/utils\`   | Helper namespaces for deterministic transformations and VDL-specific utility work                  |
| \`@varavel/vdl-plugin-sdk/testing\` | Test-only builders for creating plugin input and IR fixtures quickly                               |

#### \`@varavel/vdl-plugin-sdk\`

Use \`@varavel/vdl-plugin-sdk\` in your plugin runtime code. This is the package surface you start from when writing \`src/index.ts\`.

#### \`@varavel/vdl-plugin-sdk/utils\`

Use \`@varavel/vdl-plugin-sdk/utils\` when your plugin code needs reusable transformations, string and object helpers, option helpers, or IR-oriented convenience functions.

#### \`@varavel/vdl-plugin-sdk/testing\`

Use \`@varavel/vdl-plugin-sdk/testing\` only in tests. It exposes \`irb\`, a compact IR builder for creating realistic plugin input and schema fixtures without hand-writing large object graphs.

### Mental Model

- Reach for \`@varavel/vdl-plugin-sdk\` when you are writing the plugin itself.
- Reach for \`@varavel/vdl-plugin-sdk/utils\` when your plugin logic needs shared helper functions.
- Reach for \`@varavel/vdl-plugin-sdk/testing\` when you are constructing test fixtures.
- Treat the CLI and \`tsconfig\` presets as project scaffolding around those imports, not as part of your runtime code.

## CLI

Use the bundled binary in scripts or with \`npx\`:

\`\`\`bash
npx vdl-plugin check
npx vdl-plugin build
\`\`\`

- \`check\` runs TypeScript without emitting files. If a \`tsconfig.vitest.json\` is present, it also type-checks test code.
- \`build\` bundles the required \`src/index.ts\` entry into \`dist/index.js\`.

`.trim();
