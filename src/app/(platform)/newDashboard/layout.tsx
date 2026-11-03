import { Metadata } from "next";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    // El header lo pinta la vista (título según la pestaña activa)
    <ViewWrapper headerTitle="Dashboard" gapTitle="0" hideHeader>
      {children}
    </ViewWrapper>
  );
}
