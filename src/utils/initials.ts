interface GraphemeSegmenter {
  segment(value: string): Iterable<{ segment: string }>;
}

type IntlWithSegmenter = typeof Intl & {
  Segmenter?: new (
    locales?: string | string[],
    options?: { granularity: "grapheme" }
  ) => GraphemeSegmenter;
};

function isCombiningMark(codePoint: number): boolean {
  return (
    (codePoint >= 0x0300 && codePoint <= 0x036f) ||
    (codePoint >= 0x1ab0 && codePoint <= 0x1aff) ||
    (codePoint >= 0x1dc0 && codePoint <= 0x1dff) ||
    (codePoint >= 0x20d0 && codePoint <= 0x20ff) ||
    (codePoint >= 0xfe20 && codePoint <= 0xfe2f)
  );
}

function isEmojiModifier(codePoint: number): boolean {
  return codePoint >= 0x1f3fb && codePoint <= 0x1f3ff;
}

function isRegionalIndicator(codePoint: number): boolean {
  return codePoint >= 0x1f1e6 && codePoint <= 0x1f1ff;
}

function lastCodePoint(value: string): number {
  const codePoints = Array.from(value);
  return codePoints[codePoints.length - 1]?.codePointAt(0) || 0;
}

/** Splits a string into visible grapheme clusters without breaking emoji or accents. */
export function splitGraphemes(value: string): string[] {
  const Segmenter = (Intl as IntlWithSegmenter).Segmenter;
  if (Segmenter) {
    return Array.from(new Segmenter(undefined, { granularity: "grapheme" }).segment(value), (part) =>
      part.segment
    );
  }

  // Older browsers do not have Intl.Segmenter. This fallback covers combining
  // marks, variation selectors, emoji modifiers, ZWJ sequences, and flags.
  const codePoints = Array.from(value);
  const clusters: string[] = [];
  for (const codePoint of codePoints) {
    const numeric = codePoint.codePointAt(0) || 0;
    const previous = clusters[clusters.length - 1];
    const previousCodePoint = previous ? lastCodePoint(previous) : 0;
    if (
      previous &&
      (isCombiningMark(numeric) ||
        numeric === 0xfe0f ||
        numeric === 0x200d ||
        isEmojiModifier(numeric) ||
        previousCodePoint === 0x200d)
    ) {
      clusters[clusters.length - 1] += codePoint;
    } else if (
      previous &&
      isRegionalIndicator(numeric) &&
      isRegionalIndicator(previousCodePoint) &&
      previous.length === 2
    ) {
      clusters[clusters.length - 1] += codePoint;
    } else {
      clusters.push(codePoint);
    }
  }
  return clusters;
}

export function countGraphemes(value: string): number {
  return splitGraphemes(value).length;
}

export function getInitials(name: string | null | undefined): string {
  if (!name || typeof name !== "string") return "";

  const words = name.trim().split(/[\s-]+/).filter(Boolean);
  if (words.length === 0) return "";

  const selected =
    words.length >= 3 ? [words[0], words[1], words[words.length - 1]] : words;
  return selected
    .map((word) => splitGraphemes(word)[0]?.toUpperCase() || "")
    .join("");
}
