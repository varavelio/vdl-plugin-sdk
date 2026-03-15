# maps

## Variables

### every

> `const` **every**: *typeof* `esToolkit_every` = `esToolkit_every`

Defined in: [utils/maps/es-toolkit.ts:48](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/maps/es-toolkit.ts#L48)

Tests whether all entries in a Map satisfy the provided predicate function.

This function iterates through all entries of the Map and checks if the predicate function
returns true for every entry. It returns true if the predicate is satisfied for all entries,
and false otherwise.

#### Template

The type of keys in the Map.

#### Template

The type of values in the Map.

#### Param

The Map to test.

#### Param

A predicate function that tests each entry.

#### Returns

true if all entries satisfy the predicate, false otherwise.

#### Example

```ts
const map = new Map([
  ['a', 10],
  ['b', 20],
  ['c', 30]
]);
const result = every(map, (value) => value > 5);
// result will be: true

const result2 = every(map, (value) => value > 15);
// result2 will be: false
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### filter

> `const` **filter**: *typeof* `esToolkit_filter` = `esToolkit_filter`

Defined in: [utils/maps/es-toolkit.ts:78](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/maps/es-toolkit.ts#L78)

Filters a Map based on a predicate function.

This function takes a Map and a predicate function, and returns a new Map containing
only the entries for which the predicate function returns true.

#### Template

The type of keys in the Map.

#### Template

The type of values in the Map.

#### Param

The Map to filter.

#### Param

A predicate function that tests each entry.

#### Returns

A new Map containing only the entries that satisfy the predicate.

#### Example

```ts
const map = new Map([
  ['a', 1],
  ['b', 2],
  ['c', 3],
  ['d', 4]
]);
const result = filter(map, (value) => value > 2);
// result will be:
// Map(2) {
//   'c' => 3,
//   'd' => 4
// }
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### findKey

> `const` **findKey**: *typeof* `esToolkit_findKey` = `esToolkit_findKey`

Defined in: [utils/maps/es-toolkit.ts:104](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/maps/es-toolkit.ts#L104)

Finds the first key in a Map for which the predicate function returns true.

This function iterates through the entries of the Map and returns the key of the first
entry for which the predicate function returns true. If no entry satisfies the predicate,
it returns undefined.

#### Template

The type of keys in the Map.

#### Template

The type of values in the Map.

#### Param

The Map to search.

#### Param

A predicate function that tests each entry.

#### Returns

The key of the first entry that satisfies the predicate, or undefined if none found.

#### Example

```ts
const map = new Map([
  ['apple', { color: 'red', quantity: 10 }],
  ['banana', { color: 'yellow', quantity: 5 }],
  ['grape', { color: 'purple', quantity: 15 }]
]);
const result = findKey(map, (value) => value.quantity > 10);
// result will be: 'grape'
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### findValue

> `const` **findValue**: *typeof* `esToolkit_findValue` = `esToolkit_findValue`

Defined in: [utils/maps/es-toolkit.ts:130](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/maps/es-toolkit.ts#L130)

Finds the first value in a Map for which the predicate function returns true.

This function iterates through the entries of the Map and returns the value of the first
entry for which the predicate function returns true. If no entry satisfies the predicate,
it returns undefined.

#### Template

The type of keys in the Map.

#### Template

The type of values in the Map.

#### Param

The Map to search.

#### Param

A predicate function that tests each entry.

#### Returns

The value of the first entry that satisfies the predicate, or undefined if none found.

#### Example

```ts
const map = new Map([
  ['apple', { color: 'red', quantity: 10 }],
  ['banana', { color: 'yellow', quantity: 5 }],
  ['grape', { color: 'purple', quantity: 15 }]
]);
const result = findValue(map, (value) => value.quantity > 10);
// result will be: { color: 'purple', quantity: 15 }
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### hasValue

> `const` **hasValue**: *typeof* `esToolkit_hasValue` = `esToolkit_hasValue`

Defined in: [utils/maps/es-toolkit.ts:159](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/maps/es-toolkit.ts#L159)

Checks if a Map contains a specific value.

This function iterates through all values in the Map and checks if any value
is equal to the search element using SameValueZero comparison (similar to
Array.prototype.includes). This means that NaN is considered equal to NaN.

#### Template

The type of keys in the Map.

#### Template

The type of values in the Map.

#### Param

The Map to search.

#### Param

The value to search for.

#### Returns

true if the Map contains the value, false otherwise.

#### Example

```ts
const map = new Map([
  ['a', 1],
  ['b', 2],
  ['c', 3]
]);
const result = hasValue(map, 2);
// result will be: true

const result2 = hasValue(map, 5);
// result2 will be: false
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### mapKeys

> `const` **mapKeys**: *typeof* `esToolkit_mapKeys` = `esToolkit_mapKeys`

Defined in: [utils/maps/es-toolkit.ts:190](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/maps/es-toolkit.ts#L190)

Creates a new Map with the same values but with keys transformed by the provided function.

This function takes a Map and a function that generates a new key from each value-key pair.
It returns a new Map where the keys are the result of applying the function to each entry,
while the values remain the same.

#### Template

The type of keys in the Map.

#### Template

The type of values in the Map.

#### Param

The Map to transform.

#### Param

A function that generates a new key from a value-key pair.

#### Returns

A new Map with transformed keys and the same values.

#### Example

```ts
const map = new Map([
  ['a', 1],
  ['b', 2],
  ['c', 3]
]);
const result = mapKeys(map, (value, key) => key.toUpperCase());
// result will be:
// Map(3) {
//   'A' => 1,
//   'B' => 2,
//   'C' => 3
// }
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### mapValues

> `const` **mapValues**: *typeof* `esToolkit_mapValues` = `esToolkit_mapValues`

Defined in: [utils/maps/es-toolkit.ts:221](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/maps/es-toolkit.ts#L221)

Creates a new Map with the same keys but with values transformed by the provided function.

This function takes a Map and a function that generates a new value from each value-key pair.
It returns a new Map where the values are the result of applying the function to each entry,
while the keys remain the same.

#### Template

The type of keys in the Map.

#### Template

The type of values in the Map.

#### Param

The Map to transform.

#### Param

A function that generates a new value from a value-key pair.

#### Returns

A new Map with the same keys and transformed values.

#### Example

```ts
const map = new Map([
  ['a', 1],
  ['b', 2],
  ['c', 3]
]);
const result = mapValues(map, (value) => value * 2);
// result will be:
// Map(3) {
//   'a' => 2,
//   'b' => 4,
//   'c' => 6
// }
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### reduce

> `const` **reduce**: *typeof* `esToolkit_reduce` = `esToolkit_reduce`

Defined in: [utils/maps/es-toolkit.ts:257](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/maps/es-toolkit.ts#L257)

Reduces a Map to a single value by iterating through its entries and applying a callback function.

This function iterates through all entries of the Map and applies the callback function to each entry,
accumulating the result. If an initial value is provided, it is used as the starting accumulator value.
If no initial value is provided and the Map is empty, a TypeError is thrown.

#### Template

The type of keys in the Map.

#### Template

The type of values in the Map.

#### Param

The Map to reduce.

#### Param

A function that processes each entry and updates the accumulator.

#### Param

The initial value for the accumulator. If not provided, the first value in the Map is used.

#### Returns

The final accumulated value.

#### Throws

If the Map is empty and no initial value is provided.

#### Examples

```ts
const map = new Map([
  ['a', 1],
  ['b', 2],
  ['c', 3]
]);
const result = reduce(map, (acc, value) => acc + value, 0);
// result will be: 6
```

```ts
const map = new Map([
  ['a', 10],
  ['b', 20]
]);
const result = reduce(map, (acc, value) => acc + value);
// result will be: 30 (starts with first value 10)
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### some

> `const` **some**: *typeof* `esToolkit_some` = `esToolkit_some`

Defined in: [utils/maps/es-toolkit.ts:286](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/maps/es-toolkit.ts#L286)

Tests whether at least one entry in a Map satisfies the provided predicate function.

This function iterates through the entries of the Map and checks if the predicate function
returns true for at least one entry. It returns true if any entry satisfies the predicate,
and false otherwise.

#### Template

The type of keys in the Map.

#### Template

The type of values in the Map.

#### Param

The Map to test.

#### Param

A predicate function that tests each entry.

#### Returns

true if at least one entry satisfies the predicate, false otherwise.

#### Example

```ts
const map = new Map([
  ['a', 1],
  ['b', 2],
  ['c', 3]
]);
const result = some(map, (value) => value > 2);
// result will be: true

const result2 = some(map, (value) => value > 5);
// result2 will be: false
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).
