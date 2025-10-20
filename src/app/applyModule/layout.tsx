import { Metadata } from "next";
import { SideBar } from "@/components/molecules/SideBar/SideBar";
import Header from "@/components/organisms/header";

export const metadata: Metadata = {
  title: "Aplicación de pago",
  description: "Aplicación de pago"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page">
      <SideBar />
      <div className="mainContent">
        <Header title="Aplicación de pago" />
        {children}
      </div>
    </div>
  );
}
