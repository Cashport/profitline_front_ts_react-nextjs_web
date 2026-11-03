import ClientsLayout from "@/modules/clients/containers/clients-layout/clients-layout";
import { FC, ReactNode } from "react";
import { pageMetadata } from "@/i18n/metadata";

export const generateMetadata = () => pageMetadata("receivables");

interface LayoutProps {
  children?: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  return <ClientsLayout>{children}</ClientsLayout>;
};

export default Layout;
