/**
 * Utility functions re-exported from `es-toolkit` (MIT License).
 * See https://github.com/toss/es-toolkit for more details.
 */

import { invariant } from "es-toolkit/util";

export {
  attempt,
  invariant,
} from "es-toolkit/util";

/**
 * Asserts that a given condition is true. If the condition is false, an error is thrown with the provided message.
 *
 * @param {unknown} condition - The condition to evaluate.
 * @param {string} message - The error message to throw if the condition is false.
 * @returns {void} Returns void if the condition is true.
 * @throws {Error} Throws an error if the condition is false.
 *
 * @example
 * // This call will succeed without any errors
 * assert(true, 'This should not throw');
 *
 * // This call will fail and throw an error with the message 'This should throw'
 * assert(false, 'This should throw');
 */
export function assert(condition: unknown, message: string): asserts condition {
  return invariant(condition, message);
}
