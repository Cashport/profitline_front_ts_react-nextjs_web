import { Metadata } from "next";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ViewWrapper headerTitle="" gapTitle="0">{children}</ViewWrapper>;
}
