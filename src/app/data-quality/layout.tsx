import { Metadata } from "next";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

export const metadata: Metadata = {
  title: "Data Quality",
  description: "Data Quality"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ViewWrapper headerTitle="Data Quality" gapTitle="0">
      {children}
    </ViewWrapper>
  );
}
