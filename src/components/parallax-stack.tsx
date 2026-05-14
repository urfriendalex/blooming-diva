"use client";

import Image from "next/image";
import { type CSSProperties, useEffect, useRef } from "react";

type StackImage = {
  src: string;
  alt: string;
  caption?: string;
};

type ParallaxStackProps = {
  items: StackImage[];
};

export function ParallaxStack({ items }: ParallaxStackProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) {
      return;
    }

    let rafId = 0;

    const handleMove = (event: PointerEvent) => {
      const bounds = node.getBoundingClientRect();
      const offsetX = (event.clientX - bounds.left) / bounds.width - 0.5;
      const offsetY = (event.clientY - bounds.top) / bounds.height - 0.5;

      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        node.style.setProperty("--pointer-x", offsetX.toFixed(3));
        node.style.setProperty("--pointer-y", offsetY.toFixed(3));
      });
    };

    const reset = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        node.style.setProperty("--pointer-x", "0");
        node.style.setProperty("--pointer-y", "0");
      });
    };

    node.addEventListener("pointermove", handleMove);
    node.addEventListener("pointerleave", reset);

    return () => {
      cancelAnimationFrame(rafId);
      node.removeEventListener("pointermove", handleMove);
      node.removeEventListener("pointerleave", reset);
    };
  }, []);

  return (
    <div className="hero-stack" ref={ref}>
      {items.map((item, index) => (
        <figure
          className="hero-card"
          key={item.src}
          style={
            {
              "--card-index": index,
            } as CSSProperties
          }
        >
          <Image
            src={item.src}
            alt={item.alt}
            fill
            sizes="(max-width: 768px) 70vw, 30vw"
            className="hero-card__image"
            priority={index === 0}
          />
          {item.caption ? <figcaption>{item.caption}</figcaption> : null}
        </figure>
      ))}
    </div>
  );
}
