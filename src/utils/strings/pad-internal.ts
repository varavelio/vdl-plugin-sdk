function toLength(value: number): number | undefined {
  if (!Number.isFinite(value)) {
    return undefined;
  }

  return Math.trunc(value);
}

function createPadding(length: number, chars: string): string {
  if (length <= 0) {
    return "";
  }

  const paddingCharacters = Array.from(chars);

  if (paddingCharacters.length === 0) {
    return "";
  }

  const result: string[] = [];

  while (result.length < length) {
    result.push(...paddingCharacters);
  }

  return result.slice(0, length).join("");
}

export function getPaddingTargetLength(
  str: string,
  length: number,
): { currentLength: number; targetLength: number } | undefined {
  const currentLength = Array.from(str).length;
  const targetLength = toLength(length);

  if (targetLength === undefined || targetLength <= currentLength) {
    return undefined;
  }

  return { currentLength, targetLength };
}

export function buildPadding(
  length: number,
  chars: string | undefined,
): string {
  return createPadding(length, chars ?? " ");
}
