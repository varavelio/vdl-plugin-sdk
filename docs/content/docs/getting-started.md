---
title: "Getting Started"
description: "Install the SDK, write the first handler, and run check and build."
icon: "rocket"
weight: 1
---

# Getting Started

Most projects should start from the official template:
[`vdl-plugin-template`](https://github.com/varavelio/vdl-plugin-template)

If you are setting up from scratch:

```bash
npm install --save-dev --save-exact @varavel/vdl-plugin-sdk@latest
```

## Quick start

Create `src/index.ts`:

```ts
import { definePlugin } from "@varavel/vdl-plugin-sdk";

export const generate = definePlugin((input) => {
  // Useful input fields:
  console.log(input.version); // VDL version (without the "v" prefix)
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
```

Run:

```bash
npx vdl-plugin check
npx vdl-plugin build
```

- `check`: type-checks plugin code.
- `build`: bundles `src/index.ts` into `dist/index.js`.

## Typical plugin workflow

1. Implement your plugin in `src/index.ts` with `@varavel/vdl-plugin-sdk`.
2. Use helpers from `@varavel/vdl-plugin-sdk/utils/<category>` as needed.
3. Add unit tests using `@varavel/vdl-plugin-sdk/testing`.
4. Run `vdl-plugin check` during development to ensure type safety.
5. Run `vdl-plugin build` to produce `dist/index.js`.
6. Commit `dist/index.js` and publish a new release tag.

VDL consumes the built `dist/index.js` artifact, not your TypeScript source.

Example `package.json` scripts:

```json
{
  "scripts": {
    "check": "vdl-plugin check",
    "build": "vdl-plugin build"
  }
}
```

## Next steps

- Learn the [entry points](/docs/guides/entry-points/) for runtime, utils, and testing imports.
- Learn the [CLI](/docs/guides/cli/) options for custom entry and output paths.
- Browse the [API reference](/docs/api/) when you need exact types and helpers.
