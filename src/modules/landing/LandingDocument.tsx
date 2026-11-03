// Documento HTML de la landing. Es el layout raíz de / y /en (grupos
// (landing-es) y (landing-en)): no usa el layout de la app, que es de cliente
// y muestra un loader antes del contenido, para que el HTML del servidor
// llegue completo a buscadores e IA y la página cargue liviana.
import type { ReactNode } from "react";
import type { Viewport } from "next";
import { JetBrains_Mono, Manrope } from "next/font/google";

import type { Lang } from "./content";
import "./landing.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-manrope"
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-mono"
});

export const landingViewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f6f3"
};

export const LandingDocument = ({ lang, children }: { lang: Lang; children: ReactNode }) => (
  <html lang={lang} className={`${manrope.variable} ${mono.variable}`}>
    <body>{children}</body>
  </html>
);
