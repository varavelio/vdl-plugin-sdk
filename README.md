<p align="center">
  <img
    src="https://raw.githubusercontent.com/varavelio/vdl/9cb8432f972f986ba91ffa1e4fe82220a8aa373f/assets/png/vdl.png"
    alt="VDL logo"
    width="130"
  />
</p>

<h1 align="center">VDL Plugin SDK</h1>

<p align="center">
  Build VDL plugins in TypeScript with a focused CLI, typed IR access, utility helpers, and test builders.
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
  <a href="https://github.com/varavelio/vdl-plugin-sdk/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/varavelio/vdl-plugin-sdk.svg" alt="License"/>
  </a>
</p>

<p align="center">
  <a href="https://vdl-plugin-sdk.varavel.com">Documentation</a>
  ·
  <a href="https://vdl-plugin-sdk.varavel.com/api/core/">API Reference</a>
  ·
  <a href="https://github.com/varavelio/vdl-plugin-template">Plugin Template</a>
</p>

## What You Get

- A typed plugin authoring API (`definePlugin`) for `src/index.ts`.
- Built-in error primitives (`PluginError`, `fail`, `assert`) for clear diagnostics.
- Utility subpath imports (`utils/*`) that tree-shake cleanly.
- A dedicated testing entry point with IR builders.
- A small CLI (`vdl-plugin`) for `check` and `build`.
- Shared TypeScript presets for plugin and test projects.

If you want the full API surface while reading, see [vdl-plugin-sdk.varavel.com](https://vdl-plugin-sdk.varavel.com).

## Install

Most projects should start from the official template:
[`vdl-plugin-template`](https://github.com/varavelio/vdl-plugin-template)

If you are setting up from scratch:

```bash
npm install --save-dev --save-exact @varavel/vdl-plugin-sdk@latest
```

## Quick Start

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

- `check`: type-checks plugin code (and tests if `tsconfig.vitest.json` exists).
- `build`: bundles `src/index.ts` into `dist/index.js`.

## Entry Points

| Import                                     | Use for                                                                        |
| ------------------------------------------ | ------------------------------------------------------------------------------ |
| `@varavel/vdl-plugin-sdk`                  | Runtime plugin authoring (`definePlugin`), typed input, generated files output |
| `@varavel/vdl-plugin-sdk/utils/<category>` | Tree-shakeable helper imports by category                                      |
| `@varavel/vdl-plugin-sdk/testing`          | Test-only builders for realistic plugin input and IR fixtures                  |

### `@varavel/vdl-plugin-sdk`

Use this in runtime plugin code (usually `src/index.ts`).

### `@varavel/vdl-plugin-sdk/utils/<category>`

Use this for reusable helpers in plugin logic:

```ts
import { words, pascalCase } from "@varavel/vdl-plugin-sdk/utils/strings";
import { chunk } from "@varavel/vdl-plugin-sdk/utils/arrays";
```

### `@varavel/vdl-plugin-sdk/testing`

Use this only in tests to build IR and plugin input fixtures without manually writing large object graphs.

## CLI

Use via `npx` or package scripts:

```bash
npx vdl-plugin check
npx vdl-plugin build
```

- `check` runs TypeScript with no emit. If `tsconfig.vitest.json` exists, test code is type-checked too.
- `build` produces the release artifact at `dist/index.js` from `src/index.ts`.

## Error Handling

`definePlugin` wraps your handler in a safe global boundary.

- Throw `PluginError` (or use `fail`) when you want to report a structured diagnostic.
- Use `assert` to fail fast and keep TypeScript narrowing for validated values.
- Any unexpected thrown value is converted into a safe `errors` response.

```ts
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
```

## Typical Plugin Workflow

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

## TypeScript Setup

Use the shared base config in your `tsconfig.json`:

```json
{
  "extends": "@varavel/vdl-plugin-sdk/tsconfig.base.json",
  "include": ["src/**/*.ts"],
  "exclude": ["src/**/*.test.ts"]
}
```

## Testing

The testing entry point exposes independent builders, so each test imports only what it needs.

```ts
import {
  field,
  objectType,
  pluginInput,
  primitiveType,
  schema,
  typeDef,
} from "@varavel/vdl-plugin-sdk/testing";

const input = pluginInput({
  options: { prefix: "Api" },
  ir: schema({
    types: [
      typeDef(
        "User",
        objectType([
          field("id", primitiveType("string")),
        ]),
      ),
    ],
  }),
});
```

Pass `input` to your plugin handler in unit tests and assert generated files or errors.

To add tests, install [Vitest](https://vitest.dev):

```bash
npm install --save-dev vitest
```

Create `tsconfig.vitest.json` in your plugin root:

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

This includes Node.js types for test files only, so test types do not leak into your main plugin compilation.

Once that file exists, `vdl-plugin check` automatically type-checks test code as well.

## License

This project is released under the MIT License. See the [LICENSE](https://github.com/varavelio/vdl-plugin-sdk/blob/main/LICENSE).
