import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { pageMetadata } from "@/i18n/metadata";

export const generateMetadata = () => pageMetadata("reports");

const ReportsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ViewWrapper headerTitleKey="reports" hideHeader>
      {children}
    </ViewWrapper>
  );
};

export default ReportsLayout;
