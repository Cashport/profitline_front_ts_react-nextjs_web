import { Metadata } from "next";
import { FC, ReactNode } from "react";

import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

export const metadata: Metadata = {
  title: "Salud de Automatizaciones",
  description: "Salud de Automatizaciones"
};

interface BotHealthLayoutProps {
  children?: ReactNode;
}

const BotHealthLayout: FC<BotHealthLayoutProps> = ({ children }) => {
  return <ViewWrapper headerTitle="Salud de Automatizaciones">{children}</ViewWrapper>;
};

export default BotHealthLayout;
