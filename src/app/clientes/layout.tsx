import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import {
  ClientsHomeHeaderActions,
  ClientsHomeHeaderExtra
} from "@/modules/clients/components/clients-home/clients-home-header/clients-home-header";
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
    <ViewWrapper
      headerTitle="Clientes"
      headerTitleExtra={<ClientsHomeHeaderExtra />}
      headerActions={<ClientsHomeHeaderActions />}
    >
      {children}
    </ViewWrapper>
  );
};

export default ClientsLayout;
