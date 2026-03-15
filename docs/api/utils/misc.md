# misc

## Variables

### assert

> `const` **assert**: *typeof* `esToolkit_assert` = `esToolkit_assert`

Defined in: [utils/misc/es-toolkit.ts:32](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/misc/es-toolkit.ts#L32)

Asserts that a given condition is true. If the condition is false, an error is thrown with the provided message.

#### Param

The condition to evaluate.

#### Param

The error message to throw if the condition is false.

#### Returns

Returns void if the condition is true.

#### Throws

Throws an error if the condition is false.

#### Example

```ts
// This call will succeed without any errors
invariant(true, 'This should not throw');

// This call will fail and throw an error with the message 'This should throw'
invariant(false, 'This should throw');
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### attempt

> `const` **attempt**: *typeof* `esToolkit_attempt` = `esToolkit_attempt`

Defined in: [utils/misc/es-toolkit.ts:75](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/misc/es-toolkit.ts#L75)

Attempt to execute a function and return the result or error.
Returns a tuple where:
- On success: [null, Result] - First element is null, second is the result
- On error: [Error, null] - First element is the caught error, second is null

#### Template

The type of the result of the function.

#### Template

The type of the error that can be thrown by the function.

#### Param

The function to execute.

#### Returns

A tuple containing either [null, result] or [error, null].

#### Example

```ts
// Successful execution
const [error, result] = attempt(() => 42);
// [null, 42]

// Failed execution
const [error, result] = attempt(() => {
  throw new Error('Something went wrong');
});
// [Error, null]

// With type parameter
const [error, names] = attempt<string[]>(() => ['Alice', 'Bob']);
// [null, ['Alice', 'Bob']]
```

#### Note

Important: This function is not suitable for async functions (functions that return a `Promise`).
When passing an async function, it will return `[null, Promise<Result>]`, but won't catch any
errors if the Promise is rejected later.

For handling async functions, use the `attemptAsync` function instead:
```
const [error, data] = await attemptAsync(async () => {
  const response = await fetch('https://api.example.com/data');
  return response.json();
});
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).

***

### invariant

> `const` **invariant**: *typeof* `esToolkit_invariant` = `esToolkit_invariant`

Defined in: [utils/misc/es-toolkit.ts:94](https://github.com/varavelio/vdl-plugin-sdk/blob/cf509e37b9c6a50c5788d01d40bad57bbc59d766/src/utils/misc/es-toolkit.ts#L94)

Asserts that a given condition is true. If the condition is false, an error is thrown with the provided message.

#### Param

The condition to evaluate.

#### Param

The error message to throw if the condition is false.

#### Returns

Returns void if the condition is true.

#### Throws

Throws an error if the condition is false.

#### Example

```ts
// This call will succeed without any errors
invariant(true, 'This should not throw');

// This call will fail and throw an error with the message 'This should throw'
invariant(false, 'This should throw');
```

#### Copyright

Provided by [es-toolkit](https://github.com/toss/es-toolkit) (MIT License).
