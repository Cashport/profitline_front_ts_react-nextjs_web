import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { pageMetadata } from "@/i18n/metadata";

export const generateMetadata = () => pageMetadata("surveys");

const SurveysLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ViewWrapper headerTitleKey="surveys" hideHeader>
      {children}
    </ViewWrapper>
  );
};

export default SurveysLayout;
