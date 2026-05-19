/**
 * Active palette — change this value to preview a scheme locally, then tell us which to lock in.
 *
 * Options:
 * - bloom-flash    — vibrant rose on warm ecru (bold, confident)
 * - satin-blush    — dusty satin rose on lace cream (closest to reference photos)
 * - garden-lilac   — peony lilac-pink on parchment ecru (ethereal, floral)
 * - polaroid-warm  — coral-rose on golden cream (analog film warmth)
 * - petal-veil     — soft peony pink on milky lace (ethereal, floral close-up)
 * - velvet-dusk    — deep rose velvet on stone ecru (moody garden dusk)
 * - sage-bloom     — muted rose on sage ecru (natural, botanical)
 */
export const COLOR_SCHEME = "bloom-flash" as const;

export type ColorScheme =
  | "bloom-flash"
  | "satin-blush"
  | "garden-lilac"
  | "polaroid-warm"
  | "petal-veil"
  | "velvet-dusk"
  | "sage-bloom";

export const COLOR_SCHEME_OPTIONS: readonly ColorScheme[] = [
  "bloom-flash",
  "satin-blush",
  "garden-lilac",
  "polaroid-warm",
  "petal-veil",
  "velvet-dusk",
  "sage-bloom",
] as const;

export const COLOR_SCHEME_STORAGE_KEY = "blooming-diva-color-scheme";

export type ColorSchemeMeta = {
  label: string;
  accent: string;
  bg: string;
};

export const COLOR_SCHEME_META: Record<ColorScheme, ColorSchemeMeta> = {
  "bloom-flash": {
    label: "Bloom Flash",
    accent: "#e03e72",
    bg: "#ede8dc",
  },
  "satin-blush": {
    label: "Satin Blush",
    accent: "#b87888",
    bg: "#eee6da",
  },
  "garden-lilac": {
    label: "Garden Lilac",
    accent: "#c9699e",
    bg: "#e9e5dd",
  },
  "polaroid-warm": {
    label: "Polaroid Warm",
    accent: "#cc4d5e",
    bg: "#efe6d6",
  },
  "petal-veil": {
    label: "Petal Veil",
    accent: "#d98ba8",
    bg: "#f3ede6",
  },
  "velvet-dusk": {
    label: "Velvet Dusk",
    accent: "#9e4a62",
    bg: "#e4ddd4",
  },
  "sage-bloom": {
    label: "Sage Bloom",
    accent: "#a86b7a",
    bg: "#e8ebe4",
  },
};

export function isColorScheme(value: string): value is ColorScheme {
  return (COLOR_SCHEME_OPTIONS as readonly string[]).includes(value);
}

export function applyColorScheme(scheme: ColorScheme) {
  document.documentElement.dataset.colorScheme = scheme;
}

export function readStoredColorScheme(): ColorScheme | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(COLOR_SCHEME_STORAGE_KEY);
  return stored && isColorScheme(stored) ? stored : null;
}

export function persistColorScheme(scheme: ColorScheme) {
  window.localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, scheme);
}
