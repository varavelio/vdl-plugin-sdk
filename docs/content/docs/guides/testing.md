---
title: "Testing"
description: "Build realistic IR fixtures for plugin unit tests."
icon: "flask-conical"
weight: 5
---

# Testing

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
      typeDef("User", objectType([field("id", primitiveType("string"))])),
    ],
  }),
});
```

Pass `input` to your plugin handler in unit tests and assert generated files or errors.

To add tests, install [Vitest](https://vitest.dev):

```bash
npm install --save-dev vitest
```
