import { describe, expect, it } from "vitest";

import { fuzzySearch } from "./fuzzy-search";

describe("fuzzySearch", () => {
  it("returns an empty result for empty data", () => {
    expect(fuzzySearch([], "test")).toEqual({
      matches: [],
      exactMatchFound: false,
    });
  });

  it("tracks literal exact matches independently from normalized matching", () => {
    const data = ["Hello", "hello", "HELLO"];

    expect(fuzzySearch(data, "Hello").exactMatchFound).toBe(true);
    expect(fuzzySearch(data, "hello").exactMatchFound).toBe(true);
    expect(fuzzySearch(data, "HeLLo").exactMatchFound).toBe(false);
  });

  it("returns at most three matches", () => {
    const result = fuzzySearch(
      ["cat", "car", "bat", "cap", "can", "cab"],
      "cat",
    );

    expect(result.matches).toHaveLength(3);
  });

  it("ranks exact, prefix, suffix, contains, then edit matches", () => {
    const result = fuzzySearch(
      ["MyUserHelper", "SuperUser", "UserService", "User", "Usr"],
      "User",
    );

    expect(result.matches).toEqual(["User", "UserService", "SuperUser"]);
  });

  it("keeps normalized exact matches ahead of prefix matches", () => {
    const result = fuzzySearch(
      ["helloo", "hallo", "hello", "help", "helo"],
      "hello",
    );

    expect(result.matches).toEqual(["hello", "helloo", "hallo"]);
  });

  it("includes structural matches even when they exceed the edit-distance threshold", () => {
    const result = fuzzySearch(["BaseUser", "Users", "User", "Usr"], "User");

    expect(result.matches).toEqual(["User", "Users", "BaseUser"]);
  });

  it("handles adjacent transpositions as a single edit", () => {
    const result = fuzzySearch(["unit", "hint", "uint", "init"], "uint");

    expect(result.exactMatchFound).toBe(true);
    expect(result.matches).toContain("uint");
    expect(result.matches).toContain("unit");
  });

  it("uses adaptive distance thresholds for short, medium, and long queries", () => {
    expect(fuzzySearch(["cat", "car", "bat", "dog"], "cat").matches).toEqual([
      "cat",
      "car",
      "bat",
    ]);

    expect(
      fuzzySearch(["hello", "hallo", "help", "world"], "hello").matches,
    ).toEqual(["hello", "hallo", "help"]);

    expect(
      fuzzySearch(
        ["programming", "programing", "programmin", "developer"],
        "programming",
      ).matches,
    ).toEqual(["programming", "programing", "programmin"]);
  });

  it("normalizes case, whitespace, and diacritics", () => {
    expect(
      fuzzySearch(["cafe", "café", "CAFÉ", "Cafe"], "cafe").matches,
    ).toEqual(["cafe", "café", "CAFÉ"]);

    expect(fuzzySearch(["  test  ", "test", " TEST "], "test").matches).toEqual(
      ["  test  ", "test", " TEST "],
    );
  });

  it("matches only normalized empty strings for an empty query", () => {
    expect(fuzzySearch(["", "   ", "a", "ab"], "")).toEqual({
      matches: ["", "   "],
      exactMatchFound: true,
    });

    expect(fuzzySearch(["", "   ", "a"], "   ")).toEqual({
      matches: ["", "   "],
      exactMatchFound: true,
    });
  });

  it("supports unicode strings", () => {
    const result = fuzzySearch(
      ["日本語", "日本", "日本人", "中国語"],
      "日本語",
    );

    expect(result).toEqual({
      matches: ["日本語", "日本人", "日本"],
      exactMatchFound: true,
    });
  });

  it("preserves duplicates when they are among the best results", () => {
    const result = fuzzySearch(["test", "test", "test", "toast"], "test");

    expect(result).toEqual({
      matches: ["test", "test", "test"],
      exactMatchFound: true,
    });
  });

  it("returns no matches when candidates are too different", () => {
    expect(fuzzySearch(["apple", "banana", "cherry"], "xyz").matches).toEqual(
      [],
    );
  });

  it("remains stable across a deterministic fuzz corpus", () => {
    const random = createDeterministicRandom(0x5eed1234);

    for (let iteration = 0; iteration < 250; iteration += 1) {
      const data = Array.from({ length: Math.floor(random() * 12) }, () =>
        randomWord(random),
      );
      const query = randomWord(random);

      expect(fuzzySearch(data, query)).toEqual(
        referenceFuzzySearch(data, query),
      );
    }
  });
});

function referenceFuzzySearch(
  data: readonly string[],
  query: string,
): { exactMatchFound: boolean; matches: string[] } {
  if (data.length === 0) {
    return {
      matches: [],
      exactMatchFound: false,
    };
  }

  const exactMatchFound = data.includes(query);
  const normalizedQuery = normalizeForReference(query);

  if (normalizedQuery.length === 0) {
    return {
      matches: data
        .filter((word) => normalizeForReference(word).length === 0)
        .slice(0, 3),
      exactMatchFound,
    };
  }

  const queryCodePoints = Array.from(normalizedQuery);
  const queryLength = queryCodePoints.length;
  const maxDistance = queryLength <= 4 ? 1 : queryLength <= 8 ? 2 : 3;

  const matches = data
    .map((word, index) => {
      const normalizedWord = normalizeForReference(word);
      const wordCodePoints = Array.from(normalizedWord);
      const lengthDifference = Math.abs(queryLength - wordCodePoints.length);

      if (normalizedWord === normalizedQuery) {
        return { word, index, kind: 0, distance: 0, lengthDifference };
      }

      if (normalizedWord.startsWith(normalizedQuery)) {
        return { word, index, kind: 1, distance: 0, lengthDifference };
      }

      if (normalizedWord.endsWith(normalizedQuery)) {
        return { word, index, kind: 2, distance: 0, lengthDifference };
      }

      if (normalizedWord.includes(normalizedQuery)) {
        return { word, index, kind: 3, distance: 0, lengthDifference };
      }

      if (lengthDifference > maxDistance) {
        return null;
      }

      const distance = referenceDistance(queryCodePoints, wordCodePoints);

      if (distance > maxDistance) {
        return null;
      }

      return { word, index, kind: 4, distance, lengthDifference };
    })
    .filter((candidate) => candidate !== null)
    .sort((left, right) => {
      return (
        left.kind - right.kind ||
        left.distance - right.distance ||
        left.lengthDifference - right.lengthDifference ||
        left.index - right.index
      );
    })
    .slice(0, 3)
    .map((candidate) => candidate.word);

  return {
    matches,
    exactMatchFound,
  };
}

function referenceDistance(
  left: readonly string[],
  right: readonly string[],
): number {
  if (left.length === 0) {
    return right.length;
  }

  if (right.length === 0) {
    return left.length;
  }

  const matrix = Array.from({ length: left.length + 1 }, () =>
    new Array<number>(right.length + 1).fill(0),
  );

  for (let row = 0; row <= left.length; row += 1) {
    const currentRow = matrix[row];

    if (currentRow !== undefined) {
      currentRow[0] = row;
    }
  }

  const firstRow = matrix[0];

  for (let column = 0; column <= right.length; column += 1) {
    if (firstRow !== undefined) {
      firstRow[column] = column;
    }
  }

  for (let row = 1; row <= left.length; row += 1) {
    const currentRow = matrix[row];

    for (let column = 1; column <= right.length; column += 1) {
      const substitutionCost = left[row - 1] === right[column - 1] ? 0 : 1;
      let distance = Math.min(
        getMatrixCell(matrix, row - 1, column) + 1,
        getMatrixCell(matrix, row, column - 1) + 1,
        getMatrixCell(matrix, row - 1, column - 1) + substitutionCost,
      );

      if (
        row > 1 &&
        column > 1 &&
        left[row - 1] === right[column - 2] &&
        left[row - 2] === right[column - 1]
      ) {
        distance = Math.min(
          distance,
          getMatrixCell(matrix, row - 2, column - 2) + substitutionCost,
        );
      }

      if (currentRow !== undefined) {
        currentRow[column] = distance;
      }
    }
  }

  return getMatrixCell(matrix, left.length, right.length);
}

function getMatrixCell(
  matrix: ReadonlyArray<ReadonlyArray<number>>,
  row: number,
  column: number,
): number {
  return matrix[row]?.[column] ?? Number.POSITIVE_INFINITY;
}

function createDeterministicRandom(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x100000000;
  };
}

function randomWord(random: () => number): string {
  const segments = [
    "",
    "a",
    "e",
    "i",
    "o",
    "u",
    "A",
    "B",
    "C",
    "x",
    "y",
    "z",
    "-",
    "_",
    " ",
    "é",
    "ñ",
    "ü",
    "日本",
    "語",
  ];
  const length = Math.floor(random() * 8);
  let word = "";

  for (let index = 0; index < length; index += 1) {
    word += segments[Math.floor(random() * segments.length)] ?? "";
  }

  return word;
}

function normalizeForReference(value: string): string {
  const trimmedLower = value.trim().toLowerCase();

  if (trimmedLower.length === 0 || !supportsUnicodeNormalize()) {
    return replaceBasicDiacritics(
      trimmedLower.replace(/[\u0300-\u036f]+/g, ""),
    );
  }

  if (supportsUnicodePropertyEscapes()) {
    return trimmedLower
      .normalize("NFD")
      .replace(/\p{M}+/gu, "")
      .normalize("NFC");
  }

  return trimmedLower
    .normalize("NFD")
    .replace(/[\u0300-\u036f]+/g, "")
    .normalize("NFC");
}

function supportsUnicodeNormalize(): boolean {
  try {
    return "é".normalize("NFD") !== "é";
  } catch {
    return false;
  }
}

function supportsUnicodePropertyEscapes(): boolean {
  try {
    return /\p{M}/u.test("\u0301");
  } catch {
    return false;
  }
}

function replaceBasicDiacritics(value: string): string {
  return value
    .replace(/[àáâãäåāăąǎȁȃȧạảấầẩẫậắằẳẵặ]/g, "a")
    .replace(/[çćĉċč]/g, "c")
    .replace(/[èéêëēĕėęěȅȇẹẻẽếềểễệ]/g, "e")
    .replace(/[ìíîïĩīĭįǐȉȋịỉ]/g, "i")
    .replace(/[ñńņň]/g, "n")
    .replace(/[òóôõöōŏőǒȍȏơọỏốồổỗộớờởỡợ]/g, "o")
    .replace(/[ùúûüũūŭůűųǔȕȗưụủứừửữự]/g, "u")
    .replace(/[ýÿŷỳỵỷỹ]/g, "y");
}
