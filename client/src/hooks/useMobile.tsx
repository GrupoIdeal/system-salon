import * as React from "react";
import { isNativePlatform } from "@/lib/capacitor";

const MOBILE_BREAKPOINT = 768;

function getIsMobile() {
  if (typeof window === "undefined") return false;
  if (import.meta.env.VITE_MOBILE === "true") return true;
  if (isNativePlatform()) return true;
  return window.innerWidth < MOBILE_BREAKPOINT;
}

export function useIsMobile() {
  const forcedMobile = import.meta.env.VITE_MOBILE === "true";
  const [isMobile, setIsMobile] = React.useState<boolean>(getIsMobile);

  React.useEffect(() => {
    if (forcedMobile || isNativePlatform()) {
      setIsMobile(true);
      return;
    }
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [forcedMobile]);

  return isMobile;
}
