const MAX_FUZZY_RESULTS = 3;

enum MatchKind {
  Exact = 0,
  Prefix = 1,
  Suffix = 2,
  Contains = 3,
  Edit = 4,
}

type NormalizedWordData = {
  normalized: string;
  codePoints: string[];
  length: number;
};

type MatchCandidate = {
  word: string;
  kind: MatchKind;
  distance: number;
  lengthDifference: number;
  index: number;
};

/**
 * Describes the outcome of a fuzzy search.
 */
export type FuzzySearchResult = {
  /**
   * Up to three candidate matches ordered by relevance.
   */
  matches: string[];
  /**
   * Indicates whether the original query existed in the input as an exact,
   * case-sensitive, non-normalized literal.
   */
  exactMatchFound: boolean;
};

const COMBINING_MARK_SEQUENCE_RE = createCombiningMarkSequenceRegex();
const HAS_FULL_UNICODE_NORMALIZE = supportsUnicodeNormalize();
const BASIC_DIACRITIC_REPLACEMENTS: ReadonlyArray<readonly [string, string]> = [
  [/[àáâãäåāăąǎȁȃȧạảấầẩẫậắằẳẵặ]/g.source, "a"],
  [/[çćĉċč]/g.source, "c"],
  [/[èéêëēĕėęěȅȇẹẻẽếềểễệ]/g.source, "e"],
  [/[ìíîïĩīĭįǐȉȋịỉ]/g.source, "i"],
  [/[ñńņň]/g.source, "n"],
  [/[òóôõöōŏőǒȍȏơọỏốồổỗộớờởỡợ]/g.source, "o"],
  [/[ùúûüũūŭůűųǔȕȗưụủứừửữự]/g.source, "u"],
  [/[ýÿŷỳỵỷỹ]/g.source, "y"],
];

/**
 * Performs a fuzzy search that combines structural matching with a bounded
 * Damerau-Levenshtein distance.
 *
 * Ranking priority, from best to worst:
 * 1. Exact normalized match
 * 2. Prefix match
 * 3. Suffix match
 * 4. Contains match
 * 5. Edit-distance match
 *
 * The edit-distance threshold adapts to the normalized query length:
 * - `<= 4` code points: `1`
 * - `<= 8` code points: `2`
 * - `> 8` code points: `3`
 *
 * The implementation is optimized for interactive lookups:
 * - normalization work is cached per distinct input word
 * - structural matches short-circuit before edit-distance work
 * - edit-distance evaluation is banded and threshold-aware
 * - only the best three matches are retained during the scan
 *
 * @param data - Candidate words to search.
 * @param query - Search query.
 * @returns The best matches plus the literal exact-match flag.
 *
 * @example
 * ```ts
 * fuzzySearch(["User", "UserService", "SuperUser"], "user")
 * // {
 * //   matches: ["User", "UserService", "SuperUser"],
 * //   exactMatchFound: false,
 * // }
 * ```
 */
export function fuzzySearch(
  data: readonly string[],
  query: string,
): FuzzySearchResult {
  if (data.length === 0) {
    return {
      matches: [],
      exactMatchFound: false,
    };
  }

  const exactMatchFound = data.includes(query);
  const normalizedQuery = normalizeFuzzyString(query);

  if (normalizedQuery.length === 0) {
    return {
      matches: collectEmptyMatches(data),
      exactMatchFound,
    };
  }

  const queryCodePoints = toCodePoints(normalizedQuery);
  const queryLength = queryCodePoints.length;
  const maxDistance = getAdaptiveDistance(queryLength);
  const normalizedWordCache = new Map<string, NormalizedWordData>();
  const topMatches: MatchCandidate[] = [];

  for (let index = 0; index < data.length; index += 1) {
    const word = data[index];

    if (word === undefined) {
      continue;
    }

    const candidate = evaluateMatch(
      word,
      index,
      normalizedQuery,
      queryCodePoints,
      queryLength,
      maxDistance,
      normalizedWordCache,
    );

    if (candidate !== null) {
      insertMatch(topMatches, candidate);
    }
  }

  return {
    matches: topMatches.map((candidate) => candidate.word),
    exactMatchFound,
  };
}

function createCombiningMarkSequenceRegex(): RegExp {
  try {
    const candidate = /\p{M}+/gu;

    if (candidate.test("\u0301")) {
      candidate.lastIndex = 0;
      return candidate;
    }
  } catch {
    // Fall through to the portable fallback below.
  }

  return /[\u0300-\u036f]+/g;
}

function supportsUnicodeNormalize(): boolean {
  try {
    return "é".normalize("NFD") !== "é";
  } catch {
    return false;
  }
}

function normalizeFuzzyString(value: string): string {
  const normalizedCase = value.trim().toLowerCase();

  if (normalizedCase.length === 0) {
    return normalizedCase;
  }

  if (!HAS_FULL_UNICODE_NORMALIZE) {
    return replaceBasicDiacritics(
      normalizedCase.replace(COMBINING_MARK_SEQUENCE_RE, ""),
    );
  }

  return normalizedCase
    .normalize("NFD")
    .replace(COMBINING_MARK_SEQUENCE_RE, "")
    .normalize("NFC");
}

function replaceBasicDiacritics(value: string): string {
  let normalized = value;

  for (const [source, replacement] of BASIC_DIACRITIC_REPLACEMENTS) {
    normalized = normalized.replace(new RegExp(source, "g"), replacement);
  }

  return normalized;
}

function collectEmptyMatches(data: readonly string[]): string[] {
  const matches: string[] = [];

  for (const word of data) {
    if (normalizeFuzzyString(word).length === 0) {
      matches.push(word);
    }

    if (matches.length === MAX_FUZZY_RESULTS) {
      break;
    }
  }

  return matches;
}

function evaluateMatch(
  word: string,
  index: number,
  normalizedQuery: string,
  queryCodePoints: readonly string[],
  queryLength: number,
  maxDistance: number,
  normalizedWordCache: Map<string, NormalizedWordData>,
): MatchCandidate | null {
  const normalizedWordData = getNormalizedWordData(word, normalizedWordCache);
  const { normalized, codePoints, length } = normalizedWordData;
  const lengthDifference = Math.abs(queryLength - length);

  if (normalized === normalizedQuery) {
    return {
      word,
      kind: MatchKind.Exact,
      distance: 0,
      lengthDifference: 0,
      index,
    };
  }

  if (normalized.startsWith(normalizedQuery)) {
    return {
      word,
      kind: MatchKind.Prefix,
      distance: 0,
      lengthDifference,
      index,
    };
  }

  if (normalized.endsWith(normalizedQuery)) {
    return {
      word,
      kind: MatchKind.Suffix,
      distance: 0,
      lengthDifference,
      index,
    };
  }

  if (normalized.includes(normalizedQuery)) {
    return {
      word,
      kind: MatchKind.Contains,
      distance: 0,
      lengthDifference,
      index,
    };
  }

  if (lengthDifference > maxDistance) {
    return null;
  }

  const distance = boundedDamerauLevenshtein(
    queryCodePoints,
    codePoints,
    maxDistance,
  );

  if (distance > maxDistance) {
    return null;
  }

  return {
    word,
    kind: MatchKind.Edit,
    distance,
    lengthDifference,
    index,
  };
}

function getNormalizedWordData(
  word: string,
  normalizedWordCache: Map<string, NormalizedWordData>,
): NormalizedWordData {
  const cached = normalizedWordCache.get(word);

  if (cached !== undefined) {
    return cached;
  }

  const normalized = normalizeFuzzyString(word);
  const codePoints = toCodePoints(normalized);
  const created: NormalizedWordData = {
    normalized,
    codePoints,
    length: codePoints.length,
  };

  normalizedWordCache.set(word, created);

  return created;
}

function toCodePoints(value: string): string[] {
  return Array.from(value);
}

function getAdaptiveDistance(queryLength: number): number {
  if (queryLength <= 4) {
    return 1;
  }

  if (queryLength <= 8) {
    return 2;
  }

  return 3;
}

function compareMatches(left: MatchCandidate, right: MatchCandidate): number {
  return (
    left.kind - right.kind ||
    left.distance - right.distance ||
    left.lengthDifference - right.lengthDifference ||
    left.index - right.index
  );
}

function insertMatch(
  matches: MatchCandidate[],
  candidate: MatchCandidate,
): void {
  let insertIndex = 0;

  while (
    insertIndex < matches.length &&
    compareMatches(matches[insertIndex] as MatchCandidate, candidate) <= 0
  ) {
    insertIndex += 1;
  }

  if (insertIndex >= MAX_FUZZY_RESULTS) {
    return;
  }

  matches.splice(insertIndex, 0, candidate);

  if (matches.length > MAX_FUZZY_RESULTS) {
    matches.pop();
  }
}

function boundedDamerauLevenshtein(
  left: readonly string[],
  right: readonly string[],
  maxDistance: number,
): number {
  const leftLength = left.length;
  const rightLength = right.length;

  if (leftLength === 0) {
    return rightLength;
  }

  if (rightLength === 0) {
    return leftLength;
  }

  if (Math.abs(leftLength - rightLength) > maxDistance) {
    return maxDistance + 1;
  }

  let previousPreviousRow = new Array<number>(rightLength + 1).fill(
    maxDistance + 1,
  );
  let previousRow = new Array<number>(rightLength + 1);
  let currentRow = new Array<number>(rightLength + 1).fill(maxDistance + 1);

  for (let column = 0; column <= rightLength; column += 1) {
    previousRow[column] = column;
  }

  for (let row = 1; row <= leftLength; row += 1) {
    const columnStart = Math.max(1, row - maxDistance);
    const columnEnd = Math.min(rightLength, row + maxDistance);
    currentRow.fill(maxDistance + 1);
    currentRow[0] = row;

    let bestInRow = currentRow[0];

    for (let column = columnStart; column <= columnEnd; column += 1) {
      const substitutionCost = left[row - 1] === right[column - 1] ? 0 : 1;

      let distance = Math.min(
        (previousRow[column] ?? maxDistance + 1) + 1,
        (currentRow[column - 1] ?? maxDistance + 1) + 1,
        (previousRow[column - 1] ?? maxDistance + 1) + substitutionCost,
      );

      if (
        row > 1 &&
        column > 1 &&
        left[row - 1] === right[column - 2] &&
        left[row - 2] === right[column - 1]
      ) {
        distance = Math.min(
          distance,
          (previousPreviousRow[column - 2] ?? maxDistance + 1) +
            substitutionCost,
        );
      }

      currentRow[column] = distance;

      if (distance < bestInRow) {
        bestInRow = distance;
      }
    }

    if (bestInRow > maxDistance) {
      return maxDistance + 1;
    }

    const completedRow = currentRow;
    currentRow = previousPreviousRow;
    previousPreviousRow = previousRow;
    previousRow = completedRow;
  }

  return previousRow[rightLength] ?? maxDistance + 1;
}
