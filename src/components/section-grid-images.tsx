"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import type { CSSProperties } from "react";
import type { MouseEvent } from "react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { revealAfterLines } from "@/lib/reveal-hierarchy";
import {
  DURATION_TRANSFORM_S,
  EASE_TRANSFORM,
  GRID_IMAGE_INITIAL_BLUR_PX,
  GRID_IMAGE_INITIAL_OPACITY,
  GRID_IMAGE_INITIAL_SCALE,
  GRID_IMAGE_INITIAL_Y_PERCENT,
  GRID_IMAGE_REVEAL_DURATION_S,
} from "@/lib/reveal-motion";

gsap.registerPlugin(Flip);

type GridColumnCount = 1 | 2 | 3 | 4;

type SectionGridImagesProps = {
  images: string[];
  /**
   * Global line index for the first grid cell — same top-to-bottom scale as `revealAfterLines()`.
   */
  firstLineIndex: number;
};

export function SectionGridImages({ images, firstLineIndex }: SectionGridImagesProps) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const lightboxRef = useRef<HTMLDivElement | null>(null);
  const lightboxImageRef = useRef<HTMLImageElement | null>(null);
  const isClosingLightboxRef = useRef(false);
  const switchRef = useRef<HTMLDivElement | null>(null);
  const switchTransitionRect = useRef<DOMRect | null>(null);
  const pinnedRef = useRef(false);
  /** After section change, parent scrolls to top — ignore stale scrollY for pin until then. */
  const suppressPinRef = useRef(false);
  const pendingFlipState = useRef<Flip.FlipState | null>(null);
  const [columns, setColumns] = useState<GridColumnCount>(3);
  const [isMobile, setIsMobile] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  /** Keeps grid row height when the switch becomes `position: fixed` on scroll. */
  const [pinnedSlotSize, setPinnedSlotSize] = useState<{ width: number; height: number } | null>(
    null,
  );
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const imageListKey = images.join("\0");
  const columnOptions: GridColumnCount[] = isMobile ? [1, 2] : [2, 3, 4];

  const closeImage = useCallback(() => {
    const lightbox = lightboxRef.current;
    const image = lightboxImageRef.current;

    if (!lightbox || isClosingLightboxRef.current) {
      setActiveImageIndex(null);
      return;
    }

    isClosingLightboxRef.current = true;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      setActiveImageIndex(null);
      return;
    }

    gsap.killTweensOf([lightbox, image]);
    gsap.to(image, {
      opacity: 0,
      scale: 0.96,
      duration: 0.24,
      ease: "power2.in",
    });
    gsap.to(lightbox, {
      opacity: 0,
      duration: 0.28,
      ease: "power2.in",
      onComplete: () => setActiveImageIndex(null),
    });
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 720px)");

    const syncColumnsToViewport = () => {
      const mobile = media.matches;
      setIsMobile(mobile);
      setColumns(mobile ? 1 : 3);
      if (mobile && pinnedRef.current) {
        switchTransitionRect.current = switchRef.current?.getBoundingClientRect() ?? null;
        pinnedRef.current = false;
        setIsPinned(false);
        setPinnedSlotSize(null);
      }
    };

    syncColumnsToViewport();
    media.addEventListener("change", syncColumnsToViewport);

    return () => {
      media.removeEventListener("change", syncColumnsToViewport);
    };
  }, []);

  useEffect(() => {
    if (isMobile) {
      return;
    }

    const syncPinnedState = () => {
      if (suppressPinRef.current) {
        return;
      }

      const nextPinned = window.scrollY > 16;
      if (nextPinned === pinnedRef.current) {
        return;
      }

      const switchEl = switchRef.current;
      switchTransitionRect.current = switchEl?.getBoundingClientRect() ?? null;
      if (nextPinned && switchEl) {
        const { width, height } = switchEl.getBoundingClientRect();
        setPinnedSlotSize({ width, height });
      } else {
        setPinnedSlotSize(null);
      }
      pinnedRef.current = nextPinned;
      setIsPinned(nextPinned);
    };

    syncPinnedState();
    window.addEventListener("scroll", syncPinnedState, { passive: true });

    return () => {
      window.removeEventListener("scroll", syncPinnedState);
    };
  }, [isMobile]);

  /** Section change: unpin until scroll-to-top finishes (parent `activeMode` effect). */
  useLayoutEffect(() => {
    suppressPinRef.current = true;
    pinnedRef.current = false;
    setIsPinned(false);
    setPinnedSlotSize(null);
    setActiveImageIndex(null);
  }, [imageListKey]);

  useEffect(() => {
    if (activeImageIndex === null) {
      return;
    }

    const root = document.documentElement;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    root.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeImage();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      root.style.overflow = previousRootOverflow;
      document.body.style.overflow = previousBodyOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeImageIndex, closeImage]);

  useLayoutEffect(() => {
    if (activeImageIndex === null) {
      isClosingLightboxRef.current = false;
      return;
    }

    const lightbox = lightboxRef.current;
    const image = lightboxImageRef.current;
    if (!lightbox || !image) {
      return;
    }

    isClosingLightboxRef.current = false;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      return;
    }

    gsap.fromTo(lightbox, { opacity: 0 }, { opacity: 1, duration: 0.32, ease: "power2.out" });
    gsap.fromTo(
      image,
      { opacity: 0, scale: 0.96 },
      { opacity: 1, scale: 1, duration: 0.42, ease: "power3.out" },
    );

    return () => {
      gsap.killTweensOf([lightbox, image]);
    };
  }, [activeImageIndex]);

  useLayoutEffect(() => {
    if (activeImageIndex === null) {
      return;
    }

    const lightbox = lightboxRef.current;
    if (!lightbox) {
      return;
    }

    const syncLightboxInsets = () => {
      const header = document.querySelector(".experience__header");
      const cta = document.querySelector(".experience__register-cta");
      const topInset = header?.getBoundingClientRect().bottom ?? 0;
      const bottomInset = cta
        ? Math.max(0, window.innerHeight - cta.getBoundingClientRect().top)
        : 0;

      lightbox.style.setProperty("--lightbox-pad-top", `${topInset}px`);
      lightbox.style.setProperty("--lightbox-pad-bottom", `${bottomInset}px`);
    };

    syncLightboxInsets();
    window.addEventListener("resize", syncLightboxInsets);

    return () => {
      window.removeEventListener("resize", syncLightboxInsets);
      lightbox.style.removeProperty("--lightbox-pad-top");
      lightbox.style.removeProperty("--lightbox-pad-bottom");
    };
  }, [activeImageIndex]);

  useEffect(() => {
    if (isMobile) {
      return;
    }

    const releasePin = () => {
      suppressPinRef.current = false;
      const nextPinned = window.scrollY > 16;
      pinnedRef.current = nextPinned;
      setIsPinned(nextPinned);

      const switchEl = switchRef.current;
      if (nextPinned && switchEl) {
        const { width, height } = switchEl.getBoundingClientRect();
        setPinnedSlotSize({ width, height });
      } else {
        setPinnedSlotSize(null);
      }
    };

    const timeoutId = window.setTimeout(releasePin, 900);
    return () => window.clearTimeout(timeoutId);
  }, [imageListKey, isMobile]);

  useLayoutEffect(() => {
    const switchEl = switchRef.current;
    const previousRect = switchTransitionRect.current;
    if (!switchEl || !previousRect) {
      return;
    }

    switchTransitionRect.current = null;
    const nextRect = switchEl.getBoundingClientRect();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      gsap.set(switchEl, { clearProps: "transform" });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.killTweensOf(switchEl, "x,y,scale");
      gsap.fromTo(
        switchEl,
        {
          x: previousRect.left - nextRect.left,
          y: previousRect.top - nextRect.top,
          scale: 0.98,
        },
        {
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.62,
          ease: "power3.out",
          overwrite: "auto",
          force3D: true,
          clearProps: "transform",
        },
      );
    }, switchEl);

    return () => {
      ctx.revert();
    };
  }, [isPinned]);

  useLayoutEffect(() => {
    const state = pendingFlipState.current;
    const root = gridRef.current;
    if (!state || !root) {
      return;
    }

    pendingFlipState.current = null;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      return;
    }

    Flip.from(state, {
      targets: root.querySelectorAll(".topic-detail__card"),
      duration: 0.55,
      ease: "power3.inOut",
      scale: true,
      nested: true,
    });
  }, [columns]);

  useLayoutEffect(() => {
    const root = gridRef.current;
    if (!root || images.length === 0) {
      return;
    }

    const imgs = root.querySelectorAll<HTMLElement>(".topic-detail__card img");
    if (imgs.length === 0) {
      return;
    }

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduceMotion) {
        gsap.set(imgs, {
          opacity: 1,
          clearProps: "transform,filter",
        });
        return;
      }

      const blurIn = `blur(${GRID_IMAGE_INITIAL_BLUR_PX}px)`;
      gsap.set(imgs, {
        opacity: GRID_IMAGE_INITIAL_OPACITY,
        yPercent: GRID_IMAGE_INITIAL_Y_PERCENT,
        scale: GRID_IMAGE_INITIAL_SCALE,
        transformOrigin: "50% 88%",
        filter: blurIn,
        force3D: true,
      });

      let played = false;
      const play = () => {
        if (played) {
          return;
        }
        played = true;
        const delay = revealAfterLines(firstLineIndex);
        gsap.killTweensOf(imgs);
        gsap.to(imgs, {
          opacity: 1,
          yPercent: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: GRID_IMAGE_REVEAL_DURATION_S,
          delay,
          ease: EASE_TRANSFORM,
          force3D: true,
        });
      };

      requestAnimationFrame(() => {
        requestAnimationFrame(() => play());
      });
    }, root);

    return () => {
      ctx.revert();
    };
  }, [imageListKey, images.length, firstLineIndex]);

  /* Switch reveal is separate — pin transition used to killTweensOf(all) and zero opacity. */
  useLayoutEffect(() => {
    const switchEl = switchRef.current;
    if (!switchEl || images.length === 0) {
      return;
    }

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      gsap.set(switchEl, {
        opacity: 1,
        clearProps: "transform,filter",
      });
      return;
    }

    gsap.killTweensOf(switchEl, "opacity,filter,yPercent,scale");
    gsap.set(switchEl, {
      opacity: GRID_IMAGE_INITIAL_OPACITY,
      yPercent: 5,
      scale: 0.98,
      transformOrigin: "50% 50%",
      filter: `blur(${Math.max(4, GRID_IMAGE_INITIAL_BLUR_PX - 2)}px)`,
      force3D: true,
    });

    const delay = revealAfterLines(firstLineIndex);
    const tween = gsap.to(switchEl, {
      opacity: 1,
      yPercent: 0,
      scale: 1,
      filter: "blur(0px)",
      duration: DURATION_TRANSFORM_S,
      delay,
      ease: EASE_TRANSFORM,
      force3D: true,
    });

    return () => {
      tween.kill();
    };
  }, [imageListKey, images.length, firstLineIndex]);

  const changeColumns = (nextColumns: GridColumnCount) => {
    if (nextColumns === columns || !gridRef.current) {
      setColumns(nextColumns);
      return;
    }

    pendingFlipState.current = Flip.getState(
      gridRef.current.querySelectorAll(".topic-detail__card"),
    );
    setColumns(nextColumns);
  };

  const toggleMobileColumns = () => {
    changeColumns(columns === 1 ? 2 : 1);
  };

  const handleColumnButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    const nextColumns = Number(event.currentTarget.dataset.columns) as GridColumnCount;
    changeColumns(nextColumns);
  };

  const openImage = (index: number) => {
    setActiveImageIndex(index);
  };

  const handleLightboxBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      closeImage();
    }
  };

  const pinnedSlotStyle: CSSProperties | undefined =
    isPinned && !isMobile && pinnedSlotSize
      ? {
          width: pinnedSlotSize.width,
          height: pinnedSlotSize.height,
        }
      : undefined;

  return (
    <div className="topic-detail__grid-block">
      <div className="topic-detail__grid-switch-slot" style={pinnedSlotStyle}>
        <div
          ref={switchRef}
          className={`topic-detail__grid-switch${isPinned && !isMobile ? " topic-detail__grid-switch--pinned" : ""}`}
          aria-label="Количество фото в ряду"
        >
        {isMobile ? (
          <button
            type="button"
            className="topic-detail__grid-switch-button topic-detail__grid-switch-toggle"
            data-active="true"
            data-columns={columns}
            onClick={toggleMobileColumns}
            aria-label={`Сейчас ${columns} фото в ряду. Переключить на ${columns === 1 ? 2 : 1}`}
          >
            {columns}
          </button>
        ) : (
          columnOptions.map((columnOption) => (
            <button
              key={columnOption}
              type="button"
              className="topic-detail__grid-switch-button"
              data-active={columns === columnOption}
              data-columns={columnOption}
              onClick={handleColumnButtonClick}
              aria-pressed={columns === columnOption}
            >
              {columnOption}
            </button>
          ))
        )}
        </div>
      </div>

      <div
        ref={gridRef}
        className="topic-detail__grid"
        style={{ "--topic-grid-columns": columns } as CSSProperties}
      >
        {images.map((image, index) => (
          <figure key={`${image}-${index}`} className="topic-detail__card">
            <button
              type="button"
              className="topic-detail__card-button"
              onClick={() => openImage(index)}
              aria-label="Увеличить фото"
            >
              <img src={image} alt="" loading="lazy" decoding="async" />
            </button>
          </figure>
        ))}
      </div>

      {activeImageIndex !== null && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={lightboxRef}
              className="topic-detail__lightbox"
              role="dialog"
              aria-modal="true"
              aria-label="Увеличенное фото"
              onClick={handleLightboxBackdropClick}
            >
              <button
                type="button"
                className="topic-detail__lightbox-close interactive interactive--inverse"
                onClick={closeImage}
                aria-label="Закрыть"
              >
                <svg
                  className="topic-detail__lightbox-close-icon"
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  aria-hidden="true"
                >
                  <path
                    d="M1.25 1.25 12.75 12.75M12.75 1.25 1.25 12.75"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <div className="topic-detail__lightbox-stage">
                <img
                  ref={lightboxImageRef}
                  className="topic-detail__lightbox-image"
                  src={images[activeImageIndex]}
                  alt=""
                  decoding="async"
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
