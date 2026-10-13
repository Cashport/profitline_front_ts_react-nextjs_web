import { useWalletTheme } from "@/modules/walletModule/contexts/wallet-theme-context";

import { VISITS_PALETTE } from "../constants";

/** Colores semánticos del tema activo (compartido con Cartera, Tickets y Novedades). */
export function useVisitsPalette() {
  const { resolvedTheme } = useWalletTheme();
  return { palette: VISITS_PALETTE[resolvedTheme], isDark: resolvedTheme === "dark" };
}
