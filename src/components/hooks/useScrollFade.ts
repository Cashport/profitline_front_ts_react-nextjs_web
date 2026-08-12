import { useCallback, useEffect, useRef, useState } from "react";

interface ScrollFade {
  top: boolean;
  bottom: boolean;
}

const NO_FADE: ScrollFade = { top: false, bottom: false };
// tolerance for fractional scroll metrics under browser zoom / HiDPI
const EPSILON = 1;

/**
 * Tracks whether a scroll container has content hidden past its top / bottom edge,
 * so the consumer can fade that edge instead of showing a scrollbar.
 */
const useScrollFade = <T extends HTMLElement>(enabled = true) => {
  const ref = useRef<T>(null);
  const [fade, setFade] = useState<ScrollFade>(NO_FADE);

  const update = useCallback(() => {
    const element = ref.current;
    const next: ScrollFade =
      element && enabled
        ? {
            top: element.scrollTop > EPSILON,
            bottom: element.scrollTop < element.scrollHeight - element.clientHeight - EPSILON
          }
        : NO_FADE;

    // bail when nothing changed so the observers below can't loop
    setFade((current) =>
      current.top === next.top && current.bottom === next.bottom ? current : next
    );
  }, [enabled]);

  useEffect(() => {
    const element = ref.current;
    update();

    if (!element || !enabled) return;

    element.addEventListener("scroll", update, { passive: true });
    // container box changes (window resize)
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(element);
    // content changes that grow/shrink scrollHeight without touching the container box,
    // e.g. buttons rendering once the user's permissions resolve
    const mutationObserver = new MutationObserver(update);
    mutationObserver.observe(element, { childList: true, subtree: true });

    return () => {
      element.removeEventListener("scroll", update);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [enabled, update]);

  return { ref, fade };
};

export default useScrollFade;
