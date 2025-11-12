import type { Metadata } from "next";
import "@/modules/cetaphil/styles/cetaphilStyles.css";

export const metadata: Metadata = {
  title: "Cetaphil - Marketplace Exclusivo",
  description: "Marketplace exclusivo para trabajadores de Galderma"
};

export default function CetaphilLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
    </>
  );
}
