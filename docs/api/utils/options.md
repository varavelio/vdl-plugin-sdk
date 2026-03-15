# options

## Functions

### getOptionArray()

> **getOptionArray**(`options`, `key`, `defaultValue?`, `separator?`): `string`[]

Defined in: [utils/options/get-option-array.ts:13](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/options/get-option-array.ts#L13)

Returns a string array option from a separator-delimited value.

Empty items are removed and each entry is trimmed.

Missing values return the provided default.

#### Parameters

##### options

`Record`\<`string`, `string`\> | `undefined`

##### key

`string`

##### defaultValue?

`string`[] = `[]`

##### separator?

`string` = `","`

#### Returns

`string`[]

#### Example

```ts
// For options: { "features": "feature1, feature2, feature3" }
getOptionArray(options, "features", [], ",")
// returns ["feature1", "feature2", "feature3"]
```

***

### getOptionBool()

> **getOptionBool**(`options`, `key`, `defaultValue`): `boolean`

Defined in: [utils/options/get-option-bool.ts:10](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/options/get-option-bool.ts#L10)

Returns a boolean option using common truthy and falsy string values.

Accepted truthy values: `true`, `1`, `yes`, `on`, `enable`, `enabled`, `y`.

Accepted falsy values: `false`, `0`, `no`, `off`, `disable`, `disabled`, `n`.

Invalid values fall back to the provided default.

#### Parameters

##### options

`Record`\<`string`, `string`\> | `undefined`

##### key

`string`

##### defaultValue

`boolean`

#### Returns

`boolean`

***

### getOptionEnum()

> **getOptionEnum**\<`T`\>(`options`, `key`, `allowedValues`, `defaultValue`): `T`

Defined in: [utils/options/get-option-enum.ts:6](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/options/get-option-enum.ts#L6)

Returns a string option constrained to a known set of allowed values.

Missing, blank, and unsupported values fall back to the provided default.

#### Type Parameters

##### T

`T` *extends* `string`

#### Parameters

##### options

`Record`\<`string`, `string`\> | `undefined`

##### key

`string`

##### allowedValues

readonly `T`[]

##### defaultValue

`T`

#### Returns

`T`

***

### getOptionNumber()

> **getOptionNumber**(`options`, `key`, `defaultValue`): `number`

Defined in: [utils/options/get-option-number.ts:6](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/options/get-option-number.ts#L6)

Returns a numeric option or the provided fallback when parsing fails.

Empty, invalid, and non-finite values fall back to the default.

#### Parameters

##### options

`Record`\<`string`, `string`\> | `undefined`

##### key

`string`

##### defaultValue

`number`

#### Returns

`number`

***

### getOptionString()

> **getOptionString**(`options`, `key`, `defaultValue`): `string`

Defined in: [utils/options/get-option-string.ts:4](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/options/get-option-string.ts#L4)

Returns a string option or the provided fallback when the key is missing.

#### Parameters

##### options

`Record`\<`string`, `string`\> | `undefined`

##### key

`string`

##### defaultValue

`string`

#### Returns

`string`
