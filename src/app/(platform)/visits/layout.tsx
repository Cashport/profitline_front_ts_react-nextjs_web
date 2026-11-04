import VisitsLayout from "@/modules/visitsModule/containers/visits-layout/visits-layout";
import { pageMetadata } from "@/i18n/metadata";

export const generateMetadata = () => pageMetadata("visits");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <VisitsLayout>{children}</VisitsLayout>;
}
