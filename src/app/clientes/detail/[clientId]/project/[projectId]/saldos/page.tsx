"use client";

import { SaldosProvider } from "@/modules/balances/context/saldos-context";
import { ClientBalancesView } from "@/modules/clients/containers/balances-tab/ClientBalancesView";

const SaldosPage = () => (
  <SaldosProvider>
    <ClientBalancesView />
  </SaldosProvider>
);

export default SaldosPage;
