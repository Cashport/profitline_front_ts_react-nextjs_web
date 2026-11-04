import CashApplicationView from "./cash-application-view";
import { pageMetadata } from "@/i18n/metadata";

export const generateMetadata = () => pageMetadata("cashApplication");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <CashApplicationView>{children}</CashApplicationView>;
}
