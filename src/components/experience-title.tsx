"use client";

import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { flushSync } from "react-dom";
import {
  memo,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { splitGraphemeClusters } from "@/lib/grapheme-segments";

gsap.registerPlugin(Flip);

type ExperienceTitleProps = {
  label: string;
  onClick: () => void;
  /** When true, run the intro: centered mask reveal, then Flip to header after window load. */
  preloader?: boolean;
  /** Fired once the Flip-to-header animation finishes. */
  onPreloaderComplete?: () => void;
};

/**
 * Binary-search font size so the nowrap track fits the bleed.
 * Important: do not use `button.scrollWidth` — native `<button>` layout often reports
 * scrollWidth no wider than the box even when inline content overflows, so the fit
 * would be wrong. Measure the inner `.experience__title-reveal-track` instead.
 */
function fitTitleFontSize(
  button: HTMLButtonElement,
  track: HTMLElement,
  targetWidthPx: number,
): number {
  let lo = 6;
  let hi = 720;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    button.style.fontSize = `${mid}px`;
    const w = track.scrollWidth;
    if (w <= targetWidthPx) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  let px = Math.floor(lo * 1000) / 1000;
  button.style.fontSize = `${px}px`;
  while (px > 6 && track.scrollWidth > targetWidthPx) {
    px = Math.floor((px - 0.25) * 1000) / 1000;
    button.style.fontSize = `${px}px`;
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

function ExperienceTitleComponent({
  label,
  onClick,
  preloader = false,
  onPreloaderComplete,
}: ExperienceTitleProps) {
  const bleedRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
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
    const button = buttonRef.current;
    const track = button?.querySelector<HTMLElement>(".experience__title-reveal-track");
    if (!bleed || !button || !track) {
      return;
    }
    const styles = window.getComputedStyle(button);
    const paddingX =
      Number.parseFloat(styles.paddingLeft) + Number.parseFloat(styles.paddingRight);
    const target = bleed.clientWidth - paddingX;
    if (target < 32) {
      return;
    }
    fitTitleFontSize(button, track, target);
  }, []);

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
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", applyFit);
    };
  }, [applyFit]);

  useLayoutEffect(() => {
    if (!preloader) {
      scheduleIntroSurface(false);
      const button = buttonRef.current;
      if (button) {
        gsap.killTweensOf(button);
        const inners = button.querySelectorAll<HTMLElement>(
          ".experience__title-reveal-track .experience__title-char-inner",
        );
        gsap.killTweensOf(inners);
        gsap.set(button, { clearProps: "opacity,visibility" });
        gsap.set(inners, { clearProps: "transform" });
      }
      introStartedRef.current = false;
      introFinishedRef.current = false;
      return;
    }
    if (introStartedRef.current) {
      return;
    }

    const bleed = bleedRef.current;
    const button = buttonRef.current;
    if (!bleed || !button) {
      return;
    }

    scheduleIntroSurface(false);

    /* Before any await (fonts.load etc.): hide title so first paint cannot show header slot. */
    gsap.set(button, { opacity: 0 });

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
        await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
        if (cancelled) {
          return;
        }

        bleed.classList.add("experience__title-bleed--preloader-slot");

        const inners = button.querySelectorAll<HTMLElement>(
          ".experience__title-reveal-track .experience__title-char-inner",
        );

        /* Mask glyphs below the line before the button becomes visible — avoids one frame of full text. */
        if (reduceMotion) {
          gsap.set(inners, { yPercent: 0 });
        } else {
          gsap.set(inners, { yPercent: 110 });
        }

        flushSync(() => {
          setIntroSurface(true);
        });

        gsap.set(button, {
          position: "fixed",
          left: "50%",
          top: "50%",
          xPercent: -50,
          yPercent: -50,
          width: "100vw",
          textAlign: "center",
          zIndex: 10050,
          opacity: 1,
        });

        if (cancelled) {
          return;
        }

        if (reduceMotion) {
          /* already at 0 */
        } else {
          await new Promise<void>((resolve) => {
            gsap.to(inners, {
              yPercent: 0,
              duration: 0.4125,
              stagger: 0.02625,
              ease: "power2.out",
              onComplete: resolve,
            });
          });
        }
        if (cancelled) {
          return;
        }

        await waitForWindowLoad();
        if (cancelled) {
          return;
        }

        /** Record centered/fixed layout, then snap to natural header in the DOM; Flip animates from center → header. */
        const state = Flip.getState(button);

        bleed.classList.remove("experience__title-bleed--preloader-slot");
        gsap.set(button, {
          clearProps:
            "position,left,top,width,textAlign,zIndex,xPercent,yPercent,transform",
        });
        gsap.set(button, { opacity: 1 });

        Flip.from(state, {
          duration: reduceMotion ? 0.05 : 0.8625,
          ease: "power3.inOut",
          absolute: true,
          simple: true,
          onComplete: () => {
            introFinishedRef.current = true;
            gsap.set(button, { clearProps: "transform" });
            gsap.set(button, { opacity: 1 });
            /* After title has finished moving into the header, parent reveals the rest of the page. */
            onPreloaderComplete?.();
          },
        });
      };

      void runIntro();
    }, button);

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
      <button
        ref={buttonRef}
        className={`experience__title${
          introSurface ? " experience__title--intro-surface" : ""
        }`}
        type="button"
        onClick={onClick}
        aria-label={label}
      >
        <span className="experience__title-reveal-clip">
          <span className="experience__title-reveal-track">
            {splitGraphemeClusters(label).map((ch, i) => (
              <span key={`${i}-${ch}`} className="experience__title-char">
                <span className="experience__title-char-inner">
                  {ch === " " ? "\u00a0" : ch}
                </span>
              </span>
            ))}
          </span>
        </span>
      </button>
    </div>
  );
}

export const ExperienceTitle = memo(ExperienceTitleComponent);
