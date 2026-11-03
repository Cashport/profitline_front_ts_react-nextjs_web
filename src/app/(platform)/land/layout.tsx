import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { pageMetadata } from "@/i18n/metadata";

export const generateMetadata = () => pageMetadata("home");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ViewWrapper headerTitle="">{children}</ViewWrapper>;
}
