# ir

## Functions

### getAnnotation()

> **getAnnotation**(`annotations`, `name`): [`Annotation`](../core.md#annotation) \| `undefined`

Defined in: [utils/ir/get-annotation.ts:6](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/ir/get-annotation.ts#L6)

Returns the first annotation that matches the provided name.

#### Parameters

##### annotations

[`Annotation`](../core.md#annotation)[] | `undefined`

##### name

`string`

#### Returns

[`Annotation`](../core.md#annotation) \| `undefined`

***

### getAnnotationArg()

> **getAnnotationArg**(`annotations`, `name`): [`LiteralValue`](../core.md#literalvalue) \| `undefined`

Defined in: [utils/ir/get-annotation-arg.ts:10](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/ir/get-annotation-arg.ts#L10)

Returns the raw literal argument stored in an annotation.

VDL annotations currently expose a single literal argument.
Pair this helper with `unwrapLiteral` when you need a plain JavaScript value.

#### Parameters

##### annotations

[`Annotation`](../core.md#annotation)[] | `undefined`

##### name

`string`

#### Returns

[`LiteralValue`](../core.md#literalvalue) \| `undefined`

***

### unwrapLiteral()

> **unwrapLiteral**\<`T`\>(`value`): `T`

Defined in: [utils/ir/unwrap-literal.ts:11](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/ir/unwrap-literal.ts#L11)

Resolves a `LiteralValue` into its native JavaScript representation.

Pass a generic when you already know the expected shape.
Omit it to get `unknown` and narrow the result yourself.

The generic only affects TypeScript types. It does not validate the runtime value.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### value

[`LiteralValue`](../core.md#literalvalue)

#### Returns

`T`
