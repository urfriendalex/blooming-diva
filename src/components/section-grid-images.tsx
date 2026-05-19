"use client";

import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import type { CSSProperties } from "react";
import type { MouseEvent } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

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

function isElementInViewport(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  const vh = typeof window !== "undefined" ? window.innerHeight : 0;
  if (vh <= 0) {
    return false;
  }
  return rect.top < vh && rect.bottom > 0;
}

type SectionGridImagesProps = {
  images: string[];
  /**
   * Global line index for the first grid cell — same top-to-bottom scale as `revealAfterLines()`.
   */
  firstLineIndex: number;
};

export function SectionGridImages({ images, firstLineIndex }: SectionGridImagesProps) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const switchRef = useRef<HTMLDivElement | null>(null);
  const switchTransitionRect = useRef<DOMRect | null>(null);
  const pinnedRef = useRef(false);
  const pendingFlipState = useRef<Flip.FlipState | null>(null);
  const [columns, setColumns] = useState<GridColumnCount>(3);
  const [isMobile, setIsMobile] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  /** Keeps grid row height when the switch becomes `position: fixed` on scroll. */
  const [pinnedSlotSize, setPinnedSlotSize] = useState<{ width: number; height: number } | null>(
    null,
  );
  const imageListKey = images.join("\0");
  const columnOptions: GridColumnCount[] = isMobile ? [1, 2] : [2, 3, 4];

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
      gsap.killTweensOf(switchEl);
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
    const switchEl = switchRef.current;
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
        if (switchEl) {
          gsap.set(switchEl, {
            opacity: 1,
            clearProps: "transform,filter",
          });
        }
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

      if (switchEl) {
        gsap.set(switchEl, {
          opacity: GRID_IMAGE_INITIAL_OPACITY,
          yPercent: 5,
          scale: 0.98,
          transformOrigin: "50% 50%",
          filter: `blur(${Math.max(4, GRID_IMAGE_INITIAL_BLUR_PX - 2)}px)`,
          force3D: true,
        });
      }

      let played = false;
      const play = () => {
        if (played) {
          return;
        }
        played = true;
        const delay = revealAfterLines(firstLineIndex);
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
        if (switchEl) {
          gsap.to(switchEl, {
            opacity: 1,
            yPercent: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: DURATION_TRANSFORM_S,
            delay,
            ease: EASE_TRANSFORM,
            force3D: true,
          });
        }
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
            <img src={image} alt="" />
          </figure>
        ))}
      </div>
    </div>
  );
}
