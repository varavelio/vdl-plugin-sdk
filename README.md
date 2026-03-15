<p align="center">
  <img
    src="https://raw.githubusercontent.com/varavelio/vdl/9cb8432f972f986ba91ffa1e4fe82220a8aa373f/assets/png/vdl.png"
    alt="VDL logo"
    width="130"
  />
</p>

<h1 align="center">VDL Plugin SDK</h1>

<p align="center">
  Build VDL plugins in TypeScript with a simple CLI, typed IR access, utility helpers, and test builders for plugin unit tests.
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

This is usually installed for you. The official
[`vdl-plugin-template`](https://github.com/varavelio/vdl-plugin-template)
already include the SDK.

```bash
npm install --save-dev --save-exact @varavel/vdl-plugin-sdk@latest
```

## Quick Start

Every VDL plugin should export a `definePlugin(...)` handler function from `src/index.ts` named `generate`.

Create `src/index.ts` in your plugin project:

```ts
import { definePlugin } from "@varavel/vdl-plugin-sdk";

export const generate = definePlugin((input) => {
  // Your plugin logic goes here

  // Feel free to explore the plugin input
  console.log(input.version) // The VDL version without v prefix
  console.log(input.options) // Any option that the user passed to the plugin via vdl.config.vdl
  console.log(input.ir) // VDL intermediate representation from where your plugin generates code

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

Then run `npx vdl-plugin build`, this will generate the ready-to-use code for your plugin in `./dist/index.js`.

## What This Package Includes

Think of the SDK as four pieces that work together:

- The main package for authoring a plugin handler and working with the typed VDL IR.
- A separate `utils` entry point for reusable helper namespaces used in plugin logic.
- A separate `testing` entry point for building realistic IR fixtures in unit tests.
- A small CLI plus shared `tsconfig` presets for the normal plugin build workflow.

The README focuses on how these surfaces fit together. A fuller API reference live in dedicated docs.

## Entry Points

| Import                            | Use for                                                                                            |
| --------------------------------- | -------------------------------------------------------------------------------------------------- |
| `@varavel/vdl-plugin-sdk`         | Main plugin authoring surface: define your plugin, receive typed input, and return generated files |
| `@varavel/vdl-plugin-sdk/utils`   | Helper namespaces for deterministic transformations and VDL-specific utility work                  |
| `@varavel/vdl-plugin-sdk/testing` | Test-only builders for creating plugin input and IR fixtures quickly                               |

### `@varavel/vdl-plugin-sdk`

Use `@varavel/vdl-plugin-sdk` in your plugin runtime code. This is the package surface you start from when writing `src/index.ts`.

It is the home for the plugin definition flow and the generated VDL types that describe the input your plugin receives.

### `@varavel/vdl-plugin-sdk/utils`

Use `@varavel/vdl-plugin-sdk/utils` when your plugin code needs reusable transformations, string and object helpers, option helpers, or IR-oriented convenience functions.

The utilities are organized into namespaces such as `arrays`, `functions`, `maps`, `math`, `misc`, `objects`, `options`, `predicates`, `sets`, `strings`, and `ir`, so plugin code can stay explicit without pulling everything from the main SDK entry point.

### `@varavel/vdl-plugin-sdk/testing`

Use `@varavel/vdl-plugin-sdk/testing` only in tests. It exposes `irb`, a compact IR builder for creating realistic plugin input and schema fixtures without hand-writing large object graphs.

This keeps test helpers separate from runtime imports and makes unit tests easier to read.

## Recommended Mental Model

- Reach for `@varavel/vdl-plugin-sdk` when you are writing the plugin itself.
- Reach for `@varavel/vdl-plugin-sdk/utils` when your plugin logic needs shared helper functions.
- Reach for `@varavel/vdl-plugin-sdk/testing` when you are constructing test fixtures.
- Treat the CLI and `tsconfig` presets as project scaffolding around those imports, not as part of your runtime code.

## CLI

Use the bundled binary in scripts or with `npx`:

```bash
npx vdl-plugin check
npx vdl-plugin build
```

- `check` runs TypeScript without emitting files. If a `tsconfig.vitest.json` is present, it also type-checks test code.
- `build` bundles the required `src/index.ts` entry into `dist/index.js`.

## Plugin Workflow

Most plugins follow the same path:

1. Author the plugin in `src/index.ts` with the main SDK entry point.
2. Use `@varavel/vdl-plugin-sdk/utils` only where helper namespaces make the implementation clearer.
3. Add unit tests with `@varavel/vdl-plugin-sdk/testing` when you need realistic IR input.
4. Run `vdl-plugin check` during development.
5. Run `vdl-plugin build` to produce `dist/index.js` for release.
6. Commit `dist/index.js` to GitHub and create a new release (tag).

When a plugin is published, VDL consumes the built `dist/index.js` artifact rather than the TypeScript source.

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

You can extend the shared base config exported by the SDK in your `tsconfig.json` file:

```json
{
  "extends": "@varavel/vdl-plugin-sdk/tsconfig.base.json",
  "include": ["src/**/*.ts"],
  "exclude": ["src/**/*.test.ts"]
}
```

## Testing

`irb` stands for IR builder. It is a small factory API for tests that need realistic VDL input without hand-writing the full IR shape every time.

Import it from the dedicated testing entry point:

```ts
import { irb } from "@varavel/vdl-plugin-sdk/testing";
```

Example:

```ts
import { irb } from "@varavel/vdl-plugin-sdk/testing";

const input = irb.pluginInput({
  options: { prefix: "Api" },
  ir: irb.schema({
    types: [
      irb.typeDef(
        "User",
        irb.objectType([
          irb.field("id", irb.primitiveType("string")),
        ]),
      ),
    ],
  }),
});
```

Pass `input` to your plugin handler in a unit test and assert on the generated files or errors.

Because `irb` lives under `@varavel/vdl-plugin-sdk/testing`, you can keep test helpers separate from your plugin runtime imports.

To add tests to your plugin, install [Vitest](https://vitest.dev):

```bash
npm install --save-dev vitest
```

Then create a `tsconfig.vitest.json` in the root of your project:

```json
{
  "extends": "@varavel/vdl-plugin-sdk/tsconfig.vitest.base.json",
  "include": [
    "src/**/*.test.ts",
    "tests/**/*.ts",
    "e2e/**/*.ts",
    "vitest.config.ts"
  ]
}
```

This config extends the base provided by the SDK and includes Node.js types exclusively for test files, keeping them out of your main plugin compilation.

Once the file is in place, `vdl-plugin check` will automatically type-check your test code as well.

## License

This project is released under the MIT License. See [LICENSE](LICENSE).
