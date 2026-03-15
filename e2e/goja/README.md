# Goja E2E Smoke Test

This directory contains the end-to-end smoke test that verifies selected SDK
utilities can execute inside [Goja](https://github.com/dop251/goja).

## Layout

- `test.ts`: the TypeScript smoke test that imports SDK utilities and runs
  synchronous assertions.
- `run.mjs`: bundles `test.ts` into one self-executing script and hands it to
  the Go runner.
- `go/`: the minimal Go module that executes the bundled script inside Goja.

## Execution flow

1. `run.mjs` bundles `test.ts` with `esbuild` as a single IIFE.
2. The bundled script is piped to `go run ./e2e/goja/go`.
3. The Go runner executes the script inside Goja.
4. The script must call `__goja_report_ok__()`.
5. The runner prints `ok` only when everything succeeds.

If the script throws, times out, or never reports success, the check fails.

## Extending it

- Add new checks by expanding `createSuites()` in `test.ts`.
- Prefer adding a new suite or a new check with a descriptive name.
- Keep checks synchronous and deterministic.
- Import new modules directly from `src/` when needed.

## Running it

```sh
npm run test:e2e
```
