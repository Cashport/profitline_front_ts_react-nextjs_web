import { BalancesView } from "@/modules/balances/containers/BalancesView/BalancesView";
import { SaldosProvider } from "@/modules/balances/context/saldos-context";

export default function Balances() {
  return (
    <SaldosProvider>
      <BalancesView />
    </SaldosProvider>
  );
}
