import { FC, ReactNode } from "react";

import SettingsShell from "./SettingsShell";
import { pageMetadata } from "@/i18n/metadata";

export const generateMetadata = () => pageMetadata("projects");

interface ClientsLayoutProps {
  children?: ReactNode;
}

const ClientsLayout: FC<ClientsLayoutProps> = ({ children }) => {
  return <SettingsShell>{children}</SettingsShell>;
};

export default ClientsLayout;
