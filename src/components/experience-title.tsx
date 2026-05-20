"use client";

import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { flushSync } from "react-dom";
import { memo, useCallback, useLayoutEffect, useRef, useState } from "react";

gsap.registerPlugin(Flip);

const TITLE_INTRO_FROM = {
  opacity: 0,
  scale: 0.94,
  z: -28,
  filter: "blur(10px)",
  transformOrigin: "50% 50%",
  force3D: true,
} as const;

const OVERLINE_INTRO_FROM = {
  opacity: 0,
  filter: "blur(4px)",
  force3D: true,
} as const;

const INTRO_BEAT_GAP = 0.07;

/** Stagger opacity/blur ahead of depth so the reveal eases in rather than popping. */
function animateTitleIntro(track: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    gsap
      .timeline({
        defaults: { force3D: true, transformOrigin: "50% 50%" },
        onComplete: resolve,
      })
      .to(track, { opacity: 1, duration: 0.52, ease: "power2.out" }, 0)
      .to(
        track,
        { filter: "blur(0px)", duration: 0.74, ease: "power2.out" },
        0.04,
      )
      .to(track, { scale: 1, z: 0, duration: 0.9, ease: "power3.out" }, 0);
  });
}

function animateOverlineIntro(overline: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    gsap
      .timeline({ defaults: { force3D: true }, onComplete: resolve })
      .to(overline, { opacity: 1, duration: 0.4, ease: "power2.out" }, 0)
      .to(
        overline,
        { filter: "blur(0px)", duration: 0.52, ease: "power2.out" },
        0.03,
      );
  });
}

async function animateIntroSequence(
  track: HTMLElement,
  overline: HTMLElement,
): Promise<void> {
  await animateTitleIntro(track);
  await gsap.to({}, { duration: INTRO_BEAT_GAP });
  await animateOverlineIntro(overline);
}

type ExperienceTitleProps = {
  label: string;
  overlineLabel: string;
  onClick: () => void;
  /** When true, run the intro: centered reveal, then Flip to header after window load. */
  preloader?: boolean;
  /** Fired once the Flip-to-header animation finishes. */
  onPreloaderComplete?: () => void;
};

/**
 * Binary-search font size so the nowrap track fits the bleed.
 * Measure the inner `.experience__title-reveal-track`, not the outer control — width
 * reporting on replaced/form controls is unreliable across browsers.
 */
function fitTitleFontSize(
  titleRoot: HTMLElement,
  track: HTMLElement,
  targetWidthPx: number,
): number {
  let lo = 6;
  let hi = 720;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    titleRoot.style.fontSize = `${mid}px`;
    const w = track.scrollWidth;
    if (w <= targetWidthPx) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  let px = Math.floor(lo * 1000) / 1000;
  titleRoot.style.fontSize = `${px}px`;
  while (px > 6 && track.scrollWidth > targetWidthPx) {
    px = Math.floor((px - 0.25) * 1000) / 1000;
    titleRoot.style.fontSize = `${px}px`;
  }
  return px;
}

function waitForWindowLoad(): Promise<void> {
  if (typeof document === "undefined" || document.readyState === "complete") {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    window.addEventListener("load", () => resolve(), { once: true });
  });
}

/** Match header bleed geometry so intro doesn’t re-center text (avoids a left jump on Flip). */
function getBleedFrame(bleed: HTMLElement) {
  const rect = bleed.getBoundingClientRect();
  const layoutWidth =
    typeof document !== "undefined"
      ? document.documentElement.clientWidth
      : rect.width;
  const viewportWidth =
    typeof window !== "undefined"
      ? (window.visualViewport?.width ?? layoutWidth)
      : rect.width;

  return {
    left: Math.max(0, rect.left),
    width: Math.min(rect.width, layoutWidth, viewportWidth),
  };
}

function getTitleFitWidth(bleed: HTMLElement, paddingX: number): number {
  const rect = bleed.getBoundingClientRect();
  const layoutWidth =
    typeof document !== "undefined"
      ? document.documentElement.clientWidth
      : rect.width;
  const viewportWidth =
    typeof window !== "undefined"
      ? (window.visualViewport?.width ?? layoutWidth)
      : rect.width;
  const effectiveWidth = Math.min(
    bleed.clientWidth,
    rect.width,
    layoutWidth,
    viewportWidth,
  );
  return Math.max(32, (effectiveWidth - paddingX) * 0.998);
}

function ExperienceTitleComponent({
  label,
  overlineLabel,
  onClick,
  preloader = false,
  onPreloaderComplete,
}: ExperienceTitleProps) {
  const bleedRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const introStartedRef = useRef(false);
  const introFinishedRef = useRef(false);
  /** Declarative “surface visible” so CSS opacity survives parent re-renders during the intro. */
  const [introSurface, setIntroSurface] = useState(false);
  const scheduleIntroSurface = useCallback((visible: boolean) => {
    queueMicrotask(() => {
      setIntroSurface((current) => (current === visible ? current : visible));
    });
  }, []);

  const applyFit = useCallback(() => {
    const bleed = bleedRef.current;
    const titleRoot = titleRef.current;
    const track = titleRoot?.querySelector<HTMLElement>(
      ".experience__title-reveal-track",
    );
    if (!bleed || !titleRoot || !track) {
      return;
    }
    const styles = window.getComputedStyle(titleRoot);
    const paddingX =
      Number.parseFloat(styles.paddingLeft) +
      Number.parseFloat(styles.paddingRight);
    const target = getTitleFitWidth(bleed, paddingX);
    if (target < 32) {
      return;
    }
    fitTitleFontSize(titleRoot, track, target);
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onClick();
      }
    },
    [onClick],
  );

  useLayoutEffect(() => {
    const run = () => {
      applyFit();
    };
    if (typeof document === "undefined" || !document.fonts) {
      run();
      return;
    }
    void document.fonts.ready.then(() => {
      requestAnimationFrame(run);
    });
  }, [applyFit, label]);

  useLayoutEffect(() => {
    const bleed = bleedRef.current;
    if (!bleed) {
      return;
    }
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(applyFit);
    });
    ro.observe(bleed);
    window.addEventListener("orientationchange", applyFit);
    window.visualViewport?.addEventListener("resize", applyFit);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", applyFit);
      window.visualViewport?.removeEventListener("resize", applyFit);
    };
  }, [applyFit]);

  useLayoutEffect(() => {
    if (!preloader) {
      scheduleIntroSurface(false);
      const titleRoot = titleRef.current;
      const track = titleRoot?.querySelector<HTMLElement>(
        ".experience__title-reveal-track",
      );
      const overline = titleRoot?.querySelector<HTMLElement>(
        ".experience__title-overline",
      );
      const clip = titleRoot?.querySelector<HTMLElement>(
        ".experience__title-reveal-clip",
      );
      if (titleRoot) {
        gsap.killTweensOf(titleRoot);
        gsap.set(titleRoot, { clearProps: "opacity,visibility" });
      }
      if (clip) {
        gsap.set(clip, { clearProps: "perspective" });
      }
      if (track) {
        gsap.killTweensOf(track);
        gsap.set(track, {
          clearProps: "opacity,transform,filter,transformOrigin",
        });
      }
      if (overline) {
        gsap.killTweensOf(overline);
        gsap.set(overline, { clearProps: "opacity,filter" });
      }
      introStartedRef.current = false;
      introFinishedRef.current = false;
      return;
    }
    if (introStartedRef.current) {
      return;
    }

    const bleed = bleedRef.current;
    const titleRoot = titleRef.current;
    const track = titleRoot?.querySelector<HTMLElement>(
      ".experience__title-reveal-track",
    );
    const overline = titleRoot?.querySelector<HTMLElement>(
      ".experience__title-overline",
    );
    const clip = titleRoot?.querySelector<HTMLElement>(
      ".experience__title-reveal-clip",
    );
    if (!bleed || !titleRoot || !track || !overline || !clip) {
      return;
    }

    scheduleIntroSurface(false);

    /* Before any await (fonts.load etc.): hide title so first paint cannot show header slot. */
    gsap.set(titleRoot, { opacity: 0 });

    introStartedRef.current = true;
    let cancelled = false;

    const ctx = gsap.context(() => {
      const reduceMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const runIntro = async () => {
        applyFit();
        if (cancelled) {
          return;
        }
        await new Promise<void>((r) =>
          requestAnimationFrame(() => requestAnimationFrame(() => r())),
        );
        if (cancelled) {
          return;
        }

        bleed.classList.add("experience__title-bleed--preloader-slot");

        /* Depth reveal: scale + blur toward camera (center origin), no xy translate. */
        if (reduceMotion) {
          gsap.set(clip, { clearProps: "perspective" });
          gsap.set(track, { opacity: 1, scale: 1, z: 0, filter: "blur(0px)" });
          gsap.set(overline, { opacity: 1, filter: "blur(0px)" });
        } else {
          gsap.set(clip, { perspective: 1100 });
          gsap.set(track, TITLE_INTRO_FROM);
          gsap.set(overline, OVERLINE_INTRO_FROM);
        }

        flushSync(() => {
          setIntroSurface(true);
        });

        const bleedFrame = getBleedFrame(bleed);
        gsap.set(titleRoot, {
          position: "fixed",
          left: bleedFrame.left,
          top: "50%",
          yPercent: -50,
          width: bleedFrame.width,
          textAlign: "left",
          boxSizing: "border-box",
          zIndex: 10050,
          opacity: 1,
        });

        if (cancelled) {
          return;
        }

        if (!reduceMotion) {
          await animateIntroSequence(track, overline);
          gsap.set(track, { clearProps: "transform,filter,transformOrigin" });
          gsap.set(overline, { clearProps: "filter" });
          gsap.set(clip, { clearProps: "perspective" });
        }
        if (cancelled) {
          return;
        }

        await waitForWindowLoad();
        if (cancelled) {
          return;
        }

        const bleedFrameBeforeFlip = getBleedFrame(bleed);
        gsap.set(titleRoot, {
          left: bleedFrameBeforeFlip.left,
          width: bleedFrameBeforeFlip.width,
        });

        /** Record fixed intro layout, then snap to natural header in the DOM; Flip animates into place. */
        const state = Flip.getState(titleRoot);

        bleed.classList.remove("experience__title-bleed--preloader-slot");
        gsap.set(titleRoot, {
          clearProps:
            "position,left,top,width,textAlign,boxSizing,zIndex,xPercent,yPercent,transform",
        });
        gsap.set(titleRoot, { opacity: 1 });

        Flip.from(state, {
          duration: reduceMotion ? 0.05 : 0.75,
          ease: "power3.inOut",
          absolute: true,
          simple: true,
          onComplete: () => {
            introFinishedRef.current = true;
            gsap.set(titleRoot, {
              clearProps:
                "transform,x,y,xPercent,yPercent,left,top,width,textAlign",
            });
            gsap.set(titleRoot, { opacity: 1 });
            gsap.set(track, { clearProps: "opacity,transform,filter" });
            gsap.set(overline, { clearProps: "opacity,filter" });
            onPreloaderComplete?.();
          },
        });
      };

      void runIntro();
    }, titleRoot);

    return () => {
      cancelled = true;
      if (!introFinishedRef.current) {
        ctx.revert();
      }
      introStartedRef.current = false;
    };
  }, [preloader, applyFit, onPreloaderComplete, scheduleIntroSurface]);

  return (
    <div className="experience__title-bleed" ref={bleedRef}>
      <div
        ref={titleRef}
        role="button"
        tabIndex={0}
        className={`experience__title${
          introSurface ? " experience__title--intro-surface" : ""
        }`}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        aria-label={label}
      >
        <span className="experience__title-reveal-clip">
          <span className="experience__title-reveal-track">{label}</span>
        </span>
        <span className="experience__title-overline" aria-hidden="true">
          {overlineLabel}
        </span>
      </div>
    </div>
  );
}

export const ExperienceTitle = memo(ExperienceTitleComponent);
