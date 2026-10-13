---
title: "Documentation"
description: "Learn how to install, author, check, build, and test VDL plugins with the SDK."
icon: "book-open"
weight: 0
---

# Documentation

Welcome to the **VDL Plugin SDK** documentation. The SDK is a TypeScript library for building VDL plugins (plugins are code generators).

## How the documentation is organized

- **Getting Started** - install the SDK and run your first `check` and `build`.
- **Guides** - entry points, CLI usage, error handling, TypeScript setup, and testing.
- **API Reference** - generated docs for `core`, `utils/*`, and `testing`, organized by import path.

If you are new here, start with [Getting Started](./getting-started/). Each API page shows its import path at the top so you always know what to import.

## Mental model

- Reach for `@varavel/vdl-plugin-sdk` when you are writing the plugin itself.
- Reach for `@varavel/vdl-plugin-sdk/utils/<category>` when your plugin logic needs shared helper functions.
- Reach for `@varavel/vdl-plugin-sdk/testing` when you are constructing test fixtures.
- Treat the CLI and `tsconfig` presets as project scaffolding around those imports, not as part of your runtime code.
