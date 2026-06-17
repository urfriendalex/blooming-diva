"use client";

import { TextReveal } from "@/components/text-reveal";
import { revealAfterLines } from "@/lib/reveal-hierarchy";
import { siteContent } from "@/lib/site-content";

type BookingFormProps = {
  /** Global line index for the first closed-registration message line. */
  revealBaseLines?: number;
};

export function BookingForm({ revealBaseLines = 0 }: BookingFormProps) {
  const base = revealBaseLines;

  return (
    <div className="booking-closed" aria-live="polite">
      <TextReveal
        as="h3"
        text={siteContent.signup.closedTitle}
        blockDelay={revealAfterLines(base)}
      />
      <TextReveal
        as="p"
        text={siteContent.signup.closedText}
        blockDelay={revealAfterLines(base + 1)}
      />
      <a
        id="next-photo-day-link"
        className="booking-closed__link interactive interactive--accent"
        href={siteContent.signup.nextPhotoDayUrl}
        target="_blank"
        rel="noreferrer"
      >
        <TextReveal
          as="span"
          text={siteContent.signup.nextPhotoDayLabel}
          blockDelay={revealAfterLines(base + 2)}
        />
      </a>
    </div>
  );
}
