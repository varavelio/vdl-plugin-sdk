# math

## Variables

### clamp

> `const` **clamp**: *typeof* `esToolkit_clamp` = `esToolkit_clamp`

Defined in: [utils/math/es-toolkit.ts:38](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/math/es-toolkit.ts#L38)

Clamps a number within the inclusive upper bound.

This function takes a number and a maximum bound, and returns the number clamped within the specified upper bound.
If only one bound is provided, it returns the minimum of the value and the bound.

#### Param

The number to clamp.

#### Param

The maximum bound to clamp the number.

#### Returns

The clamped number within the specified upper bound.

#### Example

```ts
const result1 = clamp(10, 5); // result1 will be 5, as 10 is clamped to the bound 5
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### inRange

> `const` **inRange**: *typeof* `esToolkit_inRange` = `esToolkit_inRange`

Defined in: [utils/math/es-toolkit.ts:53](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/math/es-toolkit.ts#L53)

Checks if the value is less than the maximum.

#### Param

The value to check.

#### Param

The upper bound of the range (exclusive).

#### Returns

`true` if the value is less than the maximum, otherwise `false`.

#### Example

```ts
const result = inRange(3, 5); // result will be true.
const result2 = inRange(5, 5); // result2 will be false.
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### mean

> `const` **mean**: *typeof* `esToolkit_mean` = `esToolkit_mean`

Defined in: [utils/math/es-toolkit.ts:70](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/math/es-toolkit.ts#L70)

Calculates the average of an array of numbers.

If the array is empty, this function returns `NaN`.

#### Param

An array of numbers to calculate the average.

#### Returns

The average of all the numbers in the array.

#### Example

```ts
const numbers = [1, 2, 3, 4, 5];
const result = mean(numbers);
// result will be 3
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### meanBy

> `const` **meanBy**: *typeof* `esToolkit_meanBy` = `esToolkit_meanBy`

Defined in: [utils/math/es-toolkit.ts:89](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/math/es-toolkit.ts#L89)

Calculates the average of an array of numbers when applying
the `getValue` function to each element.

If the array is empty, this function returns `NaN`.

#### Template

The type of elements in the array.

#### Param

An array to calculate the average.

#### Param

A function that selects a numeric value from each element.

#### Returns

The average of all the numbers as determined by the `getValue` function.

#### Example

```ts
meanBy([{ a: 1 }, { a: 2 }, { a: 3 }], x => x.a); // Returns: 2
meanBy([], x => x.a); // Returns: NaN
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### median

> `const` **median**: *typeof* `esToolkit_median` = `esToolkit_median`

Defined in: [utils/math/es-toolkit.ts:115](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/math/es-toolkit.ts#L115)

Calculates the median of an array of numbers.

The median is the middle value of a sorted array.
If the array has an odd number of elements, the median is the middle value.
If the array has an even number of elements, it returns the average of the two middle values.

If the array is empty, this function returns `NaN`.

#### Param

An array of numbers to calculate the median.

#### Returns

The median of all the numbers in the array.

#### Examples

```ts
const arrayWithOddNumberOfElements = [1, 2, 3, 4, 5];
const result = median(arrayWithOddNumberOfElements);
// result will be 3
```

```ts
const arrayWithEvenNumberOfElements = [1, 2, 3, 4];
const result = median(arrayWithEvenNumberOfElements);
// result will be 2.5
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### medianBy

> `const` **medianBy**: *typeof* `esToolkit_medianBy` = `esToolkit_medianBy`

Defined in: [utils/math/es-toolkit.ts:139](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/math/es-toolkit.ts#L139)

Calculates the median of an array of elements when applying
the `getValue` function to each element.

The median is the middle value of a sorted array.
If the array has an odd number of elements, the median is the middle value.
If the array has an even number of elements, it returns the average of the two middle values.

If the array is empty, this function returns `NaN`.

#### Template

The type of elements in the array.

#### Param

An array to calculate the median.

#### Param

A function that selects a numeric value from each element.

#### Returns

The median of all the numbers as determined by the `getValue` function.

#### Example

```ts
medianBy([{ a: 1 }, { a: 2 }, { a: 3 }, { a: 4 }, { a: 5 }], x => x.a); // Returns: 3
medianBy([{ a: 1 }, { a: 2 }, { a: 3 }, { a: 4 }], x => x.a); // Returns: 2.5
medianBy([], x => x.a); // Returns: NaN
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### range

> `const` **range**: *typeof* `esToolkit_range` = `esToolkit_range`

Defined in: [utils/math/es-toolkit.ts:153](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/math/es-toolkit.ts#L153)

Returns an array of numbers from `0` (inclusive) to `end` (exclusive), incrementing by `1`.

#### Param

The end number of the range (exclusive).

#### Returns

An array of numbers from `0` (inclusive) to `end` (exclusive) with a step of `1`.

#### Example

```ts
// Returns [0, 1, 2, 3]
range(4);
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### rangeRight

> `const` **rangeRight**: *typeof* `esToolkit_rangeRight` = `esToolkit_rangeRight`

Defined in: [utils/math/es-toolkit.ts:167](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/math/es-toolkit.ts#L167)

Returns an array of numbers from `end` (exclusive) to `0` (inclusive), decrementing by `1`.

#### Param

The end number of the range (exclusive).

#### Returns

An array of numbers from `end` (exclusive) to `0` (inclusive) with a step of `1`.

#### Example

```ts
// Returns [3, 2, 1, 0]
rangeRight(4);
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### round

> `const` **round**: *typeof* `esToolkit_round` = `esToolkit_round`

Defined in: [utils/math/es-toolkit.ts:188](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/math/es-toolkit.ts#L188)

Rounds a number to a specified precision.

This function takes a number and an optional precision value, and returns the number rounded
to the specified number of decimal places.

#### Param

The number to round.

#### Param

The number of decimal places to round to. Defaults to 0.

#### Returns

The rounded number.

#### Throws

Throws an error if `Precision` is not integer.

#### Example

```ts
const result1 = round(1.2345); // result1 will be 1
const result2 = round(1.2345, 2); // result2 will be 1.23
const result3 = round(1.2345, 3); // result3 will be 1.235
const result4 = round(1.2345, 3.1); // This will throw an error
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### sum

> `const` **sum**: *typeof* `esToolkit_sum` = `esToolkit_sum`

Defined in: [utils/math/es-toolkit.ts:205](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/math/es-toolkit.ts#L205)

Calculates the sum of an array of numbers.

This function takes an array of numbers and returns the sum of all the elements in the array.

#### Param

An array of numbers to be summed.

#### Returns

The sum of all the numbers in the array.

#### Example

```ts
const numbers = [1, 2, 3, 4, 5];
const result = sum(numbers);
// result will be 15
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### sumBy

> `const` **sumBy**: *typeof* `esToolkit_sumBy` = `esToolkit_sumBy`

Defined in: [utils/math/es-toolkit.ts:225](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/math/es-toolkit.ts#L225)

Calculates the sum of an array of numbers when applying
the `getValue` function to each element.

If the array is empty, this function returns `0`.

#### Template

The type of elements in the array.

#### Param

An array to calculate the sum.

#### Param

A function that selects a numeric value from each element.
  It receives the element and its zero‑based index in the array.

#### Returns

The sum of all the numbers as determined by the `getValue` function.

#### Example

```ts
sumBy([{ a: 1 }, { a: 2 }, { a: 3 }], (x, i) => x.a * i); // Returns: 8
sumBy([], () => 1); // Returns: 0
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).
