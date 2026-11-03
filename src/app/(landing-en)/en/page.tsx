import { LandingPage } from "@/modules/landing/components/LandingPage";
import { buildMetadata } from "@/modules/landing/seo";

export const metadata = buildMetadata("en");

export default function HomeEn() {
  return <LandingPage lang="en" />;
}
