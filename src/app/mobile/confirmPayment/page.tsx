import MobileConfirmPayment from "@/modules/cashportMobile/containers/MobileConfirmPayment/MobileConfirmPayment";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "CashportMobile"
};

export default function Mobile() {
  return <MobileConfirmPayment />;
}
