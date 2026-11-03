import { Metadata } from "next";
import ModifyPayments from "@/modules/cashportMobile/containers/ModifyPayments/ModifyPayments";
export const metadata: Metadata = {
  title: "CashportMobile"
};

export default function ModifyPaymentsPage() {
  return <ModifyPayments />;
}
