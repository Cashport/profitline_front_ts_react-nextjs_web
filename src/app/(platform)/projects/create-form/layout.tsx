import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { FC, ReactNode } from "react";
import { pageMetadata } from "@/i18n/metadata";

export const generateMetadata = () => pageMetadata("createForm");

interface ClientsLayoutProps {
  children?: ReactNode;
}

const ClientsLayout: FC<ClientsLayoutProps> = ({ children }) => {
  return <ViewWrapper headerTitle="Cruz verde">{children}</ViewWrapper>;
};

export default ClientsLayout;
