import CashportMobile from "@/modules/cashportMobile/containers/CashportMobile";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "CashportMobile"
};

export default function Mobile() {
  return <CashportMobile />;
}
