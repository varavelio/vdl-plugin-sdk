---
title: "Raw Imports"
description: "Bundle text templates inside the plugin with ?raw imports."
icon: "file-text"
weight: 6
---

# Importing Raw Files

The SDK's builder includes out-of-the-box support for importing files as raw plaintext strings. This is extremely useful for bundling templates, HTML, or SQL queries directly into your plugin without needing the `fs` module at runtime.

Simply append `?raw` to any relative import path:

```ts
import { definePlugin } from "@varavel/vdl-plugin-sdk";
import query from "./query.sql?raw";

export const generate = definePlugin((input) => {
  return {
    files: [
      {
        path: "output.sql",
        content: query,
      },
    ],
  };
});
```
