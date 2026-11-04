import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { pageMetadata } from "@/i18n/metadata";

export const generateMetadata = () => pageMetadata("massCommunications");
const MassCommunicationsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ViewWrapper headerTitleKey="massCommunications" hideHeader>
      {children}
    </ViewWrapper>
  );
};
export default MassCommunicationsLayout;
