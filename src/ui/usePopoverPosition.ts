import {
  useEffect,
  useLayoutEffect,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";

const GAP = 10;
const MARGIN = 12;
const CARD_WIDTH = 384;
const CARD_MAX_HEIGHT = 580;
const MIN_HEIGHT_BELOW = 320;

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Tetikleyici butona göre açılan kartı viewport içinde konumlandırır. */
export function usePopoverPosition(
  anchor: RefObject<HTMLElement | null>,
  open: boolean,
): CSSProperties | null {
  const [style, setStyle] = useState<CSSProperties | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (!open) {
      setStyle(null);
      return;
    }

    const update = () => {
      const el = anchor.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const width = Math.min(CARD_WIDTH, vw - MARGIN * 2);
      const spaceBelow = vh - rect.bottom - GAP - MARGIN;
      const spaceAbove = rect.top - GAP - MARGIN;
      const below = spaceBelow >= MIN_HEIGHT_BELOW || spaceBelow >= spaceAbove;
      const alignLeft = rect.left + rect.width / 2 < vw / 2;
      const left = Math.min(
        Math.max(alignLeft ? rect.left : rect.right - width, MARGIN),
        vw - width - MARGIN,
      );

      const maxHeight = Math.min(
        CARD_MAX_HEIGHT,
        Math.max(below ? spaceBelow : spaceAbove, 240),
      );

      setStyle({
        width,
        left,
        height: maxHeight,
        maxHeight,
        ...(below ? { top: rect.bottom + GAP } : { bottom: vh - rect.top + GAP }),
        transformOrigin: `${below ? "top" : "bottom"} ${alignLeft ? "left" : "right"}`,
      });
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, anchor]);

  return style;
}
