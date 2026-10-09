import { Metadata } from "next";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

export const metadata: Metadata = {
  title: "Task manager",
  description: "Gestor de tareas"
};
const TaskManagerLayout = ({ children }: { children: React.ReactNode }) => {
  return <ViewWrapper headerTitle="Gestor de tareas">{children}</ViewWrapper>;
};
export default TaskManagerLayout;
