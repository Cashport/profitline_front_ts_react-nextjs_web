import { Metadata } from "next";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

export const metadata: Metadata = {
  title: "Chat",
  description: "Chat"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ViewWrapper headerTitle="">{children}</ViewWrapper>;
}
