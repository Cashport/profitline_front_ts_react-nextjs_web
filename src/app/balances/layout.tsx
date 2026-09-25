import { Metadata } from "next";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

export const metadata: Metadata = {
  title: "Saldos",
  description: "Saldos"
};
const SaldosLayout = ({ children }: { children: React.ReactNode }) => {
  return <ViewWrapper headerTitle="Saldos">{children}</ViewWrapper>;
};
export default SaldosLayout;
