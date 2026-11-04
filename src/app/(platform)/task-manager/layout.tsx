import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { pageMetadata } from "@/i18n/metadata";

export const generateMetadata = () => pageMetadata("mail");
const TaskManagerLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ViewWrapper headerTitleKey="mail" hideHeader>
      {children}
    </ViewWrapper>
  );
};
export default TaskManagerLayout;
