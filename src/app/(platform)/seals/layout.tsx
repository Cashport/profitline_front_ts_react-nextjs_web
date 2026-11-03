import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { pageMetadata } from "@/i18n/metadata";

export const generateMetadata = () => pageMetadata("seals");

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ViewWrapper headerTitleKey="seals">
      {children}
    </ViewWrapper>
  );
}