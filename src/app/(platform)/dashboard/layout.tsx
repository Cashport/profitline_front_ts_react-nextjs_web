import RecaudoLayout from "@/modules/recaudoModule/containers/recaudo-layout/recaudo-layout";
import { pageMetadata } from "@/i18n/metadata";

export const generateMetadata = () => pageMetadata("collectionsTower");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RecaudoLayout>{children}</RecaudoLayout>;
}
