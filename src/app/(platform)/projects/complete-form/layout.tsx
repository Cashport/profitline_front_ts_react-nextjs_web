import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { FC, ReactNode } from "react";
import { pageMetadata } from "@/i18n/metadata";

export const generateMetadata = () => pageMetadata("completeForm");

interface CompleteFormLayoutProps {
  children?: ReactNode;
}

const CompleteFormLayout: FC<CompleteFormLayoutProps> = ({ children }) => {
  return <ViewWrapper headerTitle="Cruz verde">{children}</ViewWrapper>;
};

export default CompleteFormLayout;
