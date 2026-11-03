import { Metadata } from "next";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

export const metadata: Metadata = {
  title: "Precintos",
  description: "Módulo de precintos"
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ViewWrapper headerTitle="Precintos">
      {children}
    </ViewWrapper>
  );
}