# strings

## Functions

### camelCase()

> **camelCase**(`str`): `string`

Defined in: [utils/strings/camel-case.ts:21](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/strings/camel-case.ts#L21)

Converts a string to `camelCase`.

Tokenization is delegated to `words`, so mixed input styles such as
`snake_case`, `kebab-case`, `PascalCase`, `camelCase`, and separator-heavy
strings are normalized first and then reassembled.

The first token is lowercased. Every following token is capitalized with the
remainder lowercased. Empty or separator-only inputs return an empty string.

#### Parameters

##### str

`string`

#### Returns

`string`

#### Example

```ts
camelCase("user_profile-name")
// "userProfileName"
```

***

### kebabCase()

> **kebabCase**(`str`, `upperCase?`): `string`

Defined in: [utils/strings/kebab-case.ts:24](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/strings/kebab-case.ts#L24)

Converts a string to `kebab-case`.

The function tokenizes the input with `words`, lowercases every token, and
joins the result with hyphens. This allows mixed casing conventions and noisy
separators to converge into a consistent kebab-cased string.

When `upperCase` is `true`, the same tokenization and joining rules are used,
but the final tokens are uppercased instead. This is useful for constants,
identifiers, or file names that still need kebab separators.

Empty or separator-only inputs return an empty string.

#### Parameters

##### str

`string`

##### upperCase?

`boolean` = `false`

#### Returns

`string`

#### Examples

```ts
kebabCase("UserProfileName")
// "user-profile-name"
```

```ts
kebabCase("UserProfileName", true)
// "USER-PROFILE-NAME"
```

***

### lowerCase()

> **lowerCase**(`str`): `string`

Defined in: [utils/strings/lower-case.ts:16](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/strings/lower-case.ts#L16)

Converts a string to lowercase words separated by spaces.

The input is normalized with `words`, then each token is lowercased and
joined using a single space. This is useful when a readable, sentence-like
representation is preferred over identifier-style separators.

Empty or separator-only inputs return an empty string.

#### Parameters

##### str

`string`

#### Returns

`string`

#### Example

```ts
lowerCase("userProfileName")
// "user profile name"
```

***

### pad()

> **pad**(`str`, `length`, `chars?`): `string`

Defined in: [utils/strings/pad.ts:25](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/strings/pad.ts#L25)

Pads both sides of a string until it reaches the requested length.

Padding is only added when the string is shorter than `length`. The padding
pattern repeats as needed and is truncated to fit exactly. When the total
number of padding characters cannot be split evenly, the right side receives
one more character than the left side.

By default, spaces are used as padding. Pass `chars` to use a custom padding
pattern. If `chars` is an empty string, the input is returned unchanged.

The target length is truncated with `Math.trunc`, so decimal lengths behave
predictably. Non-finite lengths are ignored and return the original string.

#### Parameters

##### str

`string`

##### length

`number`

##### chars?

`string`

#### Returns

`string`

#### Examples

```ts
pad("cat", 7)
// "  cat  "
```

```ts
pad("cat", 8, "_-")
// "_-cat_-_"
```

***

### padLeft()

> **padLeft**(`str`, `length`, `chars?`): `string`

Defined in: [utils/strings/pad-left.ts:19](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/strings/pad-left.ts#L19)

Pads the left side of a string until it reaches the requested length.

Padding is added only when the string is shorter than `length`. The padding
pattern repeats as needed and is truncated to fit exactly.

By default, spaces are used as padding. Pass `chars` to use a custom padding
pattern. If `chars` is an empty string, the input is returned unchanged.

The target length is truncated with `Math.trunc`, and non-finite lengths are
ignored by returning the original string.

#### Parameters

##### str

`string`

##### length

`number`

##### chars?

`string`

#### Returns

`string`

#### Example

```ts
padLeft("cat", 5, "0")
// "00cat"
```

***

### padRight()

> **padRight**(`str`, `length`, `chars?`): `string`

Defined in: [utils/strings/pad-right.ts:19](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/strings/pad-right.ts#L19)

Pads the right side of a string until it reaches the requested length.

Padding is added only when the string is shorter than `length`. The padding
pattern repeats as needed and is truncated to fit exactly.

By default, spaces are used as padding. Pass `chars` to use a custom padding
pattern. If `chars` is an empty string, the input is returned unchanged.

The target length is truncated with `Math.trunc`, and non-finite lengths are
ignored by returning the original string.

#### Parameters

##### str

`string`

##### length

`number`

##### chars?

`string`

#### Returns

`string`

#### Example

```ts
padRight("cat", 5, "0")
// "cat00"
```

***

### pascalCase()

> **pascalCase**(`str`): `string`

Defined in: [utils/strings/pascal-case.ts:21](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/strings/pascal-case.ts#L21)

Converts a string to `PascalCase`.

The input is first tokenized with `words`, allowing the function to accept a
wide range of source formats such as `snake_case`, `kebab-case`, spaced
strings, `camelCase`, or acronym-heavy identifiers.

Every token is normalized to an initial uppercase letter followed by a
lowercased remainder. Empty or separator-only inputs return an empty string.

#### Parameters

##### str

`string`

#### Returns

`string`

#### Example

```ts
pascalCase("user_profile-name")
// "UserProfileName"
```

***

### snakeCase()

> **snakeCase**(`str`, `upperCase?`): `string`

Defined in: [utils/strings/snake\_case.ts:24](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/strings/snake_case.ts#L24)

Converts a string to `snake_case`.

The input is tokenized with `words`, each token is lowercased, and the final
string is joined with underscores. This keeps the behavior aligned with the
shared SDK word-splitting rules.

When `upperCase` is `true`, the same tokenization and joining behavior is
preserved but the final tokens are uppercased instead. This is useful for
environment variable names and constant-like identifiers.

Empty or separator-only inputs return an empty string.

#### Parameters

##### str

`string`

##### upperCase?

`boolean` = `false`

#### Returns

`string`

#### Examples

```ts
snakeCase("UserProfileName")
// "user_profile_name"
```

```ts
snakeCase("UserProfileName", true)
// "USER_PROFILE_NAME"
```

***

### trim()

> **trim**(`str`, `chars?`): `string`

Defined in: [utils/strings/trim.ts:26](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/strings/trim.ts#L26)

Removes matching characters from both ends of a string.

By default, the function trims leading and trailing whitespace using the
platform's built-in whitespace semantics.

When `chars` is provided, only those characters are trimmed from the start
and end of the string. A string value is interpreted as a set of individual
characters, and an array combines all characters from all entries.
For example, `trim("__value--", "_-")` and
`trim("__value--", ["_", "-"])` both return `"value"`.

Characters are removed only at the outer edges; matching characters inside
the string are preserved.

#### Parameters

##### str

`string`

##### chars?

`string` | readonly `string`[]

#### Returns

`string`

#### Examples

```ts
trim("  hello  ")
// "hello"
```

```ts
trim("__hello--", ["_", "-"])
// "hello"
```

***

### trimEnd()

> **trimEnd**(`str`, `chars?`): `string`

Defined in: [utils/strings/trim-end.ts:23](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/strings/trim-end.ts#L23)

Removes matching characters from the end of a string.

By default, the function trims trailing whitespace using the platform's
built-in whitespace semantics.

When `chars` is provided, only those characters are removed from the end.
A string value is interpreted as a set of individual characters, and an
array combines all characters from all entries.

Matching characters that appear earlier in the string are preserved.

#### Parameters

##### str

`string`

##### chars?

`string` | readonly `string`[]

#### Returns

`string`

#### Examples

```ts
trimEnd("  hello  ")
// "  hello"
```

```ts
trimEnd("__hello__", "_")
// "__hello"
```

***

### trimStart()

> **trimStart**(`str`, `chars?`): `string`

Defined in: [utils/strings/trim-start.ts:23](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/strings/trim-start.ts#L23)

Removes matching characters from the start of a string.

By default, the function trims leading whitespace using the platform's
built-in whitespace semantics.

When `chars` is provided, only those characters are removed from the start.
A string value is interpreted as a set of individual characters, and an
array combines all characters from all entries.

Matching characters that appear later in the string are preserved.

#### Parameters

##### str

`string`

##### chars?

`string` | readonly `string`[]

#### Returns

`string`

#### Examples

```ts
trimStart("  hello  ")
// "hello  "
```

```ts
trimStart("__hello__", "_")
// "hello__"
```

***

### upperCase()

> **upperCase**(`str`): `string`

Defined in: [utils/strings/upper-case.ts:16](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/strings/upper-case.ts#L16)

Converts a string to uppercase words separated by spaces.

The input is normalized with `words`, then each token is uppercased and
joined using a single space. This is useful for readable labels, headings,
or enum-like display values derived from mixed naming conventions.

Empty or separator-only inputs return an empty string.

#### Parameters

##### str

`string`

#### Returns

`string`

#### Example

```ts
upperCase("userProfileName")
// "USER PROFILE NAME"
```

***

### words()

> **words**(`str`): `string`[]

Defined in: [utils/strings/words.ts:19](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/strings/words.ts#L19)

Splits a string into normalized word tokens.

The function preserves the current tokenization rules used by the SDK:
it inserts spaces at camelCase and acronym-to-word boundaries, converts any
non-alphanumeric separator to a space, trims the result, and then splits on
whitespace.

This makes it suitable for inputs such as `camelCase`, `PascalCase`,
`HTTPServer`, `snake_case`, `kebab-case`, and mixed separator variants.

Empty or separator-only inputs return an empty array.

#### Parameters

##### str

`string`

#### Returns

`string`[]
