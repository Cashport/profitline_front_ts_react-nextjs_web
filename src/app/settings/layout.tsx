import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { Metadata } from "next";
import { FC, ReactNode } from "react";

export const metadata: Metadata = {
  title: "Profitline",
  description: "Profitline"
};

interface ClientsLayoutProps {
  children?: ReactNode;
}

const ClientsLayout: FC<ClientsLayoutProps> = ({ children }) => {
  return <ViewWrapper headerTitle="Proyectos">{children}</ViewWrapper>;
};

export default ClientsLayout;
