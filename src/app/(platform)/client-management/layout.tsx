import { Metadata } from "next";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

export const metadata: Metadata = {
  title: "Auto gestión",
  description: "Auto gestión"
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <ViewWrapper headerTitle="Auto gestión">{children}</ViewWrapper>;
}
