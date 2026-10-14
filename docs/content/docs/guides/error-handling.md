---
title: "Error Handling"
description: "Report structured plugin diagnostics with positions."
weight: 3
---

# Error Handling

`definePlugin` wraps your handler in a safe global boundary.

- Throw `PluginError` (or use `fail`) when you want to report a structured diagnostic.
- Use `assert` to fail fast and keep TypeScript narrowing for validated values.
- Any unexpected thrown value is converted into a safe `errors` response.

```ts
import { assert, definePlugin, fail } from "@varavel/vdl-plugin-sdk";

export const generate = definePlugin((input) => {
  const serviceType = input.ir.types.find(
    (typeDef) => typeDef.name === "Service",
  );

  assert(serviceType, 'Missing required type "Service".', input.ir.position);

  if (serviceType.type.kind !== "object") {
    fail('Type "Service" must be an object.', serviceType.position);
  }

  return {
    files: [{ path: "service.txt", content: "ok" }],
  };
});
```

For HTTP-RPC plugins, prefer a single fail-fast validation call before generation:

```ts
import { definePlugin } from "@varavel/vdl-plugin-sdk";
import { assertValidIrForHttpRpc } from "@varavel/vdl-plugin-sdk/utils/rpc";

export const generate = definePlugin((input) => {
  assertValidIrForHttpRpc(input.ir);

  return {
    files: [{ path: "rpc.ts", content: "// generated" }],
  };
});
```

For policy plugins, use the validated result for generation:

```ts
import { definePlugin } from "@varavel/vdl-plugin-sdk";
import { assertValidIrForPolicy } from "@varavel/vdl-plugin-sdk/utils/policy";

export const generate = definePlugin((input) => {
  const policies = assertValidIrForPolicy(input.ir);

  return {
    files: policies.map((policy) => ({
      path: `${policy.name}.ts`,
      content: `// ${policy.name}`,
    })),
  };
});
```

For event plugins, use the validated result for generation:

```ts
import { definePlugin } from "@varavel/vdl-plugin-sdk";
import { assertValidIrForEvents } from "@varavel/vdl-plugin-sdk/utils/events";

export const generate = definePlugin((input) => {
  const events = assertValidIrForEvents(input.ir);

  return {
    files: events.map((event) => ({
      path: `${event.name}.ts`,
      content: `// ${event.subjectTemplate}`,
    })),
  };
});
```
