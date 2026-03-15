import { buildPadding, getPaddingTargetLength } from "./pad-internal";

/**
 * Pads the right side of a string until it reaches the requested length.
 *
 * Padding is added only when the string is shorter than `length`. The padding
 * pattern repeats as needed and is truncated to fit exactly.
 *
 * By default, spaces are used as padding. Pass `chars` to use a custom padding
 * pattern. If `chars` is an empty string, the input is returned unchanged.
 *
 * The target length is truncated with `Math.trunc`, and non-finite lengths are
 * ignored by returning the original string.
 *
 * @param str - String to pad.
 * @param length - Final string length to target.
 * @param chars - Optional padding characters to repeat.
 * @returns `str` padded on the right up to `length` characters.
 *
 * @example
 * padRight("cat", 5, "0")
 * // "cat00"
 */
export function padRight(str: string, length: number, chars?: string): string {
  const target = getPaddingTargetLength(str, length);

  if (target === undefined) {
    return str;
  }

  const padding = buildPadding(
    target.targetLength - target.currentLength,
    chars,
  );
  return padding.length === 0 ? str : `${str}${padding}`;
}
