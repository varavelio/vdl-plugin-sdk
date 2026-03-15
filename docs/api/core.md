# core

## Type Aliases

### Annotation

> **Annotation** = `object`

Defined in: [types/types.ts:96](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L96)

Annotation Annotation metadata preserved in IR.

`name` is the annotation identifier without the `@` prefix.
`argument`, when present, is fully resolved as a LiteralValue.

#### Properties

##### argument?

> `optional` **argument**: [`LiteralValue`](#literalvalue)

Defined in: [types/types.ts:99](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L99)

##### name

> **name**: `string`

Defined in: [types/types.ts:98](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L98)

##### position

> **position**: [`Position`](#position-8)

Defined in: [types/types.ts:97](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L97)

***

### ConstantDef

> **ConstantDef** = `object`

Defined in: [types/types.ts:141](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L141)

ConstantDef Fully resolved constant definition.

`typeRef` is explicit or inferred by analysis.
`value` contains the fully resolved literal payload.

#### Properties

##### annotations

> **annotations**: [`Annotation`](#annotation)[]

Defined in: [types/types.ts:145](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L145)

##### doc?

> `optional` **doc**: `string`

Defined in: [types/types.ts:144](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L144)

##### name

> **name**: `string`

Defined in: [types/types.ts:143](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L143)

##### position

> **position**: [`Position`](#position-8)

Defined in: [types/types.ts:142](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L142)

##### typeRef

> **typeRef**: [`TypeRef`](#typeref-3)

Defined in: [types/types.ts:146](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L146)

##### value

> **value**: [`LiteralValue`](#literalvalue)

Defined in: [types/types.ts:147](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L147)

***

### EnumDef

> **EnumDef** = `object`

Defined in: [types/types.ts:216](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L216)

EnumDef Flattened enum definition.

All enum spreads are already expanded into `members`.

#### Properties

##### annotations

> **annotations**: [`Annotation`](#annotation)[]

Defined in: [types/types.ts:220](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L220)

##### doc?

> `optional` **doc**: `string`

Defined in: [types/types.ts:219](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L219)

##### enumType

> **enumType**: [`EnumValueType`](#enumvaluetype)

Defined in: [types/types.ts:221](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L221)

##### members

> **members**: [`EnumMember`](#enummember)[]

Defined in: [types/types.ts:222](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L222)

##### name

> **name**: `string`

Defined in: [types/types.ts:218](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L218)

##### position

> **position**: [`Position`](#position-8)

Defined in: [types/types.ts:217](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L217)

***

### EnumMember

> **EnumMember** = `object`

Defined in: [types/types.ts:297](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L297)

EnumMember Enum member definition

#### Properties

##### annotations

> **annotations**: [`Annotation`](#annotation)[]

Defined in: [types/types.ts:302](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L302)

##### doc?

> `optional` **doc**: `string`

Defined in: [types/types.ts:301](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L301)

##### name

> **name**: `string`

Defined in: [types/types.ts:299](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L299)

##### position

> **position**: [`Position`](#position-8)

Defined in: [types/types.ts:298](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L298)

##### value

> **value**: [`LiteralValue`](#literalvalue)

Defined in: [types/types.ts:300](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L300)

***

### EnumValueType

> **EnumValueType** = `"string"` \| `"int"`

Defined in: [types/types.ts:17](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L17)

Underlying storage kind used by an enum

***

### Field

> **Field** = `object`

Defined in: [types/types.ts:360](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L360)

Field Flattened object/type field definition

#### Properties

##### annotations

> **annotations**: [`Annotation`](#annotation)[]

Defined in: [types/types.ts:365](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L365)

##### doc?

> `optional` **doc**: `string`

Defined in: [types/types.ts:363](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L363)

##### name

> **name**: `string`

Defined in: [types/types.ts:362](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L362)

##### optional

> **optional**: `boolean`

Defined in: [types/types.ts:364](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L364)

##### position

> **position**: [`Position`](#position-8)

Defined in: [types/types.ts:361](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L361)

##### typeRef

> **typeRef**: [`TypeRef`](#typeref-3)

Defined in: [types/types.ts:366](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L366)

***

### IrSchema

> **IrSchema** = `object`

Defined in: [types/types.ts:435](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L435)

IrSchema IrSchema is the generator-facing representation of a VDL program.

This model is intentionally "flat" and "resolved":

- spreads are already expanded
- references are already resolved
- collections are in deterministic order

A code generator should be able to consume IrSchema directly, without needing
to re-run parser or semantic-analysis logic.

#### Properties

##### constants

> **constants**: [`ConstantDef`](#constantdef)[]

Defined in: [types/types.ts:437](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L437)

##### docs

> **docs**: [`TopLevelDoc`](#topleveldoc)[]

Defined in: [types/types.ts:440](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L440)

##### entryPoint

> **entryPoint**: `string`

Defined in: [types/types.ts:436](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L436)

##### enums

> **enums**: [`EnumDef`](#enumdef)[]

Defined in: [types/types.ts:438](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L438)

##### types

> **types**: [`TypeDef`](#typedef)[]

Defined in: [types/types.ts:439](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L439)

***

### LiteralKind

> **LiteralKind** = `"string"` \| `"int"` \| `"float"` \| `"bool"` \| `"object"` \| `"array"`

Defined in: [types/types.ts:36](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L36)

Kind discriminator for LiteralValue.

LiteralValue is used for fully resolved literal data in:

- constant values
- annotation arguments

***

### LiteralValue

> **LiteralValue** = `object`

Defined in: [types/types.ts:535](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L535)

LiteralValue Fully resolved literal value.

The selected payload is determined by `kind`:

- `string` -> `stringValue`
- `int` -> `intValue`
- `float` -> `floatValue`
- `bool` -> `boolValue`
- `object` -> `objectEntries`
- `array` -> `arrayItems`

#### Properties

##### arrayItems?

> `optional` **arrayItems**: [`LiteralValue`](#literalvalue)[]

Defined in: [types/types.ts:543](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L543)

##### boolValue?

> `optional` **boolValue**: `boolean`

Defined in: [types/types.ts:541](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L541)

##### floatValue?

> `optional` **floatValue**: `number`

Defined in: [types/types.ts:540](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L540)

##### intValue?

> `optional` **intValue**: `number`

Defined in: [types/types.ts:539](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L539)

##### kind

> **kind**: [`LiteralKind`](#literalkind)

Defined in: [types/types.ts:537](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L537)

##### objectEntries?

> `optional` **objectEntries**: [`ObjectEntry`](#objectentry)[]

Defined in: [types/types.ts:542](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L542)

##### position

> **position**: [`Position`](#position-8)

Defined in: [types/types.ts:536](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L536)

##### stringValue?

> `optional` **stringValue**: `string`

Defined in: [types/types.ts:538](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L538)

***

### ObjectEntry

> **ObjectEntry** = `object`

Defined in: [types/types.ts:620](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L620)

ObjectEntry Key/value pair inside an object LiteralValue payload

#### Properties

##### key

> **key**: `string`

Defined in: [types/types.ts:622](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L622)

##### position

> **position**: [`Position`](#position-8)

Defined in: [types/types.ts:621](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L621)

##### value

> **value**: [`LiteralValue`](#literalvalue)

Defined in: [types/types.ts:623](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L623)

***

### PluginInput

> **PluginInput** = `object`

Defined in: [types/types.ts:667](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L667)

PluginInput PluginInput represents the data payload sent to a plugin.

The plugin receives this as a single argument containing the complete
Intermediate Representation of the VDL schema along with any user-defined
configuration options from `vdl.config.vdl`.

#### Properties

##### ir

> **ir**: [`IrSchema`](#irschema)

Defined in: [types/types.ts:669](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L669)

##### options

> **options**: `Record`\<`string`, `string`\>

Defined in: [types/types.ts:670](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L670)

##### version

> **version**: `string`

Defined in: [types/types.ts:668](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L668)

***

### PluginOutput

> **PluginOutput** = `object`

Defined in: [types/types.ts:710](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L710)

PluginOutput PluginOutput represents the response payload returned by the `plugin` function.

After processing the input schema, the plugin outputs this object containing
all files to be generated or errors to be displayed to the user.

If there are no errors and at least one file is returned, VDL will write each
file to the specified path within the output directory. If there are errors,
VDL will display them to the user and not write any files.

#### Properties

##### errors?

> `optional` **errors**: [`PluginOutputError`](#pluginoutputerror)[]

Defined in: [types/types.ts:712](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L712)

##### files?

> `optional` **files**: [`PluginOutputFile`](#pluginoutputfile)[]

Defined in: [types/types.ts:711](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L711)

***

### PluginOutputError

> **PluginOutputError** = `object`

Defined in: [types/types.ts:762](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L762)

PluginOutputError A structured error reported by the plugin.

#### Properties

##### message

> **message**: `string`

Defined in: [types/types.ts:763](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L763)

##### position?

> `optional` **position**: [`Position`](#position-8)

Defined in: [types/types.ts:764](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L764)

***

### PluginOutputFile

> **PluginOutputFile** = `object`

Defined in: [types/types.ts:798](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L798)

PluginOutputFile PluginOutputFile represents a single generated file produced by the plugin.

This abstraction allows plugins to generate multiple files from a single
invocation, enabling patterns like one-file-per-type or splitting large
outputs across multiple modules.

#### Properties

##### content

> **content**: `string`

Defined in: [types/types.ts:800](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L800)

##### path

> **path**: `string`

Defined in: [types/types.ts:799](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L799)

***

### Position

> **Position** = `object`

Defined in: [types/types.ts:820](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L820)

Position It represents a position within a file and is used for error
reporting, diagnostics, plugins, and tooling support.

#### Properties

##### column

> **column**: `number`

Defined in: [types/types.ts:823](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L823)

##### file

> **file**: `string`

Defined in: [types/types.ts:821](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L821)

##### line

> **line**: `number`

Defined in: [types/types.ts:822](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L822)

***

### PrimitiveType

> **PrimitiveType** = `"string"` \| `"int"` \| `"float"` \| `"bool"` \| `"datetime"`

Defined in: [types/types.ts:54](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L54)

Primitive scalar type names

***

### TopLevelDoc

> **TopLevelDoc** = `object`

Defined in: [types/types.ts:846](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L846)

TopLevelDoc Standalone documentation block.

Used for top-level docstrings that are not attached to a type/enum/constant.

#### Properties

##### content

> **content**: `string`

Defined in: [types/types.ts:848](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L848)

##### position

> **position**: [`Position`](#position-8)

Defined in: [types/types.ts:847](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L847)

***

### TypeDef

> **TypeDef** = `object`

Defined in: [types/types.ts:882](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L882)

TypeDef Flattened type definition.

All spreads are already expanded. The unified `typeRef` describes what this
type IS, a primitive, custom reference, map, array, or object with fields.

#### Properties

##### annotations

> **annotations**: [`Annotation`](#annotation)[]

Defined in: [types/types.ts:886](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L886)

##### doc?

> `optional` **doc**: `string`

Defined in: [types/types.ts:885](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L885)

##### name

> **name**: `string`

Defined in: [types/types.ts:884](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L884)

##### position

> **position**: [`Position`](#position-8)

Defined in: [types/types.ts:883](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L883)

##### typeRef

> **typeRef**: [`TypeRef`](#typeref-3)

Defined in: [types/types.ts:887](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L887)

***

### TypeKind

> **TypeKind** = `"primitive"` \| `"type"` \| `"enum"` \| `"array"` \| `"map"` \| `"object"`

Defined in: [types/types.ts:71](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L71)

Kind discriminator for TypeRef

***

### TypeRef

> **TypeRef** = `object`

Defined in: [types/types.ts:948](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L948)

TypeRef Normalized type reference used by fields and constants.

`kind` selects which payload fields are meaningful. Generators should inspect
`kind` first, then read the related payload fields.

#### Properties

##### arrayDims?

> `optional` **arrayDims**: `number`

Defined in: [types/types.ts:955](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L955)

##### arrayType?

> `optional` **arrayType**: [`TypeRef`](#typeref-3)

Defined in: [types/types.ts:954](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L954)

##### enumName?

> `optional` **enumName**: `string`

Defined in: [types/types.ts:952](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L952)

##### enumType?

> `optional` **enumType**: [`EnumValueType`](#enumvaluetype)

Defined in: [types/types.ts:953](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L953)

##### kind

> **kind**: [`TypeKind`](#typekind)

Defined in: [types/types.ts:949](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L949)

##### mapType?

> `optional` **mapType**: [`TypeRef`](#typeref-3)

Defined in: [types/types.ts:956](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L956)

##### objectFields?

> `optional` **objectFields**: [`Field`](#field)[]

Defined in: [types/types.ts:957](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L957)

##### primitiveName?

> `optional` **primitiveName**: [`PrimitiveType`](#primitivetype)

Defined in: [types/types.ts:950](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L950)

##### typeName?

> `optional` **typeName**: `string`

Defined in: [types/types.ts:951](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L951)

***

### VdlPluginHandler()

> **VdlPluginHandler** = (`input`) => [`PluginOutput`](#pluginoutput)

Defined in: [define-plugin.ts:9](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/define-plugin.ts#L9)

Defines a VDL plugin handler function.

#### Parameters

##### input

[`PluginInput`](#plugininput)

The input data for the plugin containing the IR and other relevant information.

#### Returns

[`PluginOutput`](#pluginoutput)

The output data from the plugin containing the generated files and any errors.

## Variables

### EnumValueTypeList

> `const` **EnumValueTypeList**: [`EnumValueType`](#enumvaluetype)[]

Defined in: [types/types.ts:19](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L19)

***

### LiteralKindList

> `const` **LiteralKindList**: [`LiteralKind`](#literalkind)[]

Defined in: [types/types.ts:38](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L38)

***

### PrimitiveTypeList

> `const` **PrimitiveTypeList**: [`PrimitiveType`](#primitivetype)[]

Defined in: [types/types.ts:56](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L56)

***

### TypeKindList

> `const` **TypeKindList**: [`TypeKind`](#typekind)[]

Defined in: [types/types.ts:73](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L73)

## Functions

### definePlugin()

> **definePlugin**(`handler`): [`VdlPluginHandler`](#vdlpluginhandler)

Defined in: [define-plugin.ts:31](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/define-plugin.ts#L31)

Defines a VDL plugin by wrapping the provided handler function. This is a helper function
that can be used to create plugins in a more concise way.

Example usage:
```typescript
import { definePlugin } from "@varavel/vdl-plugin-sdk";

export const generate = definePlugin((input) => {
 // Plugin logic goes here
 return {
   files: [],
   errors: []
 };
});
```

#### Parameters

##### handler

[`VdlPluginHandler`](#vdlpluginhandler)

The plugin handler function that contains the logic for processing the input and generating the output.

#### Returns

[`VdlPluginHandler`](#vdlpluginhandler)

The same handler function, which can be exported as the plugin's main entry point.

***

### hydrateAnnotation()

> **hydrateAnnotation**(`input`): [`Annotation`](#annotation)

Defined in: [types/types.ts:102](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L102)

#### Parameters

##### input

[`Annotation`](#annotation)

#### Returns

[`Annotation`](#annotation)

***

### hydrateConstantDef()

> **hydrateConstantDef**(`input`): [`ConstantDef`](#constantdef)

Defined in: [types/types.ts:150](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L150)

#### Parameters

##### input

[`ConstantDef`](#constantdef)

#### Returns

[`ConstantDef`](#constantdef)

***

### hydrateEnumDef()

> **hydrateEnumDef**(`input`): [`EnumDef`](#enumdef)

Defined in: [types/types.ts:225](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L225)

#### Parameters

##### input

[`EnumDef`](#enumdef)

#### Returns

[`EnumDef`](#enumdef)

***

### hydrateEnumMember()

> **hydrateEnumMember**(`input`): [`EnumMember`](#enummember)

Defined in: [types/types.ts:305](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L305)

#### Parameters

##### input

[`EnumMember`](#enummember)

#### Returns

[`EnumMember`](#enummember)

***

### hydrateField()

> **hydrateField**(`input`): [`Field`](#field)

Defined in: [types/types.ts:369](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L369)

#### Parameters

##### input

[`Field`](#field)

#### Returns

[`Field`](#field)

***

### hydrateIrSchema()

> **hydrateIrSchema**(`input`): [`IrSchema`](#irschema)

Defined in: [types/types.ts:443](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L443)

#### Parameters

##### input

[`IrSchema`](#irschema)

#### Returns

[`IrSchema`](#irschema)

***

### hydrateLiteralValue()

> **hydrateLiteralValue**(`input`): [`LiteralValue`](#literalvalue)

Defined in: [types/types.ts:546](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L546)

#### Parameters

##### input

[`LiteralValue`](#literalvalue)

#### Returns

[`LiteralValue`](#literalvalue)

***

### hydrateObjectEntry()

> **hydrateObjectEntry**(`input`): [`ObjectEntry`](#objectentry)

Defined in: [types/types.ts:626](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L626)

#### Parameters

##### input

[`ObjectEntry`](#objectentry)

#### Returns

[`ObjectEntry`](#objectentry)

***

### hydratePluginInput()

> **hydratePluginInput**(`input`): [`PluginInput`](#plugininput)

Defined in: [types/types.ts:673](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L673)

#### Parameters

##### input

[`PluginInput`](#plugininput)

#### Returns

[`PluginInput`](#plugininput)

***

### hydratePluginOutput()

> **hydratePluginOutput**(`input`): [`PluginOutput`](#pluginoutput)

Defined in: [types/types.ts:715](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L715)

#### Parameters

##### input

[`PluginOutput`](#pluginoutput)

#### Returns

[`PluginOutput`](#pluginoutput)

***

### hydratePluginOutputError()

> **hydratePluginOutputError**(`input`): [`PluginOutputError`](#pluginoutputerror)

Defined in: [types/types.ts:767](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L767)

#### Parameters

##### input

[`PluginOutputError`](#pluginoutputerror)

#### Returns

[`PluginOutputError`](#pluginoutputerror)

***

### hydratePluginOutputFile()

> **hydratePluginOutputFile**(`input`): [`PluginOutputFile`](#pluginoutputfile)

Defined in: [types/types.ts:803](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L803)

#### Parameters

##### input

[`PluginOutputFile`](#pluginoutputfile)

#### Returns

[`PluginOutputFile`](#pluginoutputfile)

***

### hydratePosition()

> **hydratePosition**(`input`): [`Position`](#position-8)

Defined in: [types/types.ts:826](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L826)

#### Parameters

##### input

[`Position`](#position-8)

#### Returns

[`Position`](#position-8)

***

### hydrateTopLevelDoc()

> **hydrateTopLevelDoc**(`input`): [`TopLevelDoc`](#topleveldoc)

Defined in: [types/types.ts:851](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L851)

#### Parameters

##### input

[`TopLevelDoc`](#topleveldoc)

#### Returns

[`TopLevelDoc`](#topleveldoc)

***

### hydrateTypeDef()

> **hydrateTypeDef**(`input`): [`TypeDef`](#typedef)

Defined in: [types/types.ts:890](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L890)

#### Parameters

##### input

[`TypeDef`](#typedef)

#### Returns

[`TypeDef`](#typedef)

***

### hydrateTypeRef()

> **hydrateTypeRef**(`input`): [`TypeRef`](#typeref-3)

Defined in: [types/types.ts:960](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L960)

#### Parameters

##### input

[`TypeRef`](#typeref-3)

#### Returns

[`TypeRef`](#typeref-3)

***

### isEnumValueType()

> **isEnumValueType**(`value`): `value is EnumValueType`

Defined in: [types/types.ts:24](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L24)

#### Parameters

##### value

`unknown`

#### Returns

`value is EnumValueType`

***

### isLiteralKind()

> **isLiteralKind**(`value`): `value is LiteralKind`

Defined in: [types/types.ts:47](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L47)

#### Parameters

##### value

`unknown`

#### Returns

`value is LiteralKind`

***

### isPrimitiveType()

> **isPrimitiveType**(`value`): `value is PrimitiveType`

Defined in: [types/types.ts:64](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L64)

#### Parameters

##### value

`unknown`

#### Returns

`value is PrimitiveType`

***

### isTypeKind()

> **isTypeKind**(`value`): `value is TypeKind`

Defined in: [types/types.ts:82](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L82)

#### Parameters

##### value

`unknown`

#### Returns

`value is TypeKind`

***

### validateAnnotation()

> **validateAnnotation**(`input`, `path?`): `string` \| `null`

Defined in: [types/types.ts:113](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L113)

#### Parameters

##### input

`unknown`

##### path?

`string` = `"Annotation"`

#### Returns

`string` \| `null`

***

### validateConstantDef()

> **validateConstantDef**(`input`, `path?`): `string` \| `null`

Defined in: [types/types.ts:167](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L167)

#### Parameters

##### input

`unknown`

##### path?

`string` = `"ConstantDef"`

#### Returns

`string` \| `null`

***

### validateEnumDef()

> **validateEnumDef**(`input`, `path?`): `string` \| `null`

Defined in: [types/types.ts:242](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L242)

#### Parameters

##### input

`unknown`

##### path?

`string` = `"EnumDef"`

#### Returns

`string` \| `null`

***

### validateEnumMember()

> **validateEnumMember**(`input`, `path?`): `string` \| `null`

Defined in: [types/types.ts:320](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L320)

#### Parameters

##### input

`unknown`

##### path?

`string` = `"EnumMember"`

#### Returns

`string` \| `null`

***

### validateField()

> **validateField**(`input`, `path?`): `string` \| `null`

Defined in: [types/types.ts:386](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L386)

#### Parameters

##### input

`unknown`

##### path?

`string` = `"Field"`

#### Returns

`string` \| `null`

***

### validateIrSchema()

> **validateIrSchema**(`input`, `path?`): `string` \| `null`

Defined in: [types/types.ts:458](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L458)

#### Parameters

##### input

`unknown`

##### path?

`string` = `"IrSchema"`

#### Returns

`string` \| `null`

***

### validateLiteralValue()

> **validateLiteralValue**(`input`, `path?`): `string` \| `null`

Defined in: [types/types.ts:567](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L567)

#### Parameters

##### input

`unknown`

##### path?

`string` = `"LiteralValue"`

#### Returns

`string` \| `null`

***

### validateObjectEntry()

> **validateObjectEntry**(`input`, `path?`): `string` \| `null`

Defined in: [types/types.ts:637](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L637)

#### Parameters

##### input

`unknown`

##### path?

`string` = `"ObjectEntry"`

#### Returns

`string` \| `null`

***

### validatePluginInput()

> **validatePluginInput**(`input`, `path?`): `string` \| `null`

Defined in: [types/types.ts:684](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L684)

#### Parameters

##### input

`unknown`

##### path?

`string` = `"PluginInput"`

#### Returns

`string` \| `null`

***

### validatePluginOutput()

> **validatePluginOutput**(`input`, `path?`): `string` \| `null`

Defined in: [types/types.ts:724](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L724)

#### Parameters

##### input

`unknown`

##### path?

`string` = `"PluginOutput"`

#### Returns

`string` \| `null`

***

### validatePluginOutputError()

> **validatePluginOutputError**(`input`, `path?`): `string` \| `null`

Defined in: [types/types.ts:776](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L776)

#### Parameters

##### input

`unknown`

##### path?

`string` = `"PluginOutputError"`

#### Returns

`string` \| `null`

***

### validatePluginOutputFile()

> **validatePluginOutputFile**(`_input`, `_path?`): `string` \| `null`

Defined in: [types/types.ts:812](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L812)

#### Parameters

##### \_input

`unknown`

##### \_path?

`string` = `"PluginOutputFile"`

#### Returns

`string` \| `null`

***

### validatePosition()

> **validatePosition**(`_input`, `_path?`): `string` \| `null`

Defined in: [types/types.ts:837](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L837)

#### Parameters

##### \_input

`unknown`

##### \_path?

`string` = `"Position"`

#### Returns

`string` \| `null`

***

### validateTopLevelDoc()

> **validateTopLevelDoc**(`input`, `path?`): `string` \| `null`

Defined in: [types/types.ts:860](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L860)

#### Parameters

##### input

`unknown`

##### path?

`string` = `"TopLevelDoc"`

#### Returns

`string` \| `null`

***

### validateTypeDef()

> **validateTypeDef**(`input`, `path?`): `string` \| `null`

Defined in: [types/types.ts:905](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L905)

#### Parameters

##### input

`unknown`

##### path?

`string` = `"TypeDef"`

#### Returns

`string` \| `null`

***

### validateTypeRef()

> **validateTypeRef**(`input`, `path?`): `string` \| `null`

Defined in: [types/types.ts:983](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/types/types.ts#L983)

#### Parameters

##### input

`unknown`

##### path?

`string` = `"TypeRef"`

#### Returns

`string` \| `null`
