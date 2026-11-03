import { Metadata } from "next";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

export const metadata: Metadata = {
  title: "Plataforma",
  description: "Administración de la plataforma (Profitline)"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ViewWrapper headerTitle="" gapTitle="0" hideHeader contentClassName="cp-scroll-cards">
      {children}
    </ViewWrapper>
  );
}
