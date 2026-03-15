# predicates

## Variables

### isBoolean

> `const` **isBoolean**: *typeof* `esToolkit_isBoolean` = `esToolkit_isBoolean`

Defined in: [utils/predicates/es-toolkit.ts:56](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/predicates/es-toolkit.ts#L56)

Checks if the given value is boolean.

This function tests whether the provided value is strictly `boolean`.
It returns `true` if the value is `boolean`, and `false` otherwise.

This function can also serve as a type predicate in TypeScript, narrowing the type of the argument to `boolean`.

#### Param

The Value to test if it is boolean.

#### Returns

True if the value is boolean, false otherwise.

#### Example

```ts
const value1 = true;
const value2 = 0;
const value3 = 'abc';

console.log(isBoolean(value1)); // true
console.log(isBoolean(value2)); // false
console.log(isBoolean(value3)); // false
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### isDate

> `const` **isDate**: *typeof* `esToolkit_isDate` = `esToolkit_isDate`

Defined in: [utils/predicates/es-toolkit.ts:73](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/predicates/es-toolkit.ts#L73)

Checks if `value` is a Date object.

#### Param

The value to check.

#### Returns

Returns `true` if `value` is a Date object, `false` otherwise.

#### Example

```ts
const value1 = new Date();
const value2 = '2024-01-01';

console.log(isDate(value1)); // true
console.log(isDate(value2)); // false
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### isEmptyObject

> `const` **isEmptyObject**: *typeof* `esToolkit_isEmptyObject` = `esToolkit_isEmptyObject`

Defined in: [utils/predicates/es-toolkit.ts:89](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/predicates/es-toolkit.ts#L89)

Checks if a value is an empty plain object.

#### Param

The value to check.

#### Returns

- True if the value is an empty plain object, otherwise false.

#### Example

```ts
isEmptyObject({}); // true
isEmptyObject({ a: 1 }); // false
isEmptyObject([]); // false
isEmptyObject(null); // false
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### isEqual

> `const` **isEqual**: *typeof* `esToolkit_isEqual` = `esToolkit_isEqual`

Defined in: [utils/predicates/es-toolkit.ts:108](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/predicates/es-toolkit.ts#L108)

Checks if two values are equal, including support for `Date`, `RegExp`, and deep object comparison.

#### Param

The first value to compare.

#### Param

The second value to compare.

#### Returns

`true` if the values are equal, otherwise `false`.

#### Example

```ts
isEqual(1, 1); // true
isEqual({ a: 1 }, { a: 1 }); // true
isEqual(/abc/g, /abc/g); // true
isEqual(new Date('2020-01-01'), new Date('2020-01-01')); // true
isEqual([1, 2, 3], [1, 2, 3]); // true
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### isError

> `const` **isError**: *typeof* `esToolkit_isError` = `esToolkit_isError`

Defined in: [utils/predicates/es-toolkit.ts:125](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/predicates/es-toolkit.ts#L125)

Checks if `value` is an Error object.

#### Param

The value to check.

#### Returns

Returns `true` if `value` is an Error object, `false` otherwise.

#### Example

```typescript
console.log(isError(new Error())); // true
console.log(isError('Error')); // false
console.log(isError({ name: 'Error', message: '' })); // false
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### isFunction

> `const` **isFunction**: *typeof* `esToolkit_isFunction` = `esToolkit_isFunction`

Defined in: [utils/predicates/es-toolkit.ts:142](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/predicates/es-toolkit.ts#L142)

Checks if `value` is a function.

#### Param

The value to check.

#### Returns

Returns `true` if `value` is a function, else `false`.

#### Example

```ts
isFunction(Array.prototype.slice); // true
isFunction(async function () {}); // true
isFunction(function* () {}); // true
isFunction(Proxy); // true
isFunction(Int8Array); // true
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### isJSON

> `const` **isJSON**: *typeof* `esToolkit_isJSON` = `esToolkit_isJSON`

Defined in: [utils/predicates/es-toolkit.ts:174](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/predicates/es-toolkit.ts#L174)

Checks if a given value is a valid JSON string.

A valid JSON string is one that can be successfully parsed using `JSON.parse()`. According to JSON
specifications, valid JSON can represent:
- Objects (with string keys and valid JSON values)
- Arrays (containing valid JSON values)
- Strings
- Numbers
- Booleans
- null

String values like `"null"`, `"true"`, `"false"`, and numeric strings (e.g., `"42"`) are considered
valid JSON and will return true.

This function serves as a type guard in TypeScript, narrowing the type of the argument to `string`.

#### Param

The value to check.

#### Returns

Returns `true` if `value` is a valid JSON string, else `false`.

#### Example

```ts
isJSON('{"name":"John","age":30}'); // true
isJSON('[1,2,3]'); // true
isJSON('true'); // true
isJSON('invalid json'); // false
isJSON({ name: 'John' }); // false (not a string)
isJSON(null); // false (not a string)
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### isJSONArray

> `const` **isJSONArray**: *typeof* `esToolkit_isJSONArray` = `esToolkit_isJSONArray`

Defined in: [utils/predicates/es-toolkit.ts:202](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/predicates/es-toolkit.ts#L202)

Checks if a given value is a valid JSON value.

A valid JSON value can be:
- null
- a JSON object (an object with string keys and valid JSON values)
- a JSON array (an array of valid JSON values)
- a string
- a number
- a boolean

#### Param

The value to check.

#### Returns

- True if the value is a valid JSON value, otherwise false.

#### Example

```ts
console.log(isJSONValue(null)); // true
console.log(isJSONValue({ key: "value" })); // true
console.log(isJSONValue([1, 2, 3])); // true
console.log(isJSONValue("Hello")); // true
console.log(isJSONValue(42)); // true
console.log(isJSONValue(true)); // true
console.log(isJSONValue(undefined)); // false
console.log(isJSONValue(() => {})); // false
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### isJSONObject

> `const` **isJSONObject**: *typeof* `esToolkit_isJSONObject` = `esToolkit_isJSONObject`

Defined in: [utils/predicates/es-toolkit.ts:230](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/predicates/es-toolkit.ts#L230)

Checks if a given value is a valid JSON value.

A valid JSON value can be:
- null
- a JSON object (an object with string keys and valid JSON values)
- a JSON array (an array of valid JSON values)
- a string
- a number
- a boolean

#### Param

The value to check.

#### Returns

- True if the value is a valid JSON value, otherwise false.

#### Example

```ts
console.log(isJSONValue(null)); // true
console.log(isJSONValue({ key: "value" })); // true
console.log(isJSONValue([1, 2, 3])); // true
console.log(isJSONValue("Hello")); // true
console.log(isJSONValue(42)); // true
console.log(isJSONValue(true)); // true
console.log(isJSONValue(undefined)); // false
console.log(isJSONValue(() => {})); // false
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### isJSONValue

> `const` **isJSONValue**: *typeof* `esToolkit_isJSONValue` = `esToolkit_isJSONValue`

Defined in: [utils/predicates/es-toolkit.ts:259](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/predicates/es-toolkit.ts#L259)

Checks if a given value is a valid JSON value.

A valid JSON value can be:
- null
- a JSON object (an object with string keys and valid JSON values)
- a JSON array (an array of valid JSON values)
- a string
- a number
- a boolean

#### Param

The value to check.

#### Returns

- True if the value is a valid JSON value, otherwise false.

#### Example

```ts
console.log(isJSONValue(null)); // true
console.log(isJSONValue({ key: "value" })); // true
console.log(isJSONValue([1, 2, 3])); // true
console.log(isJSONValue("Hello")); // true
console.log(isJSONValue(42)); // true
console.log(isJSONValue(true)); // true
console.log(isJSONValue(undefined)); // false
console.log(isJSONValue(() => {})); // false
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### isMap

> `const` **isMap**: *typeof* `esToolkit_isMap` = `esToolkit_isMap`

Defined in: [utils/predicates/es-toolkit.ts:280](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/predicates/es-toolkit.ts#L280)

Checks if a given value is `Map`.

This function can also serve as a type predicate in TypeScript, narrowing the type of the argument to `Map`.

#### Param

The value to check if it is a `Map`.

#### Returns

Returns `true` if `value` is a `Map`, else `false`.

#### Example

```ts
const value1 = new Map();
const value2 = new Set();
const value3 = new WeakMap();

console.log(isMap(value1)); // true
console.log(isMap(value2)); // false
console.log(isMap(value3)); // false
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### isNil

> `const` **isNil**: *typeof* `esToolkit_isNil` = `esToolkit_isNil`

Defined in: [utils/predicates/es-toolkit.ts:303](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/predicates/es-toolkit.ts#L303)

Checks if a given value is null or undefined.

This function tests whether the provided value is either `null` or `undefined`.
It returns `true` if the value is `null` or `undefined`, and `false` otherwise.

This function can also serve as a type predicate in TypeScript, narrowing the type of the argument to `null` or `undefined`.

#### Param

The value to test for null or undefined.

#### Returns

`true` if the value is null or undefined, `false` otherwise.

#### Example

```ts
const value1 = null;
const value2 = undefined;
const value3 = 42;
const result1 = isNil(value1); // true
const result2 = isNil(value2); // true
const result3 = isNil(value3); // false
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### isNotNil

> `const` **isNotNil**: *typeof* `esToolkit_isNotNil` = `esToolkit_isNotNil`

Defined in: [utils/predicates/es-toolkit.ts:323](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/predicates/es-toolkit.ts#L323)

Checks if the given value is not null nor undefined.

The main use of this function is to be used with TypeScript as a type predicate.

#### Template

The type of value.

#### Param

The value to test if it is not null nor undefined.

#### Returns

True if the value is not null nor undefined, false otherwise.

#### Example

```ts
// Here the type of `arr` is (number | undefined)[]
const arr = [1, undefined, 3];
// Here the type of `result` is number[]
const result = arr.filter(isNotNil);
// result will be [1, 3]
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### isNull

> `const` **isNull**: *typeof* `esToolkit_isNull` = `esToolkit_isNull`

Defined in: [utils/predicates/es-toolkit.ts:347](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/predicates/es-toolkit.ts#L347)

Checks if the given value is null.

This function tests whether the provided value is strictly equal to `null`.
It returns `true` if the value is `null`, and `false` otherwise.

This function can also serve as a type predicate in TypeScript, narrowing the type of the argument to `null`.

#### Param

The value to test if it is null.

#### Returns

True if the value is null, false otherwise.

#### Example

```ts
const value1 = null;
const value2 = undefined;
const value3 = 42;

console.log(isNull(value1)); // true
console.log(isNull(value2)); // false
console.log(isNull(value3)); // false
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### isNumber

> `const` **isNumber**: *typeof* `esToolkit_isNumber` = `esToolkit_isNumber`

Defined in: [utils/predicates/es-toolkit.ts:372](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/predicates/es-toolkit.ts#L372)

Checks if the given value is a number.

This function tests whether the provided value is strictly a `number`.
It returns `true` if the value is a `number`, and `false` otherwise.

This function can also serve as a type predicate in TypeScript, narrowing the type of the argument to `number`.

#### Param

The value to test if it is a number.

#### Returns

True if the value is a number, false otherwise.

#### Example

```ts
const value1 = 123;
const value2 = 'abc';
const value3 = true;

console.log(isNumber(value1)); // true
console.log(isNumber(value2)); // false
console.log(isNumber(value3)); // false
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### isPlainObject

> `const` **isPlainObject**: *typeof* `esToolkit_isPlainObject` = `esToolkit_isPlainObject`

Defined in: [utils/predicates/es-toolkit.ts:418](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/predicates/es-toolkit.ts#L418)

Checks if a given value is a plain object.

#### Param

The value to check.

#### Returns

- True if the value is a plain object, otherwise false.

#### Example

```typescript
// ✅👇 True

isPlainObject({ });                       // ✅
isPlainObject({ key: 'value' });          // ✅
isPlainObject({ key: new Date() });       // ✅
isPlainObject(new Object());              // ✅
isPlainObject(Object.create(null));       // ✅
isPlainObject({ nested: { key: true} });  // ✅
isPlainObject(new Proxy({}, {}));         // ✅
isPlainObject({ [Symbol('tag')]: 'A' });  // ✅

// ✅👇 (cross-realms, node context, workers, ...)
const runInNewContext = await import('node:vm').then(
    (mod) => mod.runInNewContext
);
isPlainObject(runInNewContext('({})'));   // ✅

// ❌👇 False

class Test { };
isPlainObject(new Test())           // ❌
isPlainObject(10);                  // ❌
isPlainObject(null);                // ❌
isPlainObject('hello');             // ❌
isPlainObject([]);                  // ❌
isPlainObject(new Date());          // ❌
isPlainObject(new Uint8Array([1])); // ❌
isPlainObject(Buffer.from('ABC'));  // ❌
isPlainObject(Promise.resolve({})); // ❌
isPlainObject(Object.create({}));   // ❌
isPlainObject(new (class Cls {}));  // ❌
isPlainObject(globalThis);          // ❌,
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### isPrimitive

> `const` **isPrimitive**: *typeof* `esToolkit_isPrimitive` = `esToolkit_isPrimitive`

Defined in: [utils/predicates/es-toolkit.ts:451](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/predicates/es-toolkit.ts#L451)

Checks whether a value is a JavaScript primitive.
JavaScript primitives include null, undefined, strings, numbers, booleans, symbols, and bigints.

#### Param

The value to check.

#### Returns

Returns true if `value` is a primitive, false otherwise.

#### Example

```ts
isPrimitive(null); // true
isPrimitive(undefined); // true
isPrimitive('123'); // true
isPrimitive(false); // true
isPrimitive(true); // true
isPrimitive(Symbol('a')); // true
isPrimitive(123n); // true
isPrimitive({}); // false
isPrimitive(new Date()); // false
isPrimitive(new Map()); // false
isPrimitive(new Set()); // false
isPrimitive([1, 2, 3]); // false
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### isRegExp

> `const` **isRegExp**: *typeof* `esToolkit_isRegExp` = `esToolkit_isRegExp`

Defined in: [utils/predicates/es-toolkit.ts:468](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/predicates/es-toolkit.ts#L468)

Checks if `value` is a RegExp.

#### Param

The value to check.

#### Returns

Returns `true` if `value` is a RegExp, `false` otherwise.

#### Example

```ts
const value1 = /abc/;
const value2 = '/abc/';

console.log(isRegExp(value1)); // true
console.log(isRegExp(value2)); // false
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### isSet

> `const` **isSet**: *typeof* `esToolkit_isSet` = `esToolkit_isSet`

Defined in: [utils/predicates/es-toolkit.ts:489](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/predicates/es-toolkit.ts#L489)

Checks if a given value is `Set`.

This function can also serve as a type predicate in TypeScript, narrowing the type of the argument to `Set`.

#### Param

The value to check if it is a `Set`.

#### Returns

Returns `true` if `value` is a `Set`, else `false`.

#### Example

```ts
const value1 = new Set();
const value2 = new Map();
const value3 = new WeakSet();

console.log(isSet(value1)); // true
console.log(isSet(value2)); // false
console.log(isSet(value3)); // false
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### isString

> `const` **isString**: *typeof* `esToolkit_isString` = `esToolkit_isString`

Defined in: [utils/predicates/es-toolkit.ts:510](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/predicates/es-toolkit.ts#L510)

Checks if a given value is string.

This function can also serve as a type predicate in TypeScript, narrowing the type of the argument to `string`.

#### Param

The value to check if it is string.

#### Returns

Returns `true` if `value` is a string, else `false`.

#### Example

```ts
const value1 = 'abc';
const value2 = 123;
const value3 = true;

console.log(isString(value1)); // true
console.log(isString(value2)); // false
console.log(isString(value3)); // false
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### isUndefined

> `const` **isUndefined**: *typeof* `esToolkit_isUndefined` = `esToolkit_isUndefined`

Defined in: [utils/predicates/es-toolkit.ts:534](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/predicates/es-toolkit.ts#L534)

Checks if the given value is undefined.

This function tests whether the provided value is strictly equal to `undefined`.
It returns `true` if the value is `undefined`, and `false` otherwise.

This function can also serve as a type predicate in TypeScript, narrowing the type of the argument to `undefined`.

#### Param

The value to test if it is undefined.

#### Returns

true if the value is undefined, false otherwise.

#### Example

```ts
const value1 = undefined;
const value2 = null;
const value3 = 42;

console.log(isUndefined(value1)); // true
console.log(isUndefined(value2)); // false
console.log(isUndefined(value3)); // false
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).
