"use client";

import { useState } from "react";
import { THEMES, THEME_COOKIE, type Theme } from "@/lib/theme";

function applyTheme(next: Theme) {
  document.documentElement.dataset.theme = next;
  document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
}

/** Tres pastillas de color para cambiar el fondo: blanco, negro o café. */
export function ThemeSwitcher({ initial, className = "" }: { initial: Theme; className?: string }) {
  const [theme, setTheme] = useState<Theme>(initial);

  function choose(next: Theme) {
    setTheme(next);
    applyTheme(next);
  }

  return (
    <div
      role="radiogroup"
      aria-label="Tema de color"
      className={`inline-flex items-center gap-1 rounded-full border-2 border-ink bg-surface p-1 shadow-sticker-sm ${className}`}
    >
      {THEMES.map((t) => {
        const active = t.id === theme;
        return (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={t.label}
            title={t.label}
            onClick={() => choose(t.id)}
            className={`size-6 cursor-pointer rounded-full border-2 transition-transform hover:scale-110 ${
              active ? "border-accent ring-2 ring-accent ring-offset-1 ring-offset-surface" : "border-border"
            }`}
            style={{ backgroundColor: t.swatch }}
          />
        );
      })}
    </div>
  );
}
