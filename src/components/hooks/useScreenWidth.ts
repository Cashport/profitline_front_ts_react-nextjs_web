import { useEffect, useState } from "react";
import { getAppZoom } from "@/utils/utils";

const useScreenWidth = () => {
  const [width, setWidth] = useState<number>(window.innerWidth / getAppZoom());

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth / getAppZoom());
    setWidth(window.innerWidth / getAppZoom());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
};

export default useScreenWidth;
