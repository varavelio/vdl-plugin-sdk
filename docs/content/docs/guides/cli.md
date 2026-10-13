---
title: "CLI"
description: "Type-check and bundle plugins with the vdl-plugin CLI."
icon: "terminal"
weight: 2
---

# CLI

Use via `npx` or package scripts:

```bash
npx vdl-plugin check
npx vdl-plugin build

# Or with custom entry/out paths:
npx vdl-plugin build --entry packages/my-plugin/src/main.ts --out ../../dist/index.js
```

- `check` runs TypeScript with no emit.
- `build` produces the release artifact at `dist/index.js` from `src/index.ts` by default. You can override these defaults using the `--entry <path>` and `--out <path>` options.
- **Note**: Remember that the final built plugin must always be located at `dist/index.js` relative to your project's root directory so that VDL can automatically discover and load it.
