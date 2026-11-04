import CashportMobileView from "@/modules/cashportMobile/containers/CashportMobileView/CashportMobileView";
import { pageMetadata } from "@/i18n/metadata";
export const generateMetadata = () => pageMetadata("cashportMobile");

export default function Mobile() {
  return <CashportMobileView />;
}
