"use client";

import {
  type AnimationEvent,
  type ChangeEvent,
  type CSSProperties,
  type FocusEvent,
  useCallback,
  useState,
} from "react";

import { TextReveal } from "@/components/text-reveal";
import { bookingSchema } from "@/lib/booking";
import { revealAfterLines } from "@/lib/reveal-hierarchy";
import { siteContent } from "@/lib/site-content";

/** Ensures non-empty Instagram input always has a single leading @. */
function normalizeInstagramHandleInput(value: string): string {
  if (value === "") return "";
  const body = value.replace(/^@+/, "");
  return body === "" ? "@" : `@${body}`;
}

type FormState =
  | { status: "idle"; message?: string }
  | { status: "submitting"; message?: string }
  | { status: "error"; message: string }
  | { status: "success"; message: string };

const initialState: FormState = { status: "idle" };

type BookingFormProps = {
  /** Global line index for the first form row (name field); rows + button + meta follow +1 each. */
  revealBaseLines?: number;
};

export function BookingForm({ revealBaseLines = 0 }: BookingFormProps) {
  const [state, setState] = useState<FormState>(initialState);
  const [instagram, setInstagram] = useState("");

  const handleInstagramChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setInstagram(normalizeInstagramHandleInput(event.target.value));
  }, []);

  async function handleSubmit(formData: FormData) {
    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      instagram: String(formData.get("instagram") || ""),
    };

    const parsed = bookingSchema.safeParse(payload);
    if (!parsed.success) {
      setState({
        status: "error",
        message: parsed.error.issues[0]?.message ?? "Проверьте данные формы.",
      });
      return;
    }

    setState({ status: "submitting" });

    const response = await fetch("/api/book", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsed.data),
    });

    const result = (await response.json()) as { error?: string; message?: string };

    if (!response.ok) {
      setState({
        status: "error",
        message: result.error || "Submission failed. Please try again.",
      });
      return;
    }

    setState({
      status: "success",
      message: result.message || "We will get back to you shortly.",
    });
  }

  const base = revealBaseLines;
  const fieldDelay = (lineOffset: number) =>
    ({
      "--field-delay": `${revealAfterLines(base + lineOffset)}s`,
    }) as CSSProperties;

  const markSignupFieldLineRevealed = useCallback((el: HTMLDivElement) => {
    el.dataset.signupLineRevealed = "true";
  }, []);

  const handleSignupFieldLineAnimationEnd = useCallback(
    (event: AnimationEvent<HTMLDivElement>) => {
      if (!event.animationName.includes("signup-form-line-reveal")) {
        return;
      }
      markSignupFieldLineRevealed(event.currentTarget);
    },
    [markSignupFieldLineRevealed],
  );

  const handleSignupFieldFocus = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      markSignupFieldLineRevealed(event.currentTarget);
    },
    [markSignupFieldLineRevealed],
  );

  if (state.status === "success") {
    return (
      <div className="booking-success" aria-live="polite">
        <TextReveal
          as="h3"
          text="Спасибо"
          blockDelay={revealAfterLines(base)}
        />
        <TextReveal
          as="p"
          text={state.message ?? ""}
          blockDelay={revealAfterLines(base + 1)}
        />
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="signup-form">
      <div
        className="signup-form__field"
        style={fieldDelay(0)}
        onAnimationEnd={handleSignupFieldLineAnimationEnd}
        onFocus={handleSignupFieldFocus}
      >
        <label className="signup-form__sr-only" htmlFor="name">
          {siteContent.signup.fields.nameLabel}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder={siteContent.signup.fields.namePlaceholder}
          autoComplete="name"
          required
        />
      </div>

      <div
        className="signup-form__field"
        style={fieldDelay(1)}
        onAnimationEnd={handleSignupFieldLineAnimationEnd}
        onFocus={handleSignupFieldFocus}
      >
        <label className="signup-form__sr-only" htmlFor="email">
          {siteContent.signup.fields.emailLabel}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder={siteContent.signup.fields.emailPlaceholder}
          autoComplete="email"
          required
        />
      </div>

      <div
        className="signup-form__field signup-form__field--instagram"
        style={fieldDelay(2)}
        onAnimationEnd={handleSignupFieldLineAnimationEnd}
        onFocus={handleSignupFieldFocus}
      >
        <label className="signup-form__sr-only" htmlFor="instagram">
          {siteContent.signup.fields.instagramLabel}
        </label>
        <input
          id="instagram"
          name="instagram"
          type="text"
          value={instagram}
          onChange={handleInstagramChange}
          placeholder={siteContent.signup.fields.instagramPlaceholder}
          autoComplete="username"
          required
        />
      </div>

      <div className="signup-form__actions">
        <button className="signup-form__button interactive" type="submit">
          {state.status === "submitting" ? (
            "ОТПРАВЛЯЕМ..."
          ) : (
            <TextReveal
              as="span"
              text={siteContent.signup.button}
              blockDelay={revealAfterLines(base + 3)}
            />
          )}
        </button>
        {siteContent.signup.spotsLeftText.trim() ? (
          <TextReveal
            as="span"
            className="signup-form__spots-left"
            text={siteContent.signup.spotsLeftText}
            blockDelay={revealAfterLines(base + 3)}
          />
        ) : null}
      </div>
      <p className="signup-form__meta" aria-live="polite">
        {state.status === "error" ? (
          <TextReveal
            key={state.message}
            text={state.message}
            as="span"
            blockDelay={revealAfterLines(base + 4)}
          />
        ) : (
          <TextReveal
            text={siteContent.signup.helperText}
            as="span"
            blockDelay={revealAfterLines(base + 4)}
          />
        )}
      </p>
    </form>
  );
}
