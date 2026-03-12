<p align="center">
  <img
    src="https://raw.githubusercontent.com/varavelio/vdl/9cb8432f972f986ba91ffa1e4fe82220a8aa373f/assets/png/vdl.png"
    alt="VDL logo"
    width="130"
  />
</p>

<h1 align="center">VDL Plugin SDK</h1>

<p align="center">
  Build VDL plugins in TypeScript with typed IR access, utility helpers, a simple CLI, and test builders for plugin unit tests.
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

The package ships two entry points:

| Import                            | Use for                                           |
| --------------------------------- | ------------------------------------------------- |
| `@varavel/vdl-plugin-sdk`         | Plugin entrypoints, IR types, and runtime helpers |
| `@varavel/vdl-plugin-sdk/testing` | Test-only IR builders via `irb`                   |

## What You Get

- `definePlugin(...)` to declare a plugin handler with typed input and output.
- Generated VDL IR types exported directly from the package.
- `getAnnotation` and `getAnnotationArg` for reading annotations.
- `unwrapLiteral<T>()` for reading constants and annotation values.
- `getOptionString`, `getOptionBool`, `getOptionNumber`, and `getOptionArray` for reading plugin options.
- `irb` from `@varavel/vdl-plugin-sdk/testing` for building IR test fixtures fast.
- A `vdl-plugin` binary that supports `check` and `build`.

## Quick Start

Every VDL plugin should export a `definePlugin(...)` handler from `src/index.ts`.

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

## Plugin Workflow

Every plugin follows the same release flow:

1. Create and export a `definePlugin(...)` handler in `./src/index.ts`.
2. Run `vdl-plugin build` to bundle the plugin into `./dist/index.js`.
3. Commit `./dist/index.js` to the repository.
4. Publish a new release on GitHub including all your files, including `./dist/index.js`.
5. When the plugin is used, VDL reads `./dist/index.js` directly from your GitHub releases.

## API

### `@varavel/vdl-plugin-sdk`

- `definePlugin(handler)` defines the plugin entrypoint, and `VdlPluginHandler` is the matching function type.
- `getAnnotation(...)`, `getAnnotationArg(...)`, and `unwrapLiteral(...)` help you read annotation and literal data from the IR.
- `getOptionString(...)`, `getOptionBool(...)`, `getOptionNumber(...)`, and `getOptionArray(...)` read plugin options safely.
- Core IR types such as `PluginInput`, `IrSchema`, `TypeDef`, `EnumDef`, `TypeRef`, and `LiteralValue` are exported directly from the package.

### `@varavel/vdl-plugin-sdk/testing`

- `irb.pluginInput(...)` builds a complete `PluginInput` with sensible defaults.
- `irb.schema(...)`, `irb.typeDef(...)`, `irb.enumDef(...)`, `irb.constantDef(...)`, and `irb.field(...)` build common IR nodes.
- `irb.primitiveType(...)`, `irb.namedType(...)`, `irb.enumType(...)`, `irb.arrayType(...)`, `irb.mapType(...)`, and `irb.objectType(...)` build `TypeRef` values.
- Literal and metadata helpers such as `irb.stringLiteral(...)`, `irb.objectLiteral(...)`, `irb.annotation(...)`, and `irb.position(...)` cover the pieces most tests need.

## CLI

Use the bundled binary in scripts or with `npx`:

```bash
npx vdl-plugin check
npx vdl-plugin build
```

- `check` runs TypeScript without emitting files. If a `tsconfig.vitest.json` is present, it also type-checks test code.
- `build` bundles the required `src/index.ts` entry into `dist/index.js`. Minification is enabled by default; pass `--no-minify` to disable it.

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
  "include": ["src/**/*.test.ts", "tests/**/*.ts", "vitest.config.ts"]
}
```

This config extends the base provided by the SDK and includes Node.js types exclusively for test files, keeping them out of your main plugin compilation.

Once the file is in place, `vdl-plugin check` will automatically type-check your test code as well.

## License

This project is released under the MIT License. See [LICENSE](LICENSE).
