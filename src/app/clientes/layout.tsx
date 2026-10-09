import ClientsLayout from "@/modules/clients/containers/clients-layout/clients-layout";
import { Metadata } from "next";
import { FC, ReactNode } from "react";

export const metadata: Metadata = {
  title: "Clientes",
  description: "Clientes"
};

interface LayoutProps {
  children?: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  return <ClientsLayout>{children}</ClientsLayout>;
};

export default Layout;
