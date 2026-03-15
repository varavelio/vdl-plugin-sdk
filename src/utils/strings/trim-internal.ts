function toTrimCharacterSet(chars: string | readonly string[]): Set<string> {
  const values: readonly string[] = Array.isArray(chars) ? chars : [chars];
  const characterSet = new Set<string>();

  for (const value of values) {
    for (const character of Array.from(value)) {
      characterSet.add(character);
    }
  }

  return characterSet;
}

type TrimMode = "start" | "end" | "both";

export function trimWithCharacters(
  str: string,
  chars: string | readonly string[] | undefined,
  mode: TrimMode,
): string {
  if (chars === undefined) {
    switch (mode) {
      case "start":
        return str.replace(/^\s+/, "");
      case "end":
        return str.replace(/\s+$/, "");
      default:
        return str.trim();
    }
  }

  const trimCharacters = toTrimCharacterSet(chars);

  if (trimCharacters.size === 0) {
    return str;
  }

  const characters = Array.from(str);
  let start = 0;
  let end = characters.length;

  if (mode === "start" || mode === "both") {
    while (start < end && trimCharacters.has(characters[start] as string)) {
      start += 1;
    }
  }

  if (mode === "end" || mode === "both") {
    while (end > start && trimCharacters.has(characters[end - 1] as string)) {
      end -= 1;
    }
  }

  return characters.slice(start, end).join("");
}
