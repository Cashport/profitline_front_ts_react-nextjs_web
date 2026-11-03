import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { pageMetadata } from "@/i18n/metadata";

export const generateMetadata = () => pageMetadata("legacyTaskManager");
const TaskManagerLayout = ({ children }: { children: React.ReactNode }) => {
  return <ViewWrapper headerTitleKey="legacyTaskManager">{children}</ViewWrapper>;
};
export default TaskManagerLayout;
