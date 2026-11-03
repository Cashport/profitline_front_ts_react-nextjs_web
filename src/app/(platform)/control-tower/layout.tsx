import TorreLayout from "@/modules/torreControlModule/containers/torre-layout/torre-layout";
import { pageMetadata } from "@/i18n/metadata";

export const generateMetadata = () => pageMetadata("controlTower");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <TorreLayout>{children}</TorreLayout>;
}
