import { BalancesLayout } from "@/modules/balances/containers/BalancesLayout/BalancesLayout";
import { pageMetadata } from "@/i18n/metadata";

export const generateMetadata = () => pageMetadata("balances");
const SaldosLayout = ({ children }: { children: React.ReactNode }) => {
  return <BalancesLayout>{children}</BalancesLayout>;
};
export default SaldosLayout;
