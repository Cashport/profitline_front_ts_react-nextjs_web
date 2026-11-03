"use client";

import { createContext, useContext } from "react";

/* Tema del módulo para el menú del avatar (docs/DESIGN.md §4): los módulos con modo oscuro
   (Cartera por edad, Torre de recaudo, Visitas, Comercio…) publican aquí su preferencia y el
   menú del usuario muestra "Tema: Claro / Oscuro / Sistema". Sin proveedor, el menú no lo
   muestra: ese módulo no tiene modo oscuro. */

export type ThemePreference = "light" | "dark" | "system";

export interface ThemeMenuValue {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
}

export const ThemeMenuContext = createContext<ThemeMenuValue | null>(null);

export const useThemeMenu = () => useContext(ThemeMenuContext);
