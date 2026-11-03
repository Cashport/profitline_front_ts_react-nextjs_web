import { useEffect, useState } from "react";
import { getAppZoom } from "@/utils/utils";

const useScreenHeight = () => {
  const [height, setHeight] = useState(window.innerHeight / getAppZoom());

  useEffect(() => {
    const handleResize = () => setHeight(window.innerHeight / getAppZoom());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return height;
};

export default useScreenHeight;
