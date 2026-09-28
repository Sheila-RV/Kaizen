export const THEMES = [
  { id: "blanco", label: "Blanco", swatch: "#fff8ec" },
  { id: "negro", label: "Negro", swatch: "#0d0b09" },
  { id: "cafe", label: "Café", swatch: "#2b1d14" },
] as const;

export type Theme = (typeof THEMES)[number]["id"];

export const THEME_COOKIE = "kaizen-theme";
export const DEFAULT_THEME: Theme = "blanco";

export function parseTheme(value: string | undefined): Theme {
  return THEMES.some((t) => t.id === value) ? (value as Theme) : DEFAULT_THEME;
}
