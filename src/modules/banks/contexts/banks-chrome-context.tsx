"use client";

import { createContext, useContext, type ReactNode } from "react";
import { createPortal } from "react-dom";

/* Diseño "Pedidos y Bancos": el buscador y Filtrar de Bancos van en el header de la página, y
   "Reglas de banco" y "⋯" a la derecha de las pestañas. Cada pestaña sigue dueña de su
   búsqueda, filtros y acciones: BanksView pone los dos espacios y la pestaña activa pinta ahí
   sus controles. */

interface BanksChrome {
  /** Espacio en el header compartido (antes del avatar). */
  headerSlot: HTMLElement | null;
  /** Espacio a la derecha de la fila de pestañas. */
  tabsSlot: HTMLElement | null;
}

export const BanksChromeContext = createContext<BanksChrome>({ headerSlot: null, tabsSlot: null });

interface BanksSlotProps {
  to: "header" | "tabs";
  /** Solo la pestaña activa pinta sus controles. */
  active: boolean;
  children: ReactNode;
}

export function BanksSlot({ to, active, children }: BanksSlotProps) {
  const { headerSlot, tabsSlot } = useContext(BanksChromeContext);
  const target = to === "header" ? headerSlot : tabsSlot;
  if (!active || !target) return null;
  return createPortal(children, target);
}
