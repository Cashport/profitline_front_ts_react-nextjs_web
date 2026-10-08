"use client";

import type { Dayjs } from "dayjs";

import WalletThemeToggle from "@/modules/walletModule/components/wallet-theme-toggle/wallet-theme-toggle";

import VisitsDateNav from "../visits-date-nav/visits-date-nav";

interface VisitsHeaderProps {
  day: Dayjs;
  today: Dayjs;
  onDayChange: (day: Dayjs) => void;
}

/** Barra superior del módulo: título, día que se mira y tema. */
export default function VisitsHeader({ day, today, onDayChange }: VisitsHeaderProps) {
  return (
    <header className="flex flex-wrap items-center gap-3.5 border-b border-border pb-3">
      <h1 className="text-base font-semibold text-foreground">Visitas</h1>
      <VisitsDateNav day={day} today={today} onChange={onDayChange} />
      <div className="ml-auto flex items-center gap-3">
        <WalletThemeToggle />
      </div>
    </header>
  );
}
