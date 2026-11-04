import { Metadata } from "next";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

export const metadata: Metadata = {
  title: "Cierres de cartera",
  description: "Informes de cierre de cartera y recaudo, fijos al corte de cada mes"
};

const ClosingsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ViewWrapper headerTitle="Cierres de cartera" hideHeader>
      {children}
    </ViewWrapper>
  );
};

export default ClosingsLayout;
