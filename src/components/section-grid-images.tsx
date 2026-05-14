"use client";

import { gsap } from "gsap";
import { useLayoutEffect, useRef } from "react";

import { revealAfterLines } from "@/lib/reveal-hierarchy";
import {
  EASE_TRANSFORM,
  GRID_IMAGE_INITIAL_BLUR_PX,
  GRID_IMAGE_INITIAL_OPACITY,
  GRID_IMAGE_INITIAL_SCALE,
  GRID_IMAGE_INITIAL_Y_PERCENT,
  GRID_IMAGE_REVEAL_DURATION_S,
} from "@/lib/reveal-motion";

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
  const imageListKey = images.join("\0");

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
        gsap.to(imgs, {
          opacity: 1,
          yPercent: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: GRID_IMAGE_REVEAL_DURATION_S,
          delay: revealAfterLines(firstLineIndex),
          ease: EASE_TRANSFORM,
          force3D: true,
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
    };
  }, [imageListKey, images.length, firstLineIndex]);

  return (
    <div ref={gridRef} className="topic-detail__grid">
      {images.map((image, index) => (
        <figure key={`${image}-${index}`} className="topic-detail__card">
          <img src={image} alt="" />
        </figure>
      ))}
    </div>
  );
}
