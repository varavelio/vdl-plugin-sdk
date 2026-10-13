---
title: "Entry Points"
description: "Runtime, utility, and testing imports for VDL plugins."
icon: "plug"
weight: 1
---

# Entry Points

| Import                                     | Use for                                                                        |
| ------------------------------------------ | ------------------------------------------------------------------------------ |
| `@varavel/vdl-plugin-sdk`                  | Runtime plugin authoring (`definePlugin`), typed input, generated files output |
| `@varavel/vdl-plugin-sdk/utils/<category>` | Tree-shakeable helper imports by category                                      |
| `@varavel/vdl-plugin-sdk/testing`          | Test-only builders for realistic plugin input and IR fixtures                  |

## `@varavel/vdl-plugin-sdk`

Use this in runtime plugin code (usually `src/index.ts`).

## `@varavel/vdl-plugin-sdk/utils/<category>`

Use this for reusable helpers in plugin logic:

```ts
import { words, pascalCase } from "@varavel/vdl-plugin-sdk/utils/strings";
import { chunk } from "@varavel/vdl-plugin-sdk/utils/arrays";
```

Prefer specific imports for clarity and better tree-shaking.

Do not import this entry point in ways that mix runtime and test concerns. See the [API reference](/docs/api/) for the full helper list.

## `@varavel/vdl-plugin-sdk/testing`

Use this only in tests to build IR and plugin input fixtures without manually writing large object graphs.

Do not import this entry point in production plugin runtime code.
