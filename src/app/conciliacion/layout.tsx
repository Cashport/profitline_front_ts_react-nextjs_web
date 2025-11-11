import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { Metadata } from "next";
import { FC, ReactNode } from "react";

export const metadata: Metadata = {
  title: "Conciliación",
  description: "Conciliación"
};

interface ConcilationLayoutProps {
  children?: ReactNode;
}

const ConcilationLayout: FC<ConcilationLayoutProps> = ({ children }) => {
  return <ViewWrapper headerTitle="">{children}</ViewWrapper>;
};

export default ConcilationLayout;
