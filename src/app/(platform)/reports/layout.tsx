import { Metadata } from "next";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

export const metadata: Metadata = {
  title: "Informes",
  description: "Informes publicados para el equipo"
};

const ReportsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ViewWrapper headerTitle="Informes" hideHeader>
      {children}
    </ViewWrapper>
  );
};

export default ReportsLayout;
