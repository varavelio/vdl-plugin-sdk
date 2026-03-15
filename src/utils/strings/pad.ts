import { buildPadding, getPaddingTargetLength } from "./pad-internal";

/**
 * Pads both sides of a string until it reaches the requested length.
 *
 * Padding is only added when the string is shorter than `length`. The padding
 * pattern repeats as needed and is truncated to fit exactly. When the total
 * number of padding characters cannot be split evenly, the right side receives
 * one more character than the left side.
 *
 * By default, spaces are used as padding. Pass `chars` to use a custom padding
 * pattern. If `chars` is an empty string, the input is returned unchanged.
 *
 * The target length is truncated with `Math.trunc`, so decimal lengths behave
 * predictably. Non-finite lengths are ignored and return the original string.
 *
 * @param str - String to pad.
 * @param length - Final string length to target.
 * @param chars - Optional padding characters to repeat.
 * @returns `str` centered within the requested width.
 *
 * @example
 * pad("cat", 7)
 * // "  cat  "
 *
 * @example
 * pad("cat", 8, "_-")
 * // "_-cat_-_"
 */
export function pad(str: string, length: number, chars?: string): string {
  const target = getPaddingTargetLength(str, length);

  if (target === undefined) {
    return str;
  }

  const totalPadding = target.targetLength - target.currentLength;
  const leftPaddingLength = Math.floor(totalPadding / 2);
  const rightPaddingLength = totalPadding - leftPaddingLength;
  const leftPadding = buildPadding(leftPaddingLength, chars);
  const rightPadding = buildPadding(rightPaddingLength, chars);

  if (leftPaddingLength > 0 && leftPadding.length === 0) {
    return str;
  }

  if (rightPaddingLength > 0 && rightPadding.length === 0) {
    return str;
  }

  return `${leftPadding}${str}${rightPadding}`;
}
