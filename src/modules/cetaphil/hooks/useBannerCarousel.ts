import { useState, useEffect } from "react";
import { StaticImageData } from "next/image";

export const useBannerCarousel = (banners: StaticImageData[], interval: number = 5000) => {
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, interval);
    
    return () => clearInterval(timer);
  }, [banners.length, interval]);

  return { currentBanner, setCurrentBanner };
};
