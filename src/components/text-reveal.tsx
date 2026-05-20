"use client";

import { gsap } from "gsap";
import { type ReactNode, type RefObject, useLayoutEffect, useRef } from "react";

import { useVisualLines } from "@/hooks/use-visual-lines";
import {
  DURATION_TRANSFORM_S,
  EASE_TRANSFORM,
  LINE_STAGGER_S,
} from "@/lib/reveal-motion";

export type TextRevealProps = {
  text: string;
  as?: "p" | "h2" | "h3" | "span" | "div";
  className?: string;
  lineClassName?: string;
  /** Optional: wrap each line’s text (e.g. `<a>`); must stay inside the animated inner layer. */
  renderLine?: (line: string, index: number) => ReactNode;
  /**
   * Delay (seconds) before this block’s first line starts — use with `revealAfterLines(lineIndex)` so
   * sibling blocks follow top-to-bottom in the same cadence as intra-block line stagger.
   */
  blockDelay?: number;
  /**
   * If true, the line animation runs at most once for this component instance — subsequent
   * effect runs (e.g. parent `blockDelay` changing) keep the final revealed state without replaying.
   */
  playOnce?: boolean;
};

function isElementInViewport(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  const vh = typeof window !== "undefined" ? window.innerHeight : 0;
  if (vh <= 0) {
    return false;
  }
  return rect.top < vh && rect.bottom > 0;
}

/** `a.text-link--drawn`, or submit button ink `::before` + TextReveal (sticky CTAs have no drawn line). */
function getUnderlineHosts(root: HTMLElement): HTMLElement[] {
  const anchors = [...root.querySelectorAll<HTMLElement>("a.text-link--drawn")];
  if (anchors.length > 0) {
    return anchors;
  }
  const button = root.closest<HTMLElement>("button.signup-form__button");
  return button ? [button] : [];
}

function clearUnderlineState(hosts: HTMLElement[]) {
  hosts.forEach((el) => {
    el.classList.remove("text-reveal-underline--pending", "text-reveal-underline--ready");
  });
}

/** Anchors: only clear `pending` so the line stays off until hover. Buttons: add `ready` for the submit ink `::before` reveal. */
function markUnderlineRevealed(hosts: HTMLElement[]) {
  hosts.forEach((el) => {
    el.classList.remove("text-reveal-underline--pending");
    if (el.matches("button.signup-form__button")) {
      el.classList.add("text-reveal-underline--ready");
    }
  });
}

export function TextReveal({
  text,
  as: tag = "p",
  className,
  lineClassName,
  renderLine,
  blockDelay = 0,
  playOnce = false,
}: TextRevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const hasAnimatedRef = useRef(false);
  const lines = useVisualLines(text, ref as RefObject<HTMLElement | null>);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || lines === null || lines.length === 0) {
      return;
    }

    const inners = root.querySelectorAll<HTMLElement>(".text-reveal__inner");
    if (inners.length === 0) {
      return;
    }

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const underlineHosts = getUnderlineHosts(root);

    if (playOnce && hasAnimatedRef.current) {
      gsap.set(inners, { yPercent: 0 });
      markUnderlineRevealed(underlineHosts);
      return;
    }

    const ctx = gsap.context(() => {
      if (reduceMotion) {
        gsap.set(inners, { yPercent: 0 });
        markUnderlineRevealed(underlineHosts);
        if (playOnce) {
          hasAnimatedRef.current = true;
        }
        return;
      }

      underlineHosts.forEach((el) => el.classList.add("text-reveal-underline--pending"));

      gsap.set(inners, {
        yPercent: 100,
        transformOrigin: "50% 100%",
        force3D: false,
      });

      let played = false;
      const play = () => {
        if (played) {
          return;
        }
        played = true;
        gsap.to(inners, {
          yPercent: 0,
          duration: DURATION_TRANSFORM_S,
          delay: blockDelay,
          stagger: LINE_STAGGER_S,
          ease: EASE_TRANSFORM,
          force3D: false,
          onComplete: () => {
            if (playOnce) {
              hasAnimatedRef.current = true;
            }
            markUnderlineRevealed(underlineHosts);
          },
        });
      };

      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry?.isIntersecting) {
            play();
            observer.disconnect();
          }
        },
        {
          root: null,
          rootMargin: "0px",
          threshold: 0,
        },
      );

      observer.observe(root);

      const tryPlayIfAlreadyVisible = () => {
        if (isElementInViewport(root)) {
          play();
          observer.disconnect();
        }
      };

      requestAnimationFrame(() => {
        requestAnimationFrame(tryPlayIfAlreadyVisible);
      });
    }, root);

    return () => {
      ctx.revert();
      if (!(playOnce && hasAnimatedRef.current)) {
        clearUnderlineState(underlineHosts);
      }
    };
  }, [lines, text, blockDelay, playOnce]);

  const mergedClass = [
    "text-reveal",
    tag === "span" ? "text-reveal--as-span" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const children: ReactNode =
    lines === null ? (
      text
    ) : lines.length === 0 ? null : (
      lines.map((line, index) => (
        <span
          key={`${index}-${line.slice(0, 24)}`}
          className={["text-reveal__line", "pretext-flow__line", lineClassName].filter(Boolean).join(" ")}
        >
          <span className="text-reveal__inner">
            {renderLine ? renderLine(line, index) : line}
          </span>
        </span>
      ))
    );

  switch (tag) {
    case "h2":
      return (
        <h2 ref={ref as RefObject<HTMLHeadingElement | null>} className={mergedClass}>
          {children}
        </h2>
      );
    case "h3":
      return (
        <h3 ref={ref as RefObject<HTMLHeadingElement | null>} className={mergedClass}>
          {children}
        </h3>
      );
    case "span":
      return (
        <span ref={ref as RefObject<HTMLSpanElement | null>} className={mergedClass}>
          {children}
        </span>
      );
    case "div":
      return (
        <div ref={ref as RefObject<HTMLDivElement | null>} className={mergedClass}>
          {children}
        </div>
      );
    default:
      return (
        <p ref={ref as RefObject<HTMLParagraphElement | null>} className={mergedClass}>
          {children}
        </p>
      );
  }
}
