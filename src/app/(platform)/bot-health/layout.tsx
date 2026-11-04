import { FC, ReactNode } from "react";

import BotHealthShell from "./BotHealthShell";
import { pageMetadata } from "@/i18n/metadata";

export const generateMetadata = () => pageMetadata("botHealth");

interface BotHealthLayoutProps {
  children?: ReactNode;
}

const BotHealthLayout: FC<BotHealthLayoutProps> = ({ children }) => {
  return <BotHealthShell>{children}</BotHealthShell>;
};

export default BotHealthLayout;
