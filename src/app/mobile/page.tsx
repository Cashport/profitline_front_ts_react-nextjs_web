import CashportMobileView from "@/modules/cashportMobile/containers/CashportMobileView";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "CashportMobile"
};

export default function Mobile() {
  return <CashportMobileView />;
}
