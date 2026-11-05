import { useEffect, useState } from "react";

import { getAppZoom } from "@/utils/utils";

/** Ancho de celular (px CSS, ya compensado por el zoom global). */
export const MOBILE_WIDTH = 640;

/** true en pantallas angostas; arranca en false para no romper el render del servidor. */
export default function useIsMobile(breakpoint = MOBILE_WIDTH) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const update = () => setMobile(window.innerWidth / getAppZoom() < breakpoint);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [breakpoint]);
  return mobile;
}
