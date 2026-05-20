"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

import {
  measureVisualLines,
  normalizeTextForMeasure,
} from "@/lib/visual-line-wrap";

function linesEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((line, index) => line === b[index]);
}

function fallbackLines(text: string): string[] {
  const normalized = normalizeTextForMeasure(text);
  return normalized.length > 0 ? [normalized] : [];
}

/**
 * Splits `text` into visual lines matching normal HTML/CSS wrapping on `ref`
 * (width, typography, `pre-line` for `\n`), for line-by-line reveals.
 *
 * Always returns at least one segment so callers can render masked lines on the first frame.
 * Line breaks are refined once layout width is known; remeasure runs only when width changes.
 */
export function useVisualLines<T extends HTMLElement>(
  text: string,
  ref: RefObject<T | null>,
): string[] {
  const [lines, setLines] = useState<string[]>(() => fallbackLines(text));
  const measuredWidthRef = useRef(0);

  const applyMeasure = useCallback(
    (width: number) => {
      const el = ref.current;
      if (!el || width <= 0) {
        return false;
      }

      const next = measureVisualLines(text, el);
      measuredWidthRef.current = width;
      setLines((prev) => (linesEqual(prev, next) ? prev : next));
      return true;
    },
    [text, ref],
  );

  const relayout = useCallback(() => {
    const el = ref.current;
    if (!el) {
      return false;
    }
    return applyMeasure(el.getBoundingClientRect().width);
  }, [applyMeasure, ref]);

  const scheduleLayout = useCallback(() => {
    const tick = () => {
      if (relayout()) {
        return;
      }
      requestAnimationFrame(tick);
    };
    tick();
  }, [relayout]);

  useLayoutEffect(() => {
    setLines((prev) => {
      const fallback = fallbackLines(text);
      return linesEqual(prev, fallback) ? prev : fallback;
    });
    measuredWidthRef.current = 0;
    if (!relayout()) {
      scheduleLayout();
    }
  }, [text, relayout, scheduleLayout]);

  useEffect(() => {
    if (typeof document === "undefined" || !document.fonts) {
      return;
    }

    const timeout = window.setTimeout(() => {
      scheduleLayout();
    }, 120);

    void document.fonts.ready.then(() => {
      window.clearTimeout(timeout);
      scheduleLayout();
    });

    return () => {
      window.clearTimeout(timeout);
    };
  }, [scheduleLayout, text]);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    let lastWidth = measuredWidthRef.current;
    const ro = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      if (width > 0 && Math.abs(width - lastWidth) > 0.5) {
        lastWidth = width;
        applyMeasure(width);
      }
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  }, [applyMeasure, ref, text]);

  return lines;
}
