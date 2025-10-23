import { Metadata } from "next";
import Header from "@/components/organisms/header";
import { SideBar } from "@/components/molecules/SideBar/SideBar";
import PaymentWebPage from "./page";

export const metadata: Metadata = {
  title: "Pago",
  description: "Pantalla de pago con Wompi"
};

const PaymentWebLayout = () => {
  return (
    <div className="page">
      <SideBar />
      <div className="mainContent">
        <Header title="Pago" />
        <PaymentWebPage />
      </div>
    </div>
  );
};

export default PaymentWebLayout;
