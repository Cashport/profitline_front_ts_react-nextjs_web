import NoveltiesLayout from "@/modules/noveltiesModule/containers/novelties-layout/novelties-layout";
import { pageMetadata } from "@/i18n/metadata";

export const generateMetadata = () => pageMetadata("novelties");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <NoveltiesLayout>{children}</NoveltiesLayout>;
}
