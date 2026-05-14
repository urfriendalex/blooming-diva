import { LINE_STAGGER_S } from "@/lib/reveal-motion";

/**
 * Delay (seconds) before the reveal at global line index `lineIndex` starts.
 * Matches intra-line stagger (`LINE_STAGGER_S`) so the sequence reads top-to-bottom
 * across blocks (text and grid cells) without overlap.
 */
export function revealAfterLines(lineIndex: number): number {
  return lineIndex * LINE_STAGGER_S;
}
