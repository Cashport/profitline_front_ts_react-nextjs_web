import { Metadata } from "next";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

export const metadata: Metadata = {
  title: "Comunicaciones masivas",
  description: "Gestor de comunicaciones masivas"
};
const MassCommunicationsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ViewWrapper headerTitle="Comunicaciones masivas" hideHeader>
      {children}
    </ViewWrapper>
  );
};
export default MassCommunicationsLayout;
