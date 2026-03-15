# arrays

## Variables

### at

> `const` **at**: *typeof* `esToolkit_at` = `esToolkit_at`

Defined in: [utils/arrays/es-toolkit.ts:81](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L81)

Retrieves elements from an array at the specified indices.

This function supports negative indices, which count from the end of the array.

#### Template

#### Param

The array to retrieve elements from.

#### Param

An array of indices specifying the positions of elements to retrieve.

#### Returns

A new array containing the elements at the specified indices.

#### Example

```ts
const numbers = [10, 20, 30, 40, 50];
const result = at(numbers, [1, 3, 4]);
console.log(result); // [20, 40, 50]
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### chunk

> `const` **chunk**: *typeof* `esToolkit_chunk` = `esToolkit_chunk`

Defined in: [utils/arrays/es-toolkit.ts:108](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L108)

Splits an array into smaller arrays of a specified length.

This function takes an input array and divides it into multiple smaller arrays,
each of a specified length. If the input array cannot be evenly divided,
the final sub-array will contain the remaining elements.

#### Template

The type of elements in the array.

#### Param

The array to be chunked into smaller arrays.

#### Param

The size of each smaller array. Must be a positive integer.

#### Returns

A two-dimensional array where each sub-array has a maximum length of `size`.

#### Throws

Throws an error if `size` is not a positive integer.

#### Examples

```ts
// Splits an array of numbers into sub-arrays of length 2
chunk([1, 2, 3, 4, 5], 2);
// Returns: [[1, 2], [3, 4], [5]]
```

```ts
// Splits an array of strings into sub-arrays of length 3
chunk(['a', 'b', 'c', 'd', 'e', 'f', 'g'], 3);
// Returns: [['a', 'b', 'c'], ['d', 'e', 'f'], ['g']]
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### compact

> `const` **compact**: *typeof* `esToolkit_compact` = `esToolkit_compact`

Defined in: [utils/arrays/es-toolkit.ts:123](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L123)

Removes falsey values (false, null, 0, -0, 0n, '', undefined, NaN) from an array.

#### Template

The type of elements in the array.

#### Param

The input array to remove falsey values.

#### Returns

- A new array with all falsey values removed.

#### Example

```ts
compact([0, -0, 0n, 1, false, 2, '', 3, null, undefined, 4, NaN, 5]);
Returns: [1, 2, 3, 4, 5]
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### countBy

> `const` **countBy**: *typeof* `esToolkit_countBy` = `esToolkit_countBy`

Defined in: [utils/arrays/es-toolkit.ts:160](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L160)

Count the occurrences of each item in an array
based on a transformation function.

This function takes an array and a transformation function
that converts each item in the array to a key. It then
counts the occurrences of each transformed item and returns
an object with the transformed items as keys and the counts
as values.

#### Template

The type of the items in the input array.

#### Template

The type of keys.

#### Param

The input array to count occurrences.

#### Param

The transformation function that maps each item, its index, and the array to a key.

#### Returns

An object containing the transformed items as keys and the
counts as values.

#### Examples

```ts
const array = ['a', 'b', 'c', 'a', 'b', 'a'];
const result = countBy(array, x => x);
// result will be { a: 3, b: 2, c: 1 }
```

```ts
const array = [1, 2, 3, 4, 5];
const result = countBy(array, item => item % 2 === 0 ? 'even' : 'odd');
// result will be { odd: 3, even: 2 }
```

```ts
// Using index parameter
const array = ['a', 'b', 'c', 'd'];
const result = countBy(array, (item, index) => index < 2 ? 'first' : 'rest');
// result will be { first: 2, rest: 2 }
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### difference

> `const` **difference**: *typeof* `esToolkit_difference` = `esToolkit_difference`

Defined in: [utils/arrays/es-toolkit.ts:186](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L186)

Computes the difference between two arrays.

This function takes two arrays and returns a new array containing the elements
that are present in the first array but not in the second array. It effectively
filters out any elements from the first array that also appear in the second array.

#### Template

#### Param

The array from which to derive the difference. This is the primary array
from which elements will be compared and filtered.

#### Param

The array containing elements to be excluded from the first array.
Each element in this array will be checked against the first array, and if a match is found,
that element will be excluded from the result.

#### Returns

A new array containing the elements that are present in the first array but not
in the second array.

#### Example

```ts
const array1 = [1, 2, 3, 4, 5];
const array2 = [2, 4];
const result = difference(array1, array2);
// result will be [1, 3, 5] since 2 and 4 are in both arrays and are excluded from the result.
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### differenceBy

> `const` **differenceBy**: *typeof* `esToolkit_differenceBy` = `esToolkit_differenceBy`

Defined in: [utils/arrays/es-toolkit.ts:222](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L222)

Computes the difference between two arrays after mapping their elements through a provided function.

This function takes two arrays and a mapper function. It returns a new array containing the elements
that are present in the first array but not in the second array, based on the identity calculated
by the mapper function.

Essentially, it filters out any elements from the first array that, when
mapped, match an element in the mapped version of the second array.

#### Template

U

#### Param

The primary array from which to derive the difference.

#### Param

The array containing elements to be excluded from the first array.

#### Param

The function to map the elements of both arrays. This function
is applied to each element in both arrays, and the comparison is made based on the mapped values.

#### Returns

A new array containing the elements from the first array that do not have a corresponding
mapped identity in the second array.

#### Examples

```ts
const array1 = [{ id: 1 }, { id: 2 }, { id: 3 }];
const array2 = [{ id: 2 }, { id: 4 }];
const mapper = item => item.id;
const result = differenceBy(array1, array2, mapper);
// result will be [{ id: 1 }, { id: 3 }] since the elements with id 2 are in both arrays and are excluded from the result.
```

```ts
const array1 = [{ id: 1 }, { id: 2 }, { id: 3 }];
const array2 = [2, 4];
const mapper = item => (typeof item === 'object' ? item.id : item);
const result = differenceBy(array1, array2, mapper);
// result will be [{ id: 1 }, { id: 3 }] since 2 is present in both arrays after mapping, and is excluded from the result.
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### differenceWith

> `const` **differenceWith**: *typeof* `esToolkit_differenceWith` = `esToolkit_differenceWith`

Defined in: [utils/arrays/es-toolkit.ts:255](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L255)

Computes the difference between two arrays based on a custom equality function.

This function takes two arrays and a custom comparison function. It returns a new array containing
the elements that are present in the first array but not in the second array. The comparison to determine
if elements are equal is made using the provided custom function.

#### Template

U

#### Param

The array from which to get the difference.

#### Param

The array containing elements to exclude from the first array.

#### Param

A function to determine if two items are equal.

#### Returns

A new array containing the elements from the first array that do not match any elements in the second array
according to the custom equality function.

#### Examples

```ts
const array1 = [{ id: 1 }, { id: 2 }, { id: 3 }];
const array2 = [{ id: 2 }, { id: 4 }];
const areItemsEqual = (a, b) => a.id === b.id;
const result = differenceWith(array1, array2, areItemsEqual);
// result will be [{ id: 1 }, { id: 3 }] since the elements with id 2 are considered equal and are excluded from the result.
```

```ts
const array1 = [{ id: 1 }, { id: 2 }, { id: 3 }];
const array2 = [2, 4];
const areItemsEqual = (a, b) => a.id === b;
const result = differenceWith(array1, array2, areItemsEqual);
// result will be [{ id: 1 }, { id: 3 }] since the element with id 2 is considered equal to the second array's element and is excluded from the result.
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### drop

> `const` **drop**: *typeof* `esToolkit_drop` = `esToolkit_drop`

Defined in: [utils/arrays/es-toolkit.ts:276](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L276)

Removes a specified number of elements from the beginning of an array and returns the rest.

This function takes an array and a number, and returns a new array with the specified number
of elements removed from the start.

#### Template

The type of elements in the array.

#### Param

The array from which to drop elements.

#### Param

The number of elements to drop from the beginning of the array.

#### Returns

A new array with the specified number of elements removed from the start.

#### Example

```ts
const array = [1, 2, 3, 4, 5];
const result = drop(array, 2);
// result will be [3, 4, 5] since the first two elements are dropped.
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### dropRight

> `const` **dropRight**: *typeof* `esToolkit_dropRight` = `esToolkit_dropRight`

Defined in: [utils/arrays/es-toolkit.ts:296](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L296)

Removes a specified number of elements from the end of an array and returns the rest.

This function takes an array and a number, and returns a new array with the specified number
of elements removed from the end.

#### Template

The type of elements in the array.

#### Param

The array from which to drop elements.

#### Param

The number of elements to drop from the end of the array.

#### Returns

A new array with the specified number of elements removed from the end.

#### Example

```ts
const array = [1, 2, 3, 4, 5];
const result = dropRight(array, 2);
// result will be [1, 2, 3] since the last two elements are dropped.
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### dropRightWhile

> `const` **dropRightWhile**: *typeof* `esToolkit_dropRightWhile` = `esToolkit_dropRightWhile`

Defined in: [utils/arrays/es-toolkit.ts:318](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L318)

Removes elements from the end of an array until the predicate returns false.

This function iterates over an array from the end and drops elements until the provided
predicate function returns false. It then returns a new array with the remaining elements.

#### Template

The type of elements in the array.

#### Param

The array from which to drop elements.

#### Param

A predicate function that determines
whether to continue dropping elements. The function is called with each element from the end,
and dropping continues as long as it returns true.

#### Returns

A new array with the elements remaining after the predicate returns false.

#### Example

```ts
const array = [1, 2, 3, 4, 5];
const result = dropRightWhile(array, x => x > 3);
// result will be [1, 2, 3] since elements greater than 3 are dropped from the end.
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### dropWhile

> `const` **dropWhile**: *typeof* `esToolkit_dropWhile` = `esToolkit_dropWhile`

Defined in: [utils/arrays/es-toolkit.ts:341](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L341)

Removes elements from the beginning of an array until the predicate returns false.

This function iterates over an array and drops elements from the start until the provided
predicate function returns false. It then returns a new array with the remaining elements.

#### Template

The type of elements in the array.

#### Param

The array from which to drop elements.

#### Param

A predicate function that determines
whether to continue dropping elements. The function is called with each element, and dropping
continues as long as it returns true.

#### Returns

A new array with the elements remaining after the predicate returns false.

#### Example

```ts
const array = [1, 2, 3, 4, 5];
const result = dropWhile(array, x => x < 3);
// result will be [3, 4, 5] since elements less than 3 are dropped.
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### flatMap

> `const` **flatMap**: *typeof* `esToolkit_flatMap` = `esToolkit_flatMap`

Defined in: [utils/arrays/es-toolkit.ts:365](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L365)

Maps each element in the array using the iteratee function and flattens the result up to the specified depth.

#### Template

The type of elements within the array.

#### Template

The type of elements within the returned array from the iteratee function.

#### Template

The depth to which the array should be flattened.

#### Param

The array to flatten.

#### Param

The function that produces the new array elements. It receives the element, its index, and the array.

#### Param

The depth level specifying how deep a nested array structure should be flattened. Defaults to 1.

#### Returns

The new array with the mapped and flattened elements.

#### Example

```ts
const arr = [1, 2, 3];

flatMap(arr, (item: number) => [item, item]);
// [1, 1, 2, 2, 3, 3]

flatMap(arr, (item: number) => [[item, item]], 2);
// [1, 1, 2, 2, 3, 3]
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### flatMapDeep

> `const` **flatMapDeep**: *typeof* `esToolkit_flatMapDeep` = `esToolkit_flatMapDeep`

Defined in: [utils/arrays/es-toolkit.ts:382](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L382)

Recursively maps each element in an array using a provided iteratee function and then deeply flattens the resulting array.

#### Template

The type of elements within the array.

#### Template

The type of elements within the returned array from the iteratee function.

#### Param

The array to flatten.

#### Param

The function that produces the new array elements. It receives the element, its index, and the array.

#### Returns

A new array that has been flattened.

#### Example

```ts
const result = flatMapDeep([1, 2, 3], n => [[n, n]]);
// [1, 1, 2, 2, 3, 3]
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### flatten

> `const` **flatten**: *typeof* `esToolkit_flatten` = `esToolkit_flatten`

Defined in: [utils/arrays/es-toolkit.ts:402](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L402)

Flattens an array up to the specified depth.

#### Template

The type of elements within the array.

#### Template

The depth to which the array should be flattened.

#### Param

The array to flatten.

#### Param

The depth level specifying how deep a nested array structure should be flattened. Defaults to 1.

#### Returns

A new array that has been flattened.

#### Example

```ts
const arr = flatten([1, [2, 3], [4, [5, 6]]], 1);
// Returns: [1, 2, 3, 4, [5, 6]]

const arr = flatten([1, [2, 3], [4, [5, 6]]], 2);
// Returns: [1, 2, 3, 4, 5, 6]
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### flattenDeep

> `const` **flattenDeep**: *typeof* `esToolkit_flattenDeep` = `esToolkit_flattenDeep`

Defined in: [utils/arrays/es-toolkit.ts:416](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L416)

Utility type for recursively unpacking nested array types to extract the type of the innermost element

#### Example

```ts
ExtractNestedArrayType<(number | (number | number[])[])[]>
// number

ExtractNestedArrayType<(boolean | (string | number[])[])[]>
// string | number | boolean
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### groupBy

> `const` **groupBy**: *typeof* `esToolkit_groupBy` = `esToolkit_groupBy`

Defined in: [utils/arrays/es-toolkit.ts:458](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L458)

Groups the elements of an array based on a provided key-generating function.

This function takes an array and a function that generates a key from each element. It returns
an object where the keys are the generated keys and the values are arrays of elements that share
the same key.

#### Template

The type of elements in the array.

#### Template

The type of keys.

#### Param

The array to group.

#### Param

A function that generates a key from an element, its index, and the array.

#### Returns

An object where each key is associated with an array of elements that
share that key.

#### Examples

```ts
const array = [
  { category: 'fruit', name: 'apple' },
  { category: 'fruit', name: 'banana' },
  { category: 'vegetable', name: 'carrot' }
];
const result = groupBy(array, item => item.category);
// result will be:
// {
//   fruit: [
//     { category: 'fruit', name: 'apple' },
//     { category: 'fruit', name: 'banana' }
//   ],
//   vegetable: [
//     { category: 'vegetable', name: 'carrot' }
//   ]
// }
```

```ts
// Using index parameter
const items = ['a', 'b', 'c', 'd'];
const result = groupBy(items, (item, index) => index % 2 === 0 ? 'even' : 'odd');
// result will be: { even: ['a', 'c'], odd: ['b', 'd'] }
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### head

> `const` **head**: *typeof* `esToolkit_head` = `esToolkit_head`

Defined in: [utils/arrays/es-toolkit.ts:477](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L477)

Returns the first element of an array.

This function takes an array and returns the first element of the array.
If the array is empty, the function returns `undefined`.

#### Template

The type of elements in the array.

#### Param

A non-empty array from which to get the first element.

#### Returns

The first element of the array.

#### Example

```ts
const arr = [1, 2, 3];
const firstElement = head(arr);
// firstElement will be 1
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### initial

> `const` **initial**: *typeof* `esToolkit_initial` = `esToolkit_initial`

Defined in: [utils/arrays/es-toolkit.ts:493](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L493)

Returns an empty array when the input is a tuple containing exactly one element.

#### Template

The type of the single element.

#### Param

A tuple containing exactly one element.

#### Returns

An empty array since there is only one element.

#### Example

```ts
const array = [100] as const;
const result = initial(array);
// result will be []
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### intersection

> `const` **intersection**: *typeof* `esToolkit_intersection` = `esToolkit_intersection`

Defined in: [utils/arrays/es-toolkit.ts:515](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L515)

Returns the intersection of two arrays.

This function takes two arrays and returns a new array containing the elements that are
present in both arrays. It effectively filters out any elements from the first array that
are not found in the second array.

#### Template

The type of elements in the array.

#### Param

The first array to compare.

#### Param

The second array to compare.

#### Returns

A new array containing the elements that are present in both arrays.

#### Example

```ts
const array1 = [1, 2, 3, 4, 5];
const array2 = [3, 4, 5, 6, 7];
const result = intersection(array1, array2);
// result will be [3, 4, 5] since these elements are in both arrays.
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### intersectionBy

> `const` **intersectionBy**: *typeof* `esToolkit_intersectionBy` = `esToolkit_intersectionBy`

Defined in: [utils/arrays/es-toolkit.ts:553](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L553)

Returns the intersection of two arrays based on a mapping function.

This function takes two arrays and a mapping function. It returns a new array containing
the elements from the first array that, when mapped using the provided function, have matching
mapped elements in the second array. It effectively filters out any elements from the first array
that do not have corresponding mapped values in the second array.

#### Template

The type of elements in the first array.

#### Template

The type of elements in the second array.

#### Param

The first array to compare.

#### Param

The second array to compare.

#### Param

A function to map the elements of both arrays for comparison.

#### Returns

A new array containing the elements from the first array that have corresponding mapped values in the second array.

#### Examples

```ts
const array1 = [{ id: 1 }, { id: 2 }, { id: 3 }];
const array2 = [{ id: 2 }, { id: 4 }];
const mapper = item => item.id;
const result = intersectionBy(array1, array2, mapper);
// result will be [{ id: 2 }] since only this element has a matching id in both arrays.
```

```ts
const array1 = [
  { id: 1, name: 'jane' },
  { id: 2, name: 'amy' },
  { id: 3, name: 'michael' },
];
const array2 = [2, 4];
const mapper = item => (typeof item === 'object' ? item.id : item);
const result = intersectionBy(array1, array2, mapper);
// result will be [{ id: 2, name: 'amy' }] since only this element has a matching id that is equal to seconds array's element.
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### intersectionWith

> `const` **intersectionWith**: *typeof* `esToolkit_intersectionWith` = `esToolkit_intersectionWith`

Defined in: [utils/arrays/es-toolkit.ts:592](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L592)

Returns the intersection of two arrays based on a custom equality function.

This function takes two arrays and a custom equality function. It returns a new array containing
the elements from the first array that have matching elements in the second array, as determined
by the custom equality function. It effectively filters out any elements from the first array that
do not have corresponding matches in the second array according to the equality function.

#### Template

The type of elements in the first array.

#### Template

The type of elements in the second array.

#### Param

The first array to compare.

#### Param

The second array to compare.

#### Param

A custom function to determine if two elements are equal.
This function takes two arguments, one from each array, and returns `true` if the elements are considered equal, and `false` otherwise.

#### Returns

A new array containing the elements from the first array that have corresponding matches in the second array according to the custom equality function.

#### Examples

```ts
const array1 = [{ id: 1 }, { id: 2 }, { id: 3 }];
const array2 = [{ id: 2 }, { id: 4 }];
const areItemsEqual = (a, b) => a.id === b.id;
const result = intersectionWith(array1, array2, areItemsEqual);
// result will be [{ id: 2 }] since this element has a matching id in both arrays.
```

```ts
const array1 = [
  { id: 1, name: 'jane' },
  { id: 2, name: 'amy' },
  { id: 3, name: 'michael' },
];
const array2 = [2, 4];
const areItemsEqual = (a, b) => a.id === b;
const result = intersectionWith(array1, array2, areItemsEqual);
// result will be [{ id: 2, name: 'amy' }] since this element has a matching id that is equal to seconds array's element.
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### isSubset

> `const` **isSubset**: *typeof* `esToolkit_isSubset` = `esToolkit_isSubset`

Defined in: [utils/arrays/es-toolkit.ts:620](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L620)

Checks if the `subset` array is entirely contained within the `superset` array.

#### Template

The type of elements contained in the arrays.

#### Param

The array that may contain all elements of the subset.

#### Param

The array to check against the superset.

#### Returns

- Returns `true` if all elements of the `subset` are present in the `superset`, otherwise returns `false`.

#### Examples

```typescript
const superset = [1, 2, 3, 4, 5];
const subset = [2, 3, 4];
isSubset(superset, subset); // true
```

```typescript
const superset = ['a', 'b', 'c'];
const subset = ['a', 'd'];
isSubset(superset, subset); // false
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### isSubsetWith

> `const` **isSubsetWith**: *typeof* `esToolkit_isSubsetWith` = `esToolkit_isSubsetWith`

Defined in: [utils/arrays/es-toolkit.ts:654](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L654)

Checks if the `subset` array is entirely contained within the `superset` array based on a custom equality function.

This function takes two arrays and a custom comparison function. It returns a boolean indicating
whether all elements in the subset array are present in the superset array, as determined by the provided
custom equality function.

#### Template

The type of elements contained in the arrays.

#### Param

The array that may contain all elements of the subset.

#### Param

The array to check against the superset.

#### Param

A function to determine if two items are equal.

#### Returns

- Returns `true` if all elements of the subset are present in the superset
according to the custom equality function, otherwise returns `false`.

#### Examples

```typescript
const superset = [{ id: 1 }, { id: 2 }, { id: 3 }];
const subset = [{ id: 2 }, { id: 1 }];
const areItemsEqual = (a, b) => a.id === b.id;
isSubsetWith(superset, subset, areItemsEqual); // true
```

```typescript
const superset = [{ id: 1 }, { id: 2 }, { id: 3 }];
const subset = [{ id: 4 }];
const areItemsEqual = (a, b) => a.id === b.id;
isSubsetWith(superset, subset, areItemsEqual); // false
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### keyBy

> `const` **keyBy**: *typeof* `esToolkit_keyBy` = `esToolkit_keyBy`

Defined in: [utils/arrays/es-toolkit.ts:692](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L692)

Maps each element of an array based on a provided key-generating function.

This function takes an array and a function that generates a key from each element. It returns
an object where the keys are the generated keys and the values are the corresponding elements.
If there are multiple elements generating the same key, the last element among them is used
as the value.

#### Template

The type of elements in the array.

#### Template

The type of keys.

#### Param

The array of elements to be mapped.

#### Param

A function that generates a key from an element, its index, and the array.

#### Returns

An object where keys are mapped to each element of an array.

#### Examples

```ts
const array = [
  { category: 'fruit', name: 'apple' },
  { category: 'fruit', name: 'banana' },
  { category: 'vegetable', name: 'carrot' }
];
const result = keyBy(array, item => item.category);
// result will be:
// {
//   fruit: { category: 'fruit', name: 'banana' },
//   vegetable: { category: 'vegetable', name: 'carrot' }
// }
```

```ts
// Using index parameter
const items = ['a', 'b', 'c'];
const result = keyBy(items, (item, index) => index);
// result will be: { 0: 'a', 1: 'b', 2: 'c' }
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### last

> `const` **last**: *typeof* `esToolkit_last` = `esToolkit_last`

Defined in: [utils/arrays/es-toolkit.ts:718](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L718)

Returns the last element of an array.

This function takes an array and returns the last element of the array.
If the array is empty, the function returns `undefined`.

Unlike some implementations, this function is optimized for performance
by directly accessing the last index of the array.

#### Template

The type of elements in the array.

#### Param

The array from which to get the last element.

#### Returns

The last element of the array, or `undefined` if the array is empty.

#### Example

```ts
const arr = [1, 2, 3];
const lastElement = last(arr);
// lastElement will be 3

const emptyArr: number[] = [];
const noElement = last(emptyArr);
// noElement will be undefined
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### maxBy

> `const` **maxBy**: *typeof* `esToolkit_maxBy` = `esToolkit_maxBy`

Defined in: [utils/arrays/es-toolkit.ts:742](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L742)

Finds the element in an array that has the maximum value when applying
the `getValue` function to each element.

#### Template

The type of elements in the array.

#### Param

The nonempty array of elements to search.

#### Param

A function that selects a numeric value from each element.

#### Returns

The element with the maximum value as determined by the `getValue` function.

#### Example

```ts
maxBy([{ a: 1 }, { a: 2 }, { a: 3 }], x => x.a); // Returns: { a: 3 }
maxBy([], x => x.a); // Returns: undefined
maxBy(
  [
    { name: 'john', age: 30 },
    { name: 'jane', age: 28 },
    { name: 'joe', age: 26 },
  ],
  x => x.age
); // Returns: { name: 'john', age: 30 }
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### minBy

> `const` **minBy**: *typeof* `esToolkit_minBy` = `esToolkit_minBy`

Defined in: [utils/arrays/es-toolkit.ts:766](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L766)

Finds the element in an array that has the minimum value when applying
the `getValue` function to each element.

#### Template

The type of elements in the array.

#### Param

The nonempty array of elements to search.

#### Param

A function that selects a numeric value from each element.

#### Returns

The element with the minimum value as determined by the `getValue` function.

#### Example

```ts
minBy([{ a: 1 }, { a: 2 }, { a: 3 }], x => x.a); // Returns: { a: 1 }
minBy([], x => x.a); // Returns: undefined
minBy(
  [
    { name: 'john', age: 30 },
    { name: 'jane', age: 28 },
    { name: 'joe', age: 26 },
  ],
  x => x.age
); // Returns: { name: 'joe', age: 26 }
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### orderBy

> `const` **orderBy**: *typeof* `esToolkit_orderBy` = `esToolkit_orderBy`

Defined in: [utils/arrays/es-toolkit.ts:804](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L804)

Sorts an array of objects based on the given `criteria` and their corresponding order directions.

- If you provide keys, it sorts the objects by the values of those keys.
- If you provide functions, it sorts based on the values returned by those functions.

The function returns the array of objects sorted in corresponding order directions.
If two objects have the same value for the current criterion, it uses the next criterion to determine their order.
If the number of orders is less than the number of criteria, it uses the last order for the rest of the criteria.

#### Template

The type of elements in the array.

#### Param

The array of objects to be sorted.

#### Param

The criteria for sorting. This can be an array of object keys or functions that return values used for sorting.

#### Param

An array of order directions ('asc' for ascending or 'desc' for descending).

#### Returns

- The sorted array.

#### Example

```ts
// Sort an array of objects by 'user' in ascending order and 'age' in descending order.
const users = [
  { user: 'fred', age: 48 },
  { user: 'barney', age: 34 },
  { user: 'fred', age: 40 },
  { user: 'barney', age: 36 },
];

const result = orderBy(users, [obj => obj.user, 'age'], ['asc', 'desc']);
// result will be:
// [
//   { user: 'barney', age: 36 },
//   { user: 'barney', age: 34 },
//   { user: 'fred', age: 48 },
//   { user: 'fred', age: 40 },
// ]
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### partition

> `const` **partition**: *typeof* `esToolkit_partition` = `esToolkit_partition`

Defined in: [utils/arrays/es-toolkit.ts:831](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L831)

Splits an array into two groups based on a predicate function.

This function takes an array and a predicate function. It returns a tuple of two arrays:
the first array contains elements for which the predicate function returns true, and
the second array contains elements for which the predicate function returns false.

#### Template

The type of elements in the array.

#### Template

The type being filtered for.

#### Param

The array to partition.

#### Param

A type guard that determines whether an
element should be placed in the truthy array. The function is called with each element
of the array and its index.

#### Returns

A tuple containing two arrays: the first array contains elements for
which the predicate returned true, and the second array contains elements for which the
predicate returned false.

#### Example

```ts
const array = [1, 2, 3, 4] as const;
const isEven = (x: number): x is 2 | 4 => x % 2 === 0;
const [even, odd]: [(2 | 4)[], (2 | 4)[]] = partition(array, isEven);
// even will be [2, 4], and odd will be [1, 3]
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### sortBy

> `const` **sortBy**: *typeof* `esToolkit_sortBy` = `esToolkit_sortBy`

Defined in: [utils/arrays/es-toolkit.ts:867](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L867)

Sorts an array of objects based on the given `criteria`.

- If you provide keys, it sorts the objects by the values of those keys.
- If you provide functions, it sorts based on the values returned by those functions.

The function returns the array of objects sorted in ascending order.
If two objects have the same value for the current criterion, it uses the next criterion to determine their order.

#### Template

The type of the objects in the array.

#### Param

The array of objects to be sorted.

#### Param

The criteria for sorting. This can be an array of object keys or functions that return values used for sorting.

#### Returns

- The sorted array.

#### Example

```ts
const users = [
 { user: 'foo', age: 24 },
 { user: 'bar', age: 7 },
 { user: 'foo', age: 8 },
 { user: 'bar', age: 29 },
];

sortBy(users, ['user', 'age']);
sortBy(users, [obj => obj.user, 'age']);
// results will be:
// [
//   { user : 'bar', age: 7 },
//   { user : 'bar', age: 29 },
//   { user : 'foo', age: 8 },
//   { user : 'foo', age: 24 },
// ]
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### tail

> `const` **tail**: *typeof* `esToolkit_tail` = `esToolkit_tail`

Defined in: [utils/arrays/es-toolkit.ts:883](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L883)

Returns an empty array when the input is a single-element array.

#### Template

The type of the single element in the array.

#### Param

The single-element array to process.

#### Returns

An empty array.

#### Example

```ts
const arr = [1];
const result = tail(arr);
// result will be []
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### take

> `const` **take**: *typeof* `esToolkit_take` = `esToolkit_take`

Defined in: [utils/arrays/es-toolkit.ts:915](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L915)

Returns a new array containing the first `count` elements from the input array `arr`.
If `count` is greater than the length of `arr`, the entire array is returned.

#### Template

Type of elements in the input array.

#### Param

The array to take elements from.

#### Param

The number of elements to take.

#### Param

If truthy, ignores `count` and defaults to 1.

#### Returns

A new array containing the first `count` elements from `arr`.

#### Examples

```ts
// Returns [1, 2, 3]
take([1, 2, 3, 4, 5], 3);
```

```ts
// Returns ['a', 'b']
take(['a', 'b', 'c'], 2);
```

```ts
// Returns [1, 2, 3]
take([1, 2, 3], 5);
```

```ts
// Returns [[1], [1], [1]]
const arr = [1, 2, 3];
const result = arr.map((v, i, array) => take(array, i, true));
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### takeRight

> `const` **takeRight**: *typeof* `esToolkit_takeRight` = `esToolkit_takeRight`

Defined in: [utils/arrays/es-toolkit.ts:940](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L940)

Returns a new array containing the last `count` elements from the input array `arr`.
If `count` is greater than the length of `arr`, the entire array is returned.

#### Template

The type of elements in the array.

#### Param

The array to take elements from.

#### Param

The number of elements to take.

#### Returns

A new array containing the last `count` elements from `arr`.

#### Examples

```ts
// Returns [4, 5]
takeRight([1, 2, 3, 4, 5], 2);
```

```ts
// Returns ['b', 'c']
takeRight(['a', 'b', 'c'], 2);
```

```ts
// Returns [1, 2, 3]
takeRight([1, 2, 3], 5);
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### takeRightWhile

> `const` **takeRightWhile**: *typeof* `esToolkit_takeRightWhile` = `esToolkit_takeRightWhile`

Defined in: [utils/arrays/es-toolkit.ts:966](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L966)

Takes elements from the end of the array while the predicate function returns `true`.

#### Template

Type of elements in the input array.

#### Param

The array to take elements from.

#### Param

The function invoked per element with the item, its index, and the array.

#### Returns

A new array containing the elements taken from the end while the predicate returns `true`.

#### Examples

```ts
// Returns [3, 2, 1]
takeRightWhile([5, 4, 3, 2, 1], n => n < 4);
```

```ts
// Returns []
takeRightWhile([1, 2, 3], n => n > 3);
```

```ts
// Using index parameter
takeRightWhile([10, 20, 30, 40], (x, index) => index > 1);
// Returns: [30, 40]
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### takeWhile

> `const` **takeWhile**: *typeof* `esToolkit_takeWhile` = `esToolkit_takeWhile`

Defined in: [utils/arrays/es-toolkit.ts:994](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L994)

Returns a new array containing the leading elements of the provided array
that satisfy the provided predicate function. It stops taking elements as soon
as an element does not satisfy the predicate.

#### Template

The type of elements in the array.

#### Param

The array to process.

#### Param

The predicate function that is called with each element, its index, and the array. Elements are included in the result as long as this function returns true.

#### Returns

A new array containing the leading elements that satisfy the predicate.

#### Examples

```ts
// Returns [1, 2]
takeWhile([1, 2, 3, 4], x => x < 3);
```

```ts
// Returns []
takeWhile([1, 2, 3, 4], x => x > 3);
```

```ts
// Using index parameter
takeWhile([10, 20, 30, 40], (x, index) => index < 2);
// Returns: [10, 20]
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### toFilled

> `const` **toFilled**: *typeof* `esToolkit_toFilled` = `esToolkit_toFilled`

Defined in: [utils/arrays/es-toolkit.ts:1026](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L1026)

Creates a new array filled with the specified value from the start position up to, but not including, the end position.
This function does not mutate the original array.

#### Template

The type of elements in the original array.

#### Template

The type of the value to fill the new array with.

#### Param

The array to base the new array on.

#### Param

The value to fill the new array with.

#### Returns

The new array with the filled values.

#### Example

```ts
const array = [1, 2, 3, 4, 5];
let result = toFilled(array, '*', 2);
console.log(result); // [1, 2, '*', '*', '*']
console.log(array); // [1, 2, 3, 4, 5]

result = toFilled(array, '*', 1, 4);
console.log(result); // [1, '*', '*', '*', 5]
console.log(array); // [1, 2, 3, 4, 5]

result = toFilled(array, '*');
console.log(result); // ['*', '*', '*', '*', '*']
console.log(array); // [1, 2, 3, 4, 5]

result = toFilled(array, '*', -4, -1);
console.log(result); // [1, '*', '*', '*', 5]
console.log(array); // [1, 2, 3, 4, 5]
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### union

> `const` **union**: *typeof* `esToolkit_union` = `esToolkit_union`

Defined in: [utils/arrays/es-toolkit.ts:1047](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L1047)

Creates an array of unique values from all given arrays.

This function takes two arrays, merges them into a single array, and returns a new array
containing only the unique values from the merged array.

#### Template

The type of elements in the array.

#### Param

The first array to merge and filter for unique values.

#### Param

The second array to merge and filter for unique values.

#### Returns

A new array of unique values.

#### Example

```ts
const array1 = [1, 2, 3];
const array2 = [3, 4, 5];
const result = union(array1, array2);
// result will be [1, 2, 3, 4, 5]
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### unionBy

> `const` **unionBy**: *typeof* `esToolkit_unionBy` = `esToolkit_unionBy`

Defined in: [utils/arrays/es-toolkit.ts:1073](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L1073)

Creates an array of unique values, in order, from all given arrays using a provided mapping function to determine equality.

#### Template

The type of elements in the array.

#### Template

The type of mapped elements.

#### Param

The first array.

#### Param

The second array.

#### Param

The function to map array elements to comparison values.

#### Returns

A new array containing the union of unique elements from `arr1` and `arr2`, based on the values returned by the mapping function.

#### Examples

```ts
// Custom mapping function for numbers (modulo comparison)
const moduloMapper = (x) => x % 3;
unionBy([1, 2, 3], [4, 5, 6], moduloMapper);
// Returns [1, 2, 3]
```

```ts
// Custom mapping function for objects with an 'id' property
const idMapper = (obj) => obj.id;
unionBy([{ id: 1 }, { id: 2 }], [{ id: 2 }, { id: 3 }], idMapper);
// Returns [{ id: 1 }, { id: 2 }, { id: 3 }]
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### unionWith

> `const` **unionWith**: *typeof* `esToolkit_unionWith` = `esToolkit_unionWith`

Defined in: [utils/arrays/es-toolkit.ts:1097](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L1097)

Creates an array of unique values from two given arrays based on a custom equality function.

This function takes two arrays and a custom equality function, merges the arrays, and returns
a new array containing only the unique values as determined by the custom equality function.

#### Template

The type of elements in the array.

#### Param

The first array to merge and filter for unique values.

#### Param

The second array to merge and filter for unique values.

#### Param

A custom function to determine if two elements are equal.
It takes two arguments and returns `true` if the elements are considered equal, and `false` otherwise.

#### Returns

A new array of unique values based on the custom equality function.

#### Example

```ts
const array1 = [{ id: 1 }, { id: 2 }];
const array2 = [{ id: 2 }, { id: 3 }];
const areItemsEqual = (a, b) => a.id === b.id;
const result = unionWith(array1, array2, areItemsEqual);
// result will be [{ id: 1 }, { id: 2 }, { id: 3 }] since { id: 2 } is considered equal in both arrays
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### uniq

> `const` **uniq**: *typeof* `esToolkit_uniq` = `esToolkit_uniq`

Defined in: [utils/arrays/es-toolkit.ts:1116](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L1116)

Creates a duplicate-free version of an array.

This function takes an array and returns a new array containing only the unique values
from the original array, preserving the order of first occurrence.

#### Template

The type of elements in the array.

#### Param

The array to process.

#### Returns

A new array with only unique values from the original array.

#### Example

```ts
const array = [1, 2, 2, 3, 4, 4, 5];
const result = uniq(array);
// result will be [1, 2, 3, 4, 5]
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### uniqBy

> `const` **uniqBy**: *typeof* `esToolkit_uniqBy` = `esToolkit_uniqBy`

Defined in: [utils/arrays/es-toolkit.ts:1148](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L1148)

Returns a new array containing only the unique elements from the original array,
based on the values returned by the mapper function.

When duplicates are found, the first occurrence is kept and the rest are discarded.

#### Template

The type of elements in the array.

#### Template

The type of mapped elements.

#### Param

The array to process.

#### Param

The function used to convert the array elements.

#### Returns

A new array containing only the unique elements from the original array, based on the values returned by the mapper function.

#### Examples

```ts
uniqBy([1.2, 1.5, 2.1, 3.2, 5.7, 5.3, 7.19], Math.floor);
// [1.2, 2.1, 3.2, 5.7, 7.19]
```

const array = [
  { category: 'fruit', name: 'apple' },
  { category: 'fruit', name: 'banana' },
  { category: 'vegetable', name: 'carrot' },
];
uniqBy(array, item => item.category).length
// 2
```

@copyright Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### uniqWith

> `const` **uniqWith**: *typeof* `esToolkit_uniqWith` = `esToolkit_uniqWith`

Defined in: [utils/arrays/es-toolkit.ts:1167](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L1167)

Returns a new array containing only the unique elements from the original array,
based on the values returned by the comparator function.

#### Template

The type of elements in the array.

#### Param

The array to process.

#### Param

The function used to compare the array elements.

#### Returns

A new array containing only the unique elements from the original array, based on the values returned by the comparator function.

#### Example

```ts
uniqWith([1.2, 1.5, 2.1, 3.2, 5.7, 5.3, 7.19], (a, b) => Math.abs(a - b) < 1);
// [1.2, 3.2, 5.7, 7.19]
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### unzip

> `const` **unzip**: *typeof* `esToolkit_unzip` = `esToolkit_unzip`

Defined in: [utils/arrays/es-toolkit.ts:1184](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L1184)

Gathers elements in the same position in an internal array
from a grouped array of elements and returns them as a new array.

#### Template

The type of elements in the nested array.

#### Param

The nested array to unzip.

#### Returns

A new array of unzipped elements.

#### Example

```ts
const zipped = [['a', true, 1],['b', false, 2]];
const result = unzip(zipped);
// result will be [['a', 'b'], [true, false], [1, 2]]
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### unzipWith

> `const` **unzipWith**: *typeof* `esToolkit_unzipWith` = `esToolkit_unzipWith`

Defined in: [utils/arrays/es-toolkit.ts:1202](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L1202)

Unzips an array of arrays, applying an `iteratee` function to regrouped elements.

#### Template

R

#### Param

The nested array to unzip. This is an array of arrays,
where each inner array contains elements to be unzipped.

#### Param

A function to transform the unzipped elements.

#### Returns

A new array of unzipped and transformed elements.

#### Example

```ts
const nestedArray = [[1, 2], [3, 4], [5, 6]];
const result = unzipWith(nestedArray, (item, item2, item3) => item + item2 + item3);
// result will be [9, 12]
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### windowed

> `const` **windowed**: *typeof* `esToolkit_windowed` = `esToolkit_windowed`

Defined in: [utils/arrays/es-toolkit.ts:1212](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L1212)

**`Interface`**

Options for the windowed function.

 WindowedOptions

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### without

> `const` **without**: *typeof* `esToolkit_without` = `esToolkit_without`

Defined in: [utils/arrays/es-toolkit.ts:1236](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L1236)

Creates an array that excludes all specified values.

It correctly excludes `NaN`, as it compares values using [SameValueZero](https://tc39.es/ecma262/multipage/abstract-operations.html#sec-samevaluezero).

#### Template

The type of elements in the array.

#### Param

The array to filter.

#### Param

The values to exclude.

#### Returns

A new array without the specified values.

#### Examples

```ts
// Removes the specified values from the array
without([1, 2, 3, 4, 5], 2, 4);
// Returns: [1, 3, 5]
```

```ts
// Removes specified string values from the array
without(['a', 'b', 'c', 'a'], 'a');
// Returns: ['b', 'c']
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### xor

> `const` **xor**: *typeof* `esToolkit_xor` = `esToolkit_xor`

Defined in: [utils/arrays/es-toolkit.ts:1257](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L1257)

Computes the symmetric difference between two arrays. The symmetric difference is the set of elements
which are in either of the arrays, but not in their intersection.

#### Template

The type of elements in the array.

#### Param

The first array.

#### Param

The second array.

#### Returns

An array containing the elements that are present in either `arr1` or `arr2` but not in both.

#### Examples

```ts
// Returns [1, 2, 5, 6]
xor([1, 2, 3, 4], [3, 4, 5, 6]);
```

```ts
// Returns ['a', 'c']
xor(['a', 'b'], ['b', 'c']);
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### xorBy

> `const` **xorBy**: *typeof* `esToolkit_xorBy` = `esToolkit_xorBy`

Defined in: [utils/arrays/es-toolkit.ts:1280](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L1280)

Computes the symmetric difference between two arrays using a custom mapping function.
The symmetric difference is the set of elements which are in either of the arrays,
but not in their intersection, determined by the result of the mapping function.

#### Template

Type of elements in the input arrays.

#### Template

Type of the values returned by the mapping function.

#### Param

The first array.

#### Param

The second array.

#### Param

The function to map array elements to comparison values.

#### Returns

An array containing the elements that are present in either `arr1` or `arr2` but not in both, based on the values returned by the mapping function.

#### Example

```ts
// Custom mapping function for objects with an 'id' property
const idMapper = obj => obj.id;
xorBy([{ id: 1 }, { id: 2 }], [{ id: 2 }, { id: 3 }], idMapper);
// Returns [{ id: 1 }, { id: 3 }]
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### xorWith

> `const` **xorWith**: *typeof* `esToolkit_xorWith` = `esToolkit_xorWith`

Defined in: [utils/arrays/es-toolkit.ts:1302](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L1302)

Computes the symmetric difference between two arrays using a custom equality function.
The symmetric difference is the set of elements which are in either of the arrays,
but not in their intersection.

#### Template

Type of elements in the input arrays.

#### Param

The first array.

#### Param

The second array.

#### Param

The custom equality function to compare elements.

#### Returns

An array containing the elements that are present in either `arr1` or `arr2` but not in both, based on the custom equality function.

#### Example

```ts
// Custom equality function for objects with an 'id' property
const areObjectsEqual = (a, b) => a.id === b.id;
xorWith([{ id: 1 }, { id: 2 }], [{ id: 2 }, { id: 3 }], areObjectsEqual);
// Returns [{ id: 1 }, { id: 3 }]
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### zip

> `const` **zip**: *typeof* `esToolkit_zip` = `esToolkit_zip`

Defined in: [utils/arrays/es-toolkit.ts:1323](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L1323)

Combines multiple arrays into a single array of tuples.

This function takes multiple arrays and returns a new array where each element is a tuple
containing the corresponding elements from the input arrays. If the input arrays are of
different lengths, the resulting array will have the length of the longest input array,
with undefined values for missing elements.

#### Template

#### Param

The first array to zip.

#### Returns

A new array of tuples containing the corresponding elements from the input arrays.

#### Example

```ts
const arr1 = [1, 2, 3];
const result = zip(arr1);
// result will be [[1], [2], [3]]
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### zipObject

> `const` **zipObject**: *typeof* `esToolkit_zipObject` = `esToolkit_zipObject`

Defined in: [utils/arrays/es-toolkit.ts:1357](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L1357)

Combines two arrays, one of property names and one of corresponding values, into a single object.

This function takes two arrays: one containing property names and another containing corresponding values.
It returns a new object where the property names from the first array are keys, and the corresponding elements
from the second array are values. If the `keys` array is longer than the `values` array, the remaining keys will
have `undefined` as their values.

#### Template

The type of elements in the array.

#### Template

The type of elements in the array.

#### Param

An array of property names.

#### Param

An array of values corresponding to the property names.

#### Returns

- A new object composed of the given property names and values.

#### Example

```ts
const keys = ['a', 'b', 'c'];
const values = [1, 2, 3];
const result = zipObject(keys, values);
// result will be { a: 1, b: 2, c: 3 }

const keys2 = ['a', 'b', 'c'];
const values2 = [1, 2];
const result2 = zipObject(keys2, values2);
// result2 will be { a: 1, b: 2, c: undefined }

const keys2 = ['a', 'b'];
const values2 = [1, 2, 3];
const result2 = zipObject(keys2, values2);
// result2 will be { a: 1, b: 2 }
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### zipWith

> `const` **zipWith**: *typeof* `esToolkit_zipWith` = `esToolkit_zipWith`

Defined in: [utils/arrays/es-toolkit.ts:1388](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/arrays/es-toolkit.ts#L1388)

Combines multiple arrays into a single array using a custom combiner function.

This function takes multiple arrays and a combiner function, and returns a new array where each element
is the result of applying the combiner function to the corresponding elements of the input arrays.

#### Template

The type of elements in the first array.

#### Template

The type of elements in the resulting array.

#### Param

The first array to zip.

#### Param

The combiner function that takes corresponding elements from each array, their index, and returns a single value.

#### Returns

A new array where each element is the result of applying the combiner function to the corresponding elements of the input arrays.

#### Examples

```ts
// Example usage with two arrays:
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const result = zipWith(arr1, arr2, (a, b) => a + b);
// result will be [5, 7, 9]
```

```ts
// Example usage with three arrays:
const arr1 = [1, 2];
const arr2 = [3, 4];
const arr3 = [5, 6];
const result = zipWith(arr1, arr2, arr3, (a, b, c) => `${a}${b}${c}`);
// result will be [`135`, `246`]
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).
