/**
 * Split text into visual lines using the same layout rules as normal HTML/CSS:
 * a hidden probe mirrors the target element’s width and typography, then we read
 * line breaks from the rendered text node (per-character line boxes).
 */

const TOP_EPS = 1;

/** Unify newlines; keep `\n` for `white-space: pre-line`. Trim outer whitespace only. */
export function normalizeTextForMeasure(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
}

/**
 * Line breaks where the browser would break: soft wrap + `\n` (with `white-space: pre-line`).
 */
export function linesFromDomTextNode(textNode: Text): string[] {
  const full = textNode.data;
  if (full.length === 0) {
    return [];
  }

  const range = document.createRange();
  const lines: string[] = [];
  let lineStart = 0;

  const charTop = (i: number) => {
    range.setStart(textNode, i);
    range.setEnd(textNode, Math.min(i + 1, full.length));
    return range.getBoundingClientRect().top;
  };

  for (let i = 1; i < full.length; i++) {
    const tPrev = charTop(i - 1);
    const tCurr = charTop(i);
    if (Math.abs(tPrev - tCurr) > TOP_EPS) {
      lines.push(full.slice(lineStart, i));
      lineStart = i;
    }
  }
  lines.push(full.slice(lineStart));
  return lines;
}

function applyProbeTypography(probe: HTMLDivElement, cs: CSSStyleDeclaration): void {
  probe.style.boxSizing = cs.boxSizing;
  probe.style.display = "block";
  /** Must match the target (e.g. `nowrap` on `.topic-detail__link .text-reveal`), not a global default. */
  probe.style.whiteSpace = cs.whiteSpace;
  probe.style.wordBreak = cs.wordBreak;
  probe.style.overflowWrap = cs.overflowWrap;
  probe.style.setProperty("hyphens", cs.getPropertyValue("hyphens"));
  probe.style.font = cs.font;
  probe.style.fontSize = cs.fontSize;
  probe.style.fontFamily = cs.fontFamily;
  probe.style.fontWeight = cs.fontWeight;
  probe.style.fontStyle = cs.fontStyle;
  probe.style.fontVariant = cs.fontVariant;
  probe.style.lineHeight = cs.lineHeight;
  probe.style.letterSpacing = cs.letterSpacing;
  probe.style.wordSpacing = cs.wordSpacing;
  probe.style.textTransform = cs.textTransform;
  probe.style.padding = cs.padding;
  probe.style.border = cs.border;
  probe.style.textAlign = cs.textAlign;
}

/**
 * Measure visual lines for `text` as if it were flowing in `element` (width + typography).
 */
export function measureVisualLines(text: string, element: HTMLElement): string[] {
  const normalized = normalizeTextForMeasure(text);
  if (normalized.length === 0) {
    return [];
  }

  const cs = getComputedStyle(element);
  if (cs.whiteSpace === "nowrap") {
    return [normalized];
  }

  const probe = document.createElement("div");
  probe.setAttribute("aria-hidden", "true");
  Object.assign(probe.style, {
    position: "absolute",
    left: "-9999px",
    top: "0",
    visibility: "hidden",
    pointerEvents: "none",
    zIndex: "-1",
    width: `${element.getBoundingClientRect().width}px`,
  });
  applyProbeTypography(probe, cs);
  if (element.lang) {
    probe.lang = element.lang;
  }
  probe.dir = element.dir;

  probe.textContent = normalized;
  document.body.appendChild(probe);

  const tn = probe.firstChild;
  let lines: string[];
  if (!tn || tn.nodeType !== Node.TEXT_NODE) {
    lines = [normalized];
  } else {
    lines = linesFromDomTextNode(tn as Text);
  }

  document.body.removeChild(probe);
  return lines.length > 0 ? lines : [normalized];
}
