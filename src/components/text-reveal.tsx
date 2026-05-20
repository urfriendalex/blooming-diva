"use client";

import { gsap } from "gsap";
import { type ReactNode, type RefObject, useEffect, useLayoutEffect, useRef } from "react";

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

function showRevealed(inners: gsap.TweenTarget) {
  gsap.killTweensOf(inners);
  gsap.set(inners, { yPercent: 0, clearProps: "transform" });
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
  const measureRef = useRef<HTMLSpanElement | null>(null);
  const hasAnimatedRef = useRef(false);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const lines = useVisualLines(text, measureRef);

  useEffect(() => {
    hasAnimatedRef.current = false;
    tweenRef.current?.kill();
    tweenRef.current = null;
  }, [text]);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || lines.length === 0) {
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
      showRevealed(inners);
      markUnderlineRevealed(underlineHosts);
      return;
    }

    if (reduceMotion) {
      showRevealed(inners);
      markUnderlineRevealed(underlineHosts);
      if (playOnce) {
        hasAnimatedRef.current = true;
      }
      return;
    }

    tweenRef.current?.kill();

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
      tweenRef.current = gsap.to(inners, {
        yPercent: 0,
        duration: DURATION_TRANSFORM_S,
        delay: blockDelay,
        stagger: LINE_STAGGER_S,
        ease: EASE_TRANSFORM,
        force3D: false,
        onComplete: () => {
          showRevealed(inners);
          if (playOnce) {
            hasAnimatedRef.current = true;
          }
          markUnderlineRevealed(underlineHosts);
        },
      });
    };

    const tryPlay = () => {
      if (isElementInViewport(root)) {
        play();
      }
    };

    tryPlay();

    let observer: IntersectionObserver | null = null;
    if (!played) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            play();
            observer?.disconnect();
          }
        },
        { root: null, rootMargin: "0px 0px 20% 0px", threshold: 0 },
      );
      observer.observe(root);
    }

    const failsafeMs =
      (blockDelay +
        DURATION_TRANSFORM_S +
        Math.max(0, inners.length - 1) * LINE_STAGGER_S +
        0.35) *
      1000;
    const failsafeId = window.setTimeout(() => {
      if (!played) {
        play();
      }
      showRevealed(inners);
      markUnderlineRevealed(underlineHosts);
      if (playOnce) {
        hasAnimatedRef.current = true;
      }
    }, failsafeMs);

    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(tryPlay);
    });

    return () => {
      window.clearTimeout(failsafeId);
      cancelAnimationFrame(rafId);
      observer?.disconnect();
      tweenRef.current?.kill();
      tweenRef.current = null;
      if (!(playOnce && hasAnimatedRef.current)) {
        clearUnderlineState(underlineHosts);
      }
    };
  }, [lines, text, blockDelay, playOnce]);

  useEffect(() => {
    return () => {
      tweenRef.current?.kill();
    };
  }, []);

  const mergedClass = [
    "text-reveal",
    tag === "span" ? "text-reveal--as-span" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const children: ReactNode =
    lines.length === 0 ? null : (
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

  const measureProbe = (
    <span ref={measureRef} className="text-reveal__measure" aria-hidden="true">
      {text}
    </span>
  );

  switch (tag) {
    case "h2":
      return (
        <h2 ref={ref as RefObject<HTMLHeadingElement | null>} className={mergedClass}>
          {measureProbe}
          {children}
        </h2>
      );
    case "h3":
      return (
        <h3 ref={ref as RefObject<HTMLHeadingElement | null>} className={mergedClass}>
          {measureProbe}
          {children}
        </h3>
      );
    case "span":
      return (
        <span ref={ref as RefObject<HTMLSpanElement | null>} className={mergedClass}>
          {measureProbe}
          {children}
        </span>
      );
    case "div":
      return (
        <div ref={ref as RefObject<HTMLDivElement | null>} className={mergedClass}>
          {measureProbe}
          {children}
        </div>
      );
    default:
      return (
        <p ref={ref as RefObject<HTMLParagraphElement | null>} className={mergedClass}>
          {measureProbe}
          {children}
        </p>
      );
  }
}
