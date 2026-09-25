import { Metadata } from "next";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

export const metadata: Metadata = {
  title: "Admin marketplace",
  description: "Admin marketplace"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ViewWrapper headerTitle="" gapTitle="0" hideHeader>
      {children}
    </ViewWrapper>
  );
}
