import "@/modules/cetaphil/styles/cetaphilStyles.css";
import { pageMetadata } from "@/i18n/metadata";

export const generateMetadata = () => pageMetadata("cetaphil");

export default function CetaphilLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="cetaphil-theme">{children}</div>;
}
