import MobileConfirmPayment from "@/modules/cashportMobile/containers/MobileConfirmPayment/MobileConfirmPayment";
import { pageMetadata } from "@/i18n/metadata";
export const generateMetadata = () => pageMetadata("cashportMobile");

export default function Mobile() {
  return <MobileConfirmPayment />;
}
