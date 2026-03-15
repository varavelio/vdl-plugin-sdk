# testing

## Variables

### irb

> `const` **irb**: `object`

Defined in: [testing/ir-builders.ts:35](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/testing/ir-builders.ts#L35)

Intermediate Representation Builder — a collection of test factory functions
for constructing well-formed IR nodes with sensible defaults.

Use `irb` in unit tests to create `IrSchema`, `TypeDef`, `EnumDef`,
`ConstantDef`, `Field`, `TypeRef`, `LiteralValue`, `Annotation`, and other
IR structures without manually supplying every required property.

#### Type Declaration

##### annotation()

> **annotation**(`name`, `argument?`): [`Annotation`](core.md#annotation)

Creates an `Annotation` with the given name
and an optional literal argument.

###### Parameters

###### name

`string`

###### argument?

[`LiteralValue`](core.md#literalvalue)

###### Returns

[`Annotation`](core.md#annotation)

##### arrayLiteral()

> **arrayLiteral**(`items`): [`LiteralValue`](core.md#literalvalue)

Creates an array `LiteralValue` from a list of literal items.

###### Parameters

###### items

[`LiteralValue`](core.md#literalvalue)[]

###### Returns

[`LiteralValue`](core.md#literalvalue)

##### arrayType()

> **arrayType**(`type`, `dims?`): [`TypeRef`](core.md#typeref-3)

Creates an array `TypeRef` wrapping the given element type.

###### Parameters

###### type

[`TypeRef`](core.md#typeref-3)

###### dims?

`number` = `1`

Number of array dimensions (defaults to 1).

###### Returns

[`TypeRef`](core.md#typeref-3)

##### boolLiteral()

> **boolLiteral**(`value`): [`LiteralValue`](core.md#literalvalue)

Creates a boolean `LiteralValue`.

###### Parameters

###### value

`boolean`

###### Returns

[`LiteralValue`](core.md#literalvalue)

##### constantDef()

> **constantDef**(`name`, `typeRef`, `value`, `overrides?`): [`ConstantDef`](core.md#constantdef)

Creates a `ConstantDef` with the given name, type, and literal value.

Pass `overrides` to set `annotations` or `doc`.

###### Parameters

###### name

`string`

###### typeRef

[`TypeRef`](core.md#typeref-3)

###### value

[`LiteralValue`](core.md#literalvalue)

###### overrides?

`Partial`\<`Omit`\<[`ConstantDef`](core.md#constantdef), `"position"` \| `"annotations"` \| `"typeRef"` \| `"value"` \| `"name"`\>\> & `object` = `{}`

###### Returns

[`ConstantDef`](core.md#constantdef)

##### enumDef()

> **enumDef**(`name`, `enumValueType`, `members`, `overrides?`): [`EnumDef`](core.md#enumdef)

Creates an `EnumDef` with the given name, value type, and members.

Pass `overrides` to set `annotations` or `doc`.

###### Parameters

###### name

`string`

###### enumValueType

[`EnumValueType`](core.md#enumvaluetype)

###### members

[`EnumMember`](core.md#enummember)[]

###### overrides?

`Partial`\<`Omit`\<[`EnumDef`](core.md#enumdef), `"position"` \| `"annotations"` \| `"enumType"` \| `"members"` \| `"name"`\>\> & `object` = `{}`

###### Returns

[`EnumDef`](core.md#enumdef)

##### enumMember()

> **enumMember**(`name`, `value`, `overrides?`): [`EnumMember`](core.md#enummember)

Creates an `EnumMember` with the given name and literal value.

Pass `overrides` to set `annotations` or `doc`.

###### Parameters

###### name

`string`

###### value

[`LiteralValue`](core.md#literalvalue)

###### overrides?

`Partial`\<`Omit`\<[`EnumMember`](core.md#enummember), `"position"` \| `"annotations"` \| `"value"` \| `"name"`\>\> & `object` = `{}`

###### Returns

[`EnumMember`](core.md#enummember)

##### enumType()

> **enumType**(`name`, `enumType`): [`TypeRef`](core.md#typeref-3)

Creates a `TypeRef` that references a named enum type.

###### Parameters

###### name

`string`

###### enumType

[`EnumValueType`](core.md#enumvaluetype)

###### Returns

[`TypeRef`](core.md#typeref-3)

##### field()

> **field**(`name`, `typeRef`, `overrides?`): [`Field`](core.md#field)

Creates a `Field` with the given name and type.

Pass `overrides` to set `optional`, `annotations`, or `doc`.

###### Parameters

###### name

`string`

###### typeRef

[`TypeRef`](core.md#typeref-3)

###### overrides?

`Partial`\<`Omit`\<[`Field`](core.md#field), `"position"` \| `"annotations"` \| `"typeRef"` \| `"name"` \| `"optional"`\>\> & `object` = `{}`

###### Returns

[`Field`](core.md#field)

##### floatLiteral()

> **floatLiteral**(`value`): [`LiteralValue`](core.md#literalvalue)

Creates a float `LiteralValue`.

###### Parameters

###### value

`number`

###### Returns

[`LiteralValue`](core.md#literalvalue)

##### intLiteral()

> **intLiteral**(`value`): [`LiteralValue`](core.md#literalvalue)

Creates an integer `LiteralValue`.

###### Parameters

###### value

`number`

###### Returns

[`LiteralValue`](core.md#literalvalue)

##### mapType()

> **mapType**(`type`): [`TypeRef`](core.md#typeref-3)

Creates a map `TypeRef` whose value type is `type`.

###### Parameters

###### type

[`TypeRef`](core.md#typeref-3)

###### Returns

[`TypeRef`](core.md#typeref-3)

##### namedType()

> **namedType**(`name`): [`TypeRef`](core.md#typeref-3)

Creates a `TypeRef` that references a named user-defined type.

###### Parameters

###### name

`string`

###### Returns

[`TypeRef`](core.md#typeref-3)

##### objectLiteral()

> **objectLiteral**(`entries`): [`LiteralValue`](core.md#literalvalue)

Creates an object `LiteralValue` from a plain key/value record.

###### Parameters

###### entries

`Record`\<`string`, [`LiteralValue`](core.md#literalvalue)\>

###### Returns

[`LiteralValue`](core.md#literalvalue)

##### objectType()

> **objectType**(`fields`): [`TypeRef`](core.md#typeref-3)

Creates an inline object `TypeRef` with the given fields.

###### Parameters

###### fields

[`Field`](core.md#field)[]

###### Returns

[`TypeRef`](core.md#typeref-3)

##### pluginInput()

> **pluginInput**(`overrides?`): [`PluginInput`](core.md#plugininput)

Creates a `PluginInput` with a default version,
empty options, and an empty schema.

Pass `overrides` to customize any field.

###### Parameters

###### overrides?

`Partial`\<[`PluginInput`](core.md#plugininput)\> = `{}`

###### Returns

[`PluginInput`](core.md#plugininput)

##### position()

> **position**(`overrides?`): [`Position`](core.md#position-8)

Creates a `Position` with sensible defaults.

Pass `overrides` to customize specific fields.

###### Parameters

###### overrides?

`Partial`\<[`Position`](core.md#position-8)\> = `{}`

###### Returns

[`Position`](core.md#position-8)

##### primitiveType()

> **primitiveType**(`name`): [`TypeRef`](core.md#typeref-3)

Creates a primitive `TypeRef` (e.g. `string`, `int`, `bool`).

###### Parameters

###### name

[`PrimitiveType`](core.md#primitivetype)

###### Returns

[`TypeRef`](core.md#typeref-3)

##### schema()

> **schema**(`overrides?`): [`IrSchema`](core.md#irschema)

Creates an `IrSchema` with empty collections.

Pass `overrides` to populate `constants`, `enums`, `types`, or `docs`.

###### Parameters

###### overrides?

`Partial`\<[`IrSchema`](core.md#irschema)\> = `{}`

###### Returns

[`IrSchema`](core.md#irschema)

##### stringLiteral()

> **stringLiteral**(`value`): [`LiteralValue`](core.md#literalvalue)

Creates a string `LiteralValue`.

###### Parameters

###### value

`string`

###### Returns

[`LiteralValue`](core.md#literalvalue)

##### typeDef()

> **typeDef**(`name`, `typeRef`, `overrides?`): [`TypeDef`](core.md#typedef)

Creates a `TypeDef` with the given name and underlying type.

Pass `overrides` to set `annotations` or `doc`.

###### Parameters

###### name

`string`

###### typeRef

[`TypeRef`](core.md#typeref-3)

###### overrides?

`Partial`\<`Omit`\<[`TypeDef`](core.md#typedef), `"position"` \| `"annotations"` \| `"typeRef"` \| `"name"`\>\> & `object` = `{}`

###### Returns

[`TypeDef`](core.md#typedef)

#### Example

```ts
const input = irb.pluginInput({
  ir: irb.schema({
    types: [
      irb.typeDef("MyType", irb.primitiveType("string"))
    ],
  }),
});
```
