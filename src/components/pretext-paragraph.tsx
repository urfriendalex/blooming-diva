"use client";

import { useRef } from "react";

import { useVisualLines } from "@/hooks/use-visual-lines";

type PretextParagraphProps = {
  text: string;
};

export function PretextParagraph({ text }: PretextParagraphProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const lines = useVisualLines(text, ref);

  return (
    <p ref={ref}>
      {lines === null
        ? text
        : lines.map((line, index) => (
            <span className="pretext-flow__line" key={index}>
              {line}
            </span>
          ))}
    </p>
  );
}
