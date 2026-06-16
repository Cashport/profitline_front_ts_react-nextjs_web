"use client";

import { SaldosProvider } from "@/modules/balances/context/saldos-context";
import { ClientBalancesView } from "@/modules/balances/containers/ClientBalancesView/ClientBalancesView";

const SaldosPage = () => (
  <SaldosProvider>
    <ClientBalancesView />
  </SaldosProvider>
);

export default SaldosPage;
