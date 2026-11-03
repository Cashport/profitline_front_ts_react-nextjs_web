import { Metadata } from "next";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

export const metadata: Metadata = {
  title: "Encuestas",
  description: "Encuestas que los asesores diligencian en sus visitas"
};

const SurveysLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ViewWrapper headerTitle="Encuestas" hideHeader>
      {children}
    </ViewWrapper>
  );
};

export default SurveysLayout;
