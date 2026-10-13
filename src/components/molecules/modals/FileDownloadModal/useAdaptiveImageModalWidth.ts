import { useCallback, useEffect, useRef, useState } from "react";

const PADDING = 48;
const HARD_MAX = 1400;
const MIN_WIDTH = 320;
const VIEWPORT_RATIO = 0.9;

const computeWidth = (naturalWidth: number): number => {
  const target = Math.min(naturalWidth + PADDING, window.innerWidth * VIEWPORT_RATIO, HARD_MAX);
  return Math.max(target, MIN_WIDTH);
};

export const useAdaptiveImageModalWidth = (url: string | undefined, isOpen: boolean) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [modalWidth, setModalWidth] = useState<number | undefined>(undefined);

  const onImgLoad = useCallback(() => {
    const node = imgRef.current;
    if (!node || !node.naturalWidth) return;
    setModalWidth(computeWidth(node.naturalWidth));
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setModalWidth(undefined);
      return;
    }
    setModalWidth(undefined);
    const node = imgRef.current;
    if (node?.complete && node.naturalWidth > 0) {
      setModalWidth(computeWidth(node.naturalWidth));
    }
  }, [url, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const node = imgRef.current;
        if (node?.naturalWidth) setModalWidth(computeWidth(node.naturalWidth));
      });
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, [isOpen]);

  return { modalWidth, imgRef, onImgLoad };
};
