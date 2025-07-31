import PendingInvoiceDetail from "@/modules/cashportMobile/containers/PendingInvoiceDetail/PendingInvoiceDetail";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "CashportMobile"
};

export default function Mobile() {
  return <PendingInvoiceDetail />;
}
