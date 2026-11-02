import { LandingPage } from "@/modules/landing/components/LandingPage";
import { buildMetadata } from "@/modules/landing/seo";

export const metadata = buildMetadata("es");

export default function HomeEs() {
  return <LandingPage lang="es" />;
}
