import ComercioLayout from "@/modules/commerce/containers/comercio-layout/ComercioLayout";
import { pageMetadata } from "@/i18n/metadata";

export const generateMetadata = () => pageMetadata("marketplace");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ComercioLayout>{children}</ComercioLayout>;
}
