# functions

## Variables

### after

> `const` **after**: *typeof* `esToolkit_after` = `esToolkit_after`

Defined in: [utils/functions/es-toolkit.ts:59](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/functions/es-toolkit.ts#L59)

Creates a function that only executes starting from the `n`-th call.
The provided function will be invoked starting from the `n`-th call.

This is particularly useful for scenarios involving events or asynchronous operations
where an action should occur only after a certain number of invocations.

#### Template

The type of the function to be invoked.

#### Param

The number of calls required for `func` to execute.

#### Param

The function to be invoked.

#### Returns

- A new function that:
- Tracks the number of calls.
- Invokes `func` starting from the `n`-th call.
- Returns `undefined` if fewer than `n` calls have been made.

#### Throws

- Throws an error if `n` is negative.

#### Example

```ts
const afterFn = after(3, () => {
 console.log("called")
});

// Will not log anything.
afterFn()
// Will not log anything.
afterFn()
// Will log 'called'.
afterFn()
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### ary

> `const` **ary**: *typeof* `esToolkit_ary` = `esToolkit_ary`

Defined in: [utils/functions/es-toolkit.ts:81](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/functions/es-toolkit.ts#L81)

Creates a function that invokes func, with up to n arguments, ignoring any additional arguments.

#### Template

The type of the function.

#### Param

The function to cap arguments for.

#### Param

The arity cap.

#### Returns

Returns the new capped function.

#### Example

```ts
function fn(a: number, b: number, c: number) {
  return Array.from(arguments);
}

ary(fn, 0)(1, 2, 3) // []
ary(fn, 1)(1, 2, 3) // [1]
ary(fn, 2)(1, 2, 3) // [1, 2]
ary(fn, 3)(1, 2, 3) // [1, 2, 3]
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### before

> `const` **before**: *typeof* `esToolkit_before` = `esToolkit_before`

Defined in: [utils/functions/es-toolkit.ts:113](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/functions/es-toolkit.ts#L113)

Creates a function that limits the number of times the given function (`func`) can be called.

#### Template

The type of the function to be invoked.

#### Param

The number of times the returned function is allowed to call `func` before stopping.
- If `n` is 0, `func` will never be called.
- If `n` is a positive integer, `func` will be called up to `n-1` times.

#### Param

The function to be called with the limit applied.

#### Returns

- A new function that:
- Tracks the number of calls.
- Invokes `func` until the `n-1`-th call.
- Returns `undefined` if the number of calls reaches or exceeds `n`, stopping further calls.

#### Throws

- Throw an error if `n` is negative.

#### Example

```ts
const beforeFn = before(3, () => {
 console.log("called");
})

// Will log 'called'.
beforeFn();

// Will log 'called'.
beforeFn();

// Will not log anything.
beforeFn();
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### curry

> `const` **curry**: *typeof* `esToolkit_curry` = `esToolkit_curry`

Defined in: [utils/functions/es-toolkit.ts:131](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/functions/es-toolkit.ts#L131)

Curries a function, allowing it to be called with a single argument at a time and returning a new function that takes the next argument.
This process continues until all arguments have been provided, at which point the original function is called with all accumulated arguments.

#### Param

The function to curry.

#### Returns

A curried function.

#### Example

```ts
function noArgFunc() {
  return 42;
}
const curriedNoArgFunc = curry(noArgFunc);
console.log(curriedNoArgFunc()); // 42
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### curryRight

> `const` **curryRight**: *typeof* `esToolkit_curryRight` = `esToolkit_curryRight`

Defined in: [utils/functions/es-toolkit.ts:151](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/functions/es-toolkit.ts#L151)

Curries a function, allowing it to be called with a single argument at a time and returning a new function that takes the next argument.
This process continues until all arguments have been provided, at which point the original function is called with all accumulated arguments.

Unlike `curry`, this function curries the function from right to left.

#### Param

The function to curry.

#### Returns

A curried function.

#### Example

```ts
function noArgFunc() {
 return 42;
}
const curriedNoArgFunc = curryRight(noArgFunc);
console.log(curriedNoArgFunc()); // 42
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### flow

> `const` **flow**: *typeof* `esToolkit_flow` = `esToolkit_flow`

Defined in: [utils/functions/es-toolkit.ts:171](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/functions/es-toolkit.ts#L171)

Creates a new function that executes the given functions in sequence. The return value of the previous function is passed as an argument to the next function.

The `this` context of the returned function is also passed to the functions provided as parameters.

#### Param

The function to invoke.

#### Returns

Returns the new composite function.

#### Example

```ts
function noArgFunc() {
 return 42;
}

const combined = flow(noArgFunc);
console.log(combined()); // 42
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### flowRight

> `const` **flowRight**: *typeof* `esToolkit_flowRight` = `esToolkit_flowRight`

Defined in: [utils/functions/es-toolkit.ts:192](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/functions/es-toolkit.ts#L192)

Creates a new function that executes the given functions in sequence from right to left. The return value of the previous function is passed as an argument to the next function.

The `this` context of the returned function is also passed to the functions provided as parameters.

This method is like `flow` except that it creates a function that invokes the given functions from right to left.

#### Param

The function to invoke.

#### Returns

Returns the new composite function.

#### Example

```ts
function noArgFunc() {
  return 42;
}
const combined = flowRight(noArgFunc);
console.log(combined()); // 42
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### identity

> `const` **identity**: *typeof* `esToolkit_identity` = `esToolkit_identity`

Defined in: [utils/functions/es-toolkit.ts:215](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/functions/es-toolkit.ts#L215)

Returns the input value unchanged.

#### Template

The type of the input value.

#### Param

The value to be returned.

#### Returns

The input value.

#### Examples

```ts
// Returns 5
identity(5);
```

```ts
// Returns 'hello'
identity('hello');
```

```ts
// Returns { key: 'value' }
identity({ key: 'value' });
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### memoize

> `const` **memoize**: *typeof* `esToolkit_memoize` = `esToolkit_memoize`

Defined in: [utils/functions/es-toolkit.ts:291](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/functions/es-toolkit.ts#L291)

Creates a memoized version of the provided function. The memoized function caches
results based on the argument it receives, so if the same argument is passed again,
it returns the cached result instead of recomputing it.

This function works with functions that take zero or just one argument. If your function
originally takes multiple arguments, you should refactor it to take a single object or array
that combines those arguments.

If the argument is not primitive (e.g., arrays or objects), provide a
`getCacheKey` function to generate a unique cache key for proper caching.

#### Template

The type of the function to be memoized.

#### Param

The function to be memoized. It should accept a single argument and return a value.

#### Param

Optional configuration for the memoization.

#### Param

The cache object used to store results. Defaults to a new `Map`.

#### Param

An optional function to generate a unique cache key for each argument.

#### Returns

The memoized function with an additional `cache` property that exposes the internal cache.

#### Examples

```ts
// Example using the default cache
const add = (x: number) => x + 10;
const memoizedAdd = memoize(add);

console.log(memoizedAdd(5)); // 15
console.log(memoizedAdd(5)); // 15 (cached result)
console.log(memoizedAdd.cache.size); // 1
```

```ts
// Example using a custom resolver
const sum = (arr: number[]) => arr.reduce((x, y) => x + y, 0);
const memoizedSum = memoize(sum, { getCacheKey: (arr: number[]) => arr.join(',') });
console.log(memoizedSum([1, 2])); // 3
console.log(memoizedSum([1, 2])); // 3 (cached result)
console.log(memoizedSum.cache.size); // 1
```

```ts
// Example using a custom cache implementation
class CustomCache<K, T> implements MemoizeCache<K, T> {
  private cache = new Map<K, T>();

  set(key: K, value: T): void {
    this.cache.set(key, value);
  }

  get(key: K): T | undefined {
    return this.cache.get(key);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}
const customCache = new CustomCache<string, number>();
const memoizedSumWithCustomCache = memoize(sum, { cache: customCache });
console.log(memoizedSumWithCustomCache([1, 2])); // 3
console.log(memoizedSumWithCustomCache([1, 2])); // 3 (cached result)
console.log(memoizedAddWithCustomCache.cache.size); // 1
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### negate

> `const` **negate**: *typeof* `esToolkit_negate` = `esToolkit_negate`

Defined in: [utils/functions/es-toolkit.ts:308](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/functions/es-toolkit.ts#L308)

Creates a function that negates the result of the predicate function.

#### Template

The type of the function to negate.

#### Param

The function to negate.

#### Returns

The new negated function, which negates the boolean result of `func`.

#### Example

```ts
const array = [1, 2, 3, 4, 5, 6];
const isEven = (n: number) => n % 2 === 0;
const result = array.filter(negate(isEven));
// result will be [1, 3, 5]
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### noop

> `const` **noop**: *typeof* `esToolkit_noop` = `esToolkit_noop`

Defined in: [utils/functions/es-toolkit.ts:321](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/functions/es-toolkit.ts#L321)

A no-operation function that does nothing.
This can be used as a placeholder or default function.

#### Example

```ts
noop(); // Does nothing
```

#### Returns

This function does not return anything.

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### once

> `const` **once**: *typeof* `esToolkit_once` = `esToolkit_once`

Defined in: [utils/functions/es-toolkit.ts:339](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/functions/es-toolkit.ts#L339)

Creates a function that is restricted to invoking func once. Repeat calls to the function return the value of the first invocation.

#### Template

The type of the function.

#### Param

The function to restrict.

#### Returns

Returns the new restricted function.

#### Example

```ts
const initialize = once(createApplication);

initialize();
initialize();
// => `createApplication` is invoked once
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### partial

> `const` **partial**: *typeof* `esToolkit_partial` = `esToolkit_partial`

Defined in: [utils/functions/es-toolkit.ts:361](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/functions/es-toolkit.ts#L361)

Creates a function that invokes `func` with `partialArgs` prepended to the arguments it receives. This method is like `bind` except it does not alter the `this` binding.

The partial.placeholder value, which defaults to a `symbol`, may be used as a placeholder for partially applied arguments.

Note: This method doesn't set the `length` property of partially applied functions.

#### Template

The type of the first argument.

#### Template

The return type of the function.

#### Param

The function to partially apply.

#### Param

The first argument to apply.

#### Returns

A new function that takes no arguments and returns the result of the original function.

#### Example

```ts
const addOne = (x: number) => x + 1;
const addOneToFive = partial(addOne, 5);
console.log(addOneToFive()); // => 6
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### partialRight

> `const` **partialRight**: *typeof* `esToolkit_partialRight` = `esToolkit_partialRight`

Defined in: [utils/functions/es-toolkit.ts:380](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/functions/es-toolkit.ts#L380)

This method is like `partial` except that partially applied arguments are appended to the arguments it receives.

The partialRight.placeholder value, which defaults to a `symbol`, may be used as a placeholder for partially applied arguments.

Note: This method doesn't set the `length` property of partially applied functions.

#### Template

The return type of the function.

#### Param

The function to invoke.

#### Returns

Returns the new function.

#### Example

```ts
const getValue = () => 42;
const getValueFunc = partialRight(getValue);
console.log(getValueFunc()); // => 42
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### rest

> `const` **rest**: *typeof* `esToolkit_rest` = `esToolkit_rest`

Defined in: [utils/functions/es-toolkit.ts:415](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/functions/es-toolkit.ts#L415)

Creates a function that transforms the arguments of the provided function `func`.
The transformed arguments are passed to `func` such that the arguments starting from a specified index
are grouped into an array, while the previous arguments are passed as individual elements.

#### Template

The type of the function being transformed.

#### Param

The function whose arguments are to be transformed.

#### Param

The index from which to start grouping the remaining arguments into an array.
                                           Defaults to `func.length - 1`, grouping all arguments after the last parameter.

#### Returns

A new function that, when called, returns the result of calling `func` with the transformed arguments.

The transformed arguments are:
- The first `start` arguments as individual elements.
- The remaining arguments from index `start` onward grouped into an array.

#### Example

```ts
function fn(a, b, c) {
  return [a, b, c];
}

// Using default start index (func.length - 1, which is 2 in this case)
const transformedFn = rest(fn);
console.log(transformedFn(1, 2, 3, 4)); // [1, 2, [3, 4]]

// Using start index 1
const transformedFnWithStart = rest(fn, 1);
console.log(transformedFnWithStart(1, 2, 3, 4)); // [1, [2, 3, 4]]

// With fewer arguments than the start index
console.log(transformedFn(1)); // [1, undefined, []]
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### spread

> `const` **spread**: *typeof* `esToolkit_spread` = `esToolkit_spread`

Defined in: [utils/functions/es-toolkit.ts:435](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/functions/es-toolkit.ts#L435)

Creates a new function that spreads elements of an array argument into individual arguments
for the original function.

#### Template

A function type with any number of parameters and any return type.

#### Param

The function to be transformed. It can be any function with any number of arguments.

#### Returns

- A new function that takes an array of arguments and returns the result of calling the original function with those arguments.

#### Example

```ts
function add(a, b) {
  return a + b;
}

const spreadAdd = spread(add);
console.log(spreadAdd([1, 2])); // Output: 3
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### unary

> `const` **unary**: *typeof* `esToolkit_unary` = `esToolkit_unary`

Defined in: [utils/functions/es-toolkit.ts:453](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/functions/es-toolkit.ts#L453)

Creates a function that accepts up to one argument, ignoring any additional arguments.

#### Template

The type of the function.

#### Param

The function to cap arguments for.

#### Returns

Returns the new capped function.

#### Example

```ts
function fn(a, b, c) {
  console.log(arguments);
}

unary(fn)(1, 2, 3); // [Arguments] { '0': 1 }
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).
