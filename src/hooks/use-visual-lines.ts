"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  type RefObject,
} from "react";

import { measureVisualLines } from "@/lib/visual-line-wrap";

function linesEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((line, index) => line === b[index]);
}

/**
 * Splits `text` into visual lines matching normal HTML/CSS wrapping on `ref`
 * (width, typography, `pre-line` for `\n`), for line-by-line reveals.
 */
export function useVisualLines<T extends HTMLElement>(
  text: string,
  ref: RefObject<T | null>,
): string[] | null {
  const [lines, setLines] = useState<string[] | null>(null);

  const relayout = useCallback(() => {
    const el = ref.current;
    if (!el) {
      return false;
    }

    const width = el.getBoundingClientRect().width;
    if (width <= 0) {
      return false;
    }

    const next = measureVisualLines(text, el);
    setLines((prev) => {
      if (prev && linesEqual(prev, next)) {
        return prev;
      }
      return next;
    });
    return true;
  }, [text, ref]);

  const scheduleLayout = useCallback(() => {
    const tick = () => {
      const el = ref.current;
      if (!el) {
        return;
      }
      if (!relayout()) {
        requestAnimationFrame(tick);
      }
    };
    tick();
  }, [relayout, ref]);

  useLayoutEffect(() => {
    if (!relayout()) {
      scheduleLayout();
    }

    if (typeof document === "undefined" || !document.fonts) {
      return;
    }
    void document.fonts.ready.then(scheduleLayout);
  }, [relayout, scheduleLayout]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const onLoad = () => {
      scheduleLayout();
    };

    if (document.readyState === "complete") {
      scheduleLayout();
      return;
    }

    window.addEventListener("load", onLoad, { once: true });
    return () => {
      window.removeEventListener("load", onLoad);
    };
  }, [scheduleLayout]);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    let lastWidth = 0;
    const ro = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      if (width > 0 && width !== lastWidth) {
        lastWidth = width;
        scheduleLayout();
      }
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  }, [scheduleLayout, ref]);

  return lines;
}
