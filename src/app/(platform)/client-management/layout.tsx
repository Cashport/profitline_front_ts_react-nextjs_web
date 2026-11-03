import SelfServiceShell from "./SelfServiceShell";
import { pageMetadata } from "@/i18n/metadata";

export const generateMetadata = () => pageMetadata("selfService");

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <SelfServiceShell>{children}</SelfServiceShell>;
}
