import { useEffect, useLayoutEffect, useState } from "react";

export type Theme = "light" | "dark";

const THEME_ATTRIBUTES = [
  "data-theme",
  "data-mode",
  "data-color-mode",
  "data-color-scheme",
  "data-bs-theme",
  "data-mantine-color-scheme",
  "data-mui-color-scheme",
];

const TRANSITION_RECHECK_MS = 400;

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function themeFromMarkup(el: Element | null): Theme | null {
  if (!el) return null;
  if (el.classList.contains("dark")) return "dark";
  if (el.classList.contains("light")) return "light";
  for (const attr of THEME_ATTRIBUTES) {
    const value = el.getAttribute(attr)?.toLowerCase();
    if (value?.includes("dark")) return "dark";
    if (value?.includes("light")) return "light";
  }
  return null;
}

function parseColor(
  color: string,
): { r: number; g: number; b: number; a: number } | null {
  const rgb = color.match(
    /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?\s*\)$/,
  );
  if (rgb) {
    const alpha =
      rgb[4] === undefined
        ? 1
        : rgb[4].endsWith("%")
          ? parseFloat(rgb[4]) / 100
          : parseFloat(rgb[4]);
    return { r: Number(rgb[1]), g: Number(rgb[2]), b: Number(rgb[3]), a: alpha };
  }

  // oklch(), lab(), color() gibi biçimleri tarayıcıya sRGB'ye çevirtir.
  const ctx = document
    .createElement("canvas")
    .getContext?.("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0, a = 0] = ctx.getImageData(0, 0, 1, 1).data;
  return { r, g, b, a: a / 255 };
}

function themeFromBackground(el: Element | null): Theme | null {
  if (!el) return null;
  const color = parseColor(getComputedStyle(el).backgroundColor);
  if (!color || color.a < 0.5) return null;
  const luminance = (0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b) / 255;
  return luminance < 0.5 ? "dark" : "light";
}

function prefersDark(): boolean {
  return !!window.matchMedia?.("(prefers-color-scheme: dark)").matches;
}

function themeFromColorScheme(el: Element): Theme | null {
  const scheme = getComputedStyle(el).colorScheme ?? "";
  const dark = scheme.includes("dark");
  const light = scheme.includes("light");
  if (dark && light) return prefersDark() ? "dark" : "light";
  if (dark) return "dark";
  if (light) return "light";
  return null;
}

/** Sitenin temasını (html/body class, data-*, arka plan, color-scheme) okur. */
export function detectHostTheme(): Theme {
  const html = document.documentElement;
  const body = document.body;
  return (
    themeFromMarkup(html) ??
    themeFromMarkup(body) ??
    themeFromBackground(body) ??
    themeFromBackground(html) ??
    themeFromColorScheme(html) ??
    "light"
  );
}

/** Sitenin temasını okur ve class, data-* ve stil değişikliklerini canlı izler. */
export function useHostTheme(): Theme {
  const [theme, setTheme] = useState<Theme>("light");

  useIsomorphicLayoutEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const update = () => setTheme(detectHostTheme());
    const onChange = () => {
      update();
      clearTimeout(timer);
      timer = setTimeout(update, TRANSITION_RECHECK_MS);
    };

    update();

    const observer = new MutationObserver(onChange);
    observer.observe(document.documentElement, { attributes: true });
    if (document.body) observer.observe(document.body, { attributes: true });

    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    media?.addEventListener?.("change", onChange);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      media?.removeEventListener?.("change", onChange);
    };
  }, []);

  return theme;
}
