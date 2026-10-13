---
title: "TypeScript Setup"
description: "Composite configs that separate plugin code from tests."
icon: "file-code"
weight: 4
---

# TypeScript Setup

The SDK uses a composite TypeScript setup to strictly separate your production code from your test environment. You will need three configuration files in your project root:

1. `tsconfig.json` (The Router) This file tells your editor and the `vdl-plugin check` where to find the two separate configurations for production and tests.

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.test.json" }
  ]
}
```

2. `tsconfig.app.json` (For Production Code) This configuration extends the SDK's base app config and defines which files are part of your plugin, excluding tests.

```json
{
  "extends": "@varavel/vdl-plugin-sdk/tsconfig.app.base.json",
  "include": ["src/**/*.ts"],
  "exclude": ["src/**/*.test.ts", "src/**/*.spec.ts"]
}
```

3. `tsconfig.test.json` (For Tests) This configuration extends the SDK's test base config and includes everything your production code ignores. It ensures that test-specific types do not leak into your main plugin compilation.

```json
{
  "extends": "@varavel/vdl-plugin-sdk/tsconfig.test.base.json",
  "include": [
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "tests/**/*.ts",
    "e2e/**/*.ts",
    "vitest.config.ts"
  ]
}
```
