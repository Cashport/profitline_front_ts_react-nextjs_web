import type { ReactNode } from "react";
import { LandingDocument, landingViewport } from "@/modules/landing/LandingDocument";

export const viewport = landingViewport;

export default function LandingEsLayout({ children }: { children: ReactNode }) {
  return <LandingDocument lang="es">{children}</LandingDocument>;
}
