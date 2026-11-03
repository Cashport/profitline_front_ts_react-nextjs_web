import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { Metadata } from "next";
import { FC, ReactNode } from "react";

export const metadata: Metadata = {
  title: "Crear formulario",
  description: "Crear formulario"
};

interface ClientsLayoutProps {
  children?: ReactNode;
}

const ClientsLayout: FC<ClientsLayoutProps> = ({ children }) => {
  return <ViewWrapper headerTitle="Cruz verde">{children}</ViewWrapper>;
};

export default ClientsLayout;
