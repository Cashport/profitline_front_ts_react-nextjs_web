import ModifyPayments from "@/modules/cashportMobile/containers/ModifyPayments/ModifyPayments";
import { pageMetadata } from "@/i18n/metadata";
export const generateMetadata = () => pageMetadata("cashportMobile");

export default function ModifyPaymentsPage() {
  return <ModifyPayments />;
}
