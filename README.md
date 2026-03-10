<p align="center">
  <img
    src="https://raw.githubusercontent.com/varavelio/vdl/9cb8432f972f986ba91ffa1e4fe82220a8aa373f/assets/png/vdl.png"
    alt="VDL logo"
    width="130"
  />
</p>

<h1 align="center">VDL Plugin SDK</h1>

<p align="center">
  Build VDL plugins in TypeScript with typed IR models, utility helpers, and a simple CLI for checking and bundling plugin packages.
</p>

<p align="center">
  <a href="https://github.com/varavelio/vdl-plugin-sdk/actions">
    <img src="https://github.com/varavelio/vdl-plugin-sdk/actions/workflows/ci.yaml/badge.svg" alt="CI status"/>
  </a>
  <a href="https://github.com/varavelio/vdl-plugin-sdk/releases/latest">
    <img src="https://img.shields.io/github/release/varavelio/vdl-plugin-sdk.svg" alt="Release Version"/>
  </a>
  <a href="https://www.npmjs.com/package/@varavel/vdl-plugin-sdk">
    <img src="https://img.shields.io/npm/v/%40varavel%2Fvdl-plugin-sdk" alt="NPM Version"/>
  </a>
  <a href="https://github.com/varavelio/vdl-plugin-sdk">
    <img src="https://img.shields.io/github/stars/varavelio/vdl-plugin-sdk?style=flat&label=github+stars" alt="GitHub Stars"/>
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/github/license/varavelio/vdl-plugin-sdk.svg" alt="License"/>
  </a>
</p>

## Install

This is a reference install command. In most cases you do not need it manually:
`vdl plugin init` and the official
[`vdl-plugin-template`](https://github.com/varavelio/vdl-plugin-template)
already include this SDK by default.

```bash
npm install @varavel/vdl-plugin-sdk
```

## What You Get

- `definePlugin(...)` to declare a plugin handler with typed input and output.
- Generated VDL IR types exported directly from the package.
- `getAnnotation` and `getAnnotationArgs` for reading annotations.
- `unwrapLiteral<T>()` for reading constants and annotation values.
- A `vdl-plugin` binary that supports `check` and `build`.

## Quick Start

Every VDL plugin should export a `definePlugin(...)` handler from `src/index.ts`.

Create `src/index.ts` in your plugin project:

```ts
import { definePlugin } from "@varavel/vdl-plugin-sdk";

export const generate = definePlugin((_input) => {
  // Your plugin logic goes here.

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

## Plugin Workflow

Every plugin follows the same release flow:

1. Create and export a `definePlugin(...)` handler in `./src/index.ts`.
2. Run `vdl-plugin build` to bundle the plugin into `./dist/index.js`.
3. Commit `./dist/index.js` to the repository.
4. Publish a new release on GitHub including all your files (including `./dist/index.js`).
5. When the plugin is used, VDL reads `./dist/index.js` directly from your GitHub relases.

## CLI

Use the bundled binary in scripts or with `npx`:

```bash
npx vdl-plugin check
npx vdl-plugin build
```

- `check` runs TypeScript without emitting files.
- `build` bundles the required `src/index.ts` entry into `dist/index.js`.

Example `package.json` scripts:

```json
{
  "scripts": {
    "check": "vdl-plugin check",
    "build": "vdl-plugin build"
  }
}
```

## TypeScript Setup

You can extend the shared base config exported by the SDK:

```json
{
  "extends": "@varavel/vdl-plugin-sdk/tsconfig.base.json"
}
```

## License

This project is released under the MIT License. See [LICENSE](LICENSE).
