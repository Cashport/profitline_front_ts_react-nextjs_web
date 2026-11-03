import type { ReactNode } from "react";
import { LandingDocument, landingViewport } from "@/modules/landing/LandingDocument";

export const viewport = landingViewport;

export default function LandingEnLayout({ children }: { children: ReactNode }) {
  return <LandingDocument lang="en">{children}</LandingDocument>;
}
