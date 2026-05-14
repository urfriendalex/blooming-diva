/** Typical wrapped line length for stagger estimates (narrow column / mobile-ish). */
const DEFAULT_CHARS_PER_LINE = 46;

/**
 * Rough line count for reveal timing when layout isn’t available yet.
 * Newlines start new segments; each segment uses at least one wrapped line by length.
 */
export function estimateLineCount(text: string, charsPerLine = DEFAULT_CHARS_PER_LINE): number {
  const trimmed = text.trim();
  if (!trimmed) {
    return 0;
  }
  const segments = trimmed.split(/\n+/);
  let total = 0;
  for (const segment of segments) {
    total += Math.max(1, Math.ceil(segment.length / charsPerLine));
  }
  return total;
}
