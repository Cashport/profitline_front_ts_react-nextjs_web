"use client";

import { useState } from "react";

import ControlMatrix from "../../components/control-matrix/control-matrix";
import InvoiceGroups from "../../components/invoice-groups/invoice-groups";
import WalletFilters from "../../components/wallet-filters/wallet-filters";
import WalletHeader from "../../components/wallet-header/wallet-header";
import WalletStatCards from "../../components/wallet-stat-cards/wallet-stat-cards";
import { WALLET_CLIENT_ROWS, WALLET_GROUP_ROWS, WALLET_SUMMARY } from "../../mocked-data";

export default function WalletView() {
  // TODO: la búsqueda global filtrará contra el API; hoy sólo vive en el header.
  const [, setSearch] = useState("");

  return (
    <div className="wallet-scope flex flex-col gap-4 pb-6">
      <WalletHeader onSearchChange={setSearch} />

      <h2 className="text-lg font-semibold text-foreground">Cartera por cliente y tramo</h2>

      <WalletFilters summary={WALLET_SUMMARY} />
      <WalletStatCards summary={WALLET_SUMMARY} />
      <ControlMatrix rows={WALLET_CLIENT_ROWS} />
      <InvoiceGroups rows={WALLET_GROUP_ROWS} />
    </div>
  );
}
