"use client";
import { usePathname } from "next/navigation";
import { DISCOUNTS_BASE, MARKET_ADMIN_DISCOUNTS_BASE } from "../constants/routes";

// The detail views are mounted under both /descuentos and market-admin, so navigation
// out of them has to return to whichever shell the user came in from.
export function useDiscountsBasePath() {
  const pathname = usePathname();

  return pathname?.startsWith(MARKET_ADMIN_DISCOUNTS_BASE)
    ? MARKET_ADMIN_DISCOUNTS_BASE
    : DISCOUNTS_BASE;
}
