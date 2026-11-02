import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { Metadata } from "next";
import { FC, ReactNode } from "react";

export const metadata: Metadata = {
  title: "Completar formulario",
  description: "Completar formulario"
};

interface CompleteFormLayoutProps {
  children?: ReactNode;
}

const CompleteFormLayout: FC<CompleteFormLayoutProps> = ({ children }) => {
  return <ViewWrapper headerTitle="Cruz verde">{children}</ViewWrapper>;
};

export default CompleteFormLayout;
