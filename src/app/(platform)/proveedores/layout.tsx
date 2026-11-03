import { Metadata } from "next";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

export const metadata: Metadata = {
  title: "Proveedores",
  description: "Proveedores"
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ViewWrapper headerTitle="Proveedores" hideHeader>
      {children}
    </ViewWrapper>
  );
}
