import { Metadata } from "next";
import Header from "@/components/organisms/header";
import { SideBar } from "@/components/molecules/SideBar/SideBar";
import PaymentWebPage from "./page";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

export const metadata: Metadata = {
  title: "Pago",
  description: "Pantalla de pago con Wompi"
};

const PaymentWebLayout = () => {
  return (
    <ViewWrapper headerTitle="Pago">
      <PaymentWebPage />
    </ViewWrapper>
  );
};

export default PaymentWebLayout;
