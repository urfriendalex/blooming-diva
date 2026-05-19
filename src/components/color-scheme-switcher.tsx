"use client";

import { useEffect, useSyncExternalStore } from "react";

import {
  applyColorScheme,
  COLOR_SCHEME,
  COLOR_SCHEME_META,
  COLOR_SCHEME_OPTIONS,
  persistColorScheme,
  readStoredColorScheme,
  type ColorScheme,
} from "@/lib/theme";

const SCHEME_CHANGE_EVENT = "blooming-diva-color-scheme-change";

function subscribe(onStoreChange: () => void) {
  window.addEventListener(SCHEME_CHANGE_EVENT, onStoreChange);
  return () => window.removeEventListener(SCHEME_CHANGE_EVENT, onStoreChange);
}

function getSnapshot(): ColorScheme {
  return readStoredColorScheme() ?? COLOR_SCHEME;
}

function getServerSnapshot(): ColorScheme {
  return COLOR_SCHEME;
}

function notifySchemeChange() {
  window.dispatchEvent(new Event(SCHEME_CHANGE_EVENT));
}

export function ColorSchemeSwitcher() {
  const activeScheme = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    applyColorScheme(activeScheme);
  }, [activeScheme]);

  const handleSelect = (scheme: ColorScheme) => {
    persistColorScheme(scheme);
    applyColorScheme(scheme);
    notifySchemeChange();
  };

  return (
    <div
      className="color-scheme-switcher"
      role="region"
      aria-label="Color scheme preview"
    >
      <button
        type="button"
        className="color-scheme-switcher__toggle interactive"
        aria-label="Show palette options"
        aria-controls="color-scheme-switcher-body"
      >
        <svg
          className="color-scheme-switcher__toggle-icon"
          viewBox="0 0 21 20"
          width="21"
          height="20"
          aria-hidden="true"
        >
          <circle
            cx="7.25"
            cy="10"
            r="4.25"
            fill={COLOR_SCHEME_META[activeScheme].accent}
            stroke="currentColor"
            strokeWidth="1"
          />
          <circle
            cx="13.25"
            cy="6.75"
            r="4.25"
            fill={COLOR_SCHEME_META[activeScheme].bg}
            stroke="currentColor"
            strokeWidth="1"
          />
          <circle
            cx="13.25"
            cy="13.25"
            r="4.25"
            fill="currentColor"
            fillOpacity="0.14"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
      </button>

      <div id="color-scheme-switcher-body" className="color-scheme-switcher__body">
        <p className="color-scheme-switcher__label">Palette</p>
        <ul className="color-scheme-switcher__list">
          {COLOR_SCHEME_OPTIONS.map((scheme) => {
            const meta = COLOR_SCHEME_META[scheme];
            const isActive = scheme === activeScheme;

            return (
              <li key={scheme}>
                <button
                  type="button"
                  className="color-scheme-switcher__option"
                  data-active={isActive ? "true" : "false"}
                  aria-pressed={isActive}
                  onClick={() => handleSelect(scheme)}
                >
                  <span
                    className="color-scheme-switcher__swatch"
                    aria-hidden="true"
                    style={{
                      background: `linear-gradient(135deg, ${meta.accent} 0 50%, ${meta.bg} 50% 100%)`,
                    }}
                  />
                  <span className="color-scheme-switcher__name">{meta.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
