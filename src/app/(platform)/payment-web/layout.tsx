import PaymentWebPage from "./page";
import PaymentWebShell from "./payment-web-shell";
import { pageMetadata } from "@/i18n/metadata";

export const generateMetadata = () => pageMetadata("payment");

const PaymentWebLayout = () => {
  return (
    <PaymentWebShell>
      <PaymentWebPage />
    </PaymentWebShell>
  );
};

export default PaymentWebLayout;
