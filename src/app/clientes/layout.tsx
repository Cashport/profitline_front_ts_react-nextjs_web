import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { PortfolioClientsCutoff } from "@/components/molecules/PortfolioClientsCutoff/PortfolioClientsCutoff";
import { Metadata } from "next";
import { FC, ReactNode } from "react";

export const metadata: Metadata = {
  title: "Clientes",
  description: "Clientes"
};

interface ClientsLayoutProps {
  children?: ReactNode;
}

const ClientsLayout: FC<ClientsLayoutProps> = ({ children }) => {
  return (
    <ViewWrapper headerTitle="Clientes" headerTitleExtra={<PortfolioClientsCutoff />}>
      {children}
    </ViewWrapper>
  );
};

export default ClientsLayout;
