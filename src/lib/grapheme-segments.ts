/**
 * Grapheme clusters for animation / one span per visible unit (Intl.Segmenter).
 */
const segmenter =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;

/** Fallback when Intl.Segmenter is unavailable (very old runtimes). */
export function splitGraphemeClusters(text: string): string[] {
  if (!segmenter) {
    return Array.from(text);
  }
  return [...segmenter.segment(text)].map((s) => s.segment);
}
