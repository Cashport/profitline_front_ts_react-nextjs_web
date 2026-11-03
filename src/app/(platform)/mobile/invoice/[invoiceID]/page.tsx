import PendingInvoiceDetail from "@/modules/cashportMobile/containers/PendingInvoiceDetail/PendingInvoiceDetail";
import { pageMetadata } from "@/i18n/metadata";
export const generateMetadata = () => pageMetadata("cashportMobile");

export default function Mobile() {
  return <PendingInvoiceDetail />;
}
