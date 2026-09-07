"use client";

import { useMemo, useState } from "react";

import ControlMatrix from "../../components/control-matrix/control-matrix";
import GroupDetailModal from "../../components/group-detail-modal/group-detail-modal";
import InvoiceGroups from "../../components/invoice-groups/invoice-groups";
import WalletFilters from "../../components/wallet-filters/wallet-filters";
import WalletHeader from "../../components/wallet-header/wallet-header";
import WalletStatCards from "../../components/wallet-stat-cards/wallet-stat-cards";
import { WALLET_CLIENT_ROWS, WALLET_GROUP_ROWS, WALLET_SUMMARY } from "../../mocked-data";
import { corto } from "../../utils/format";
import { filtrarClientes, filtrarGrupos } from "../../utils/wallet-calc";
import type { IWalletDrilldown } from "../../types";

export default function WalletView() {
  // TODO: la búsqueda global filtrará contra el API; hoy sólo vive en el header.
  const [, setSearch] = useState("");
  // La búsqueda de la matriz vive aquí porque acota las dos tablas.
  const [query, setQuery] = useState("");
  // Cliente (y tramo) elegidos en la matriz: acotan los grupos de abajo.
  const [drilldown, setDrilldown] = useState<IWalletDrilldown | null>(null);
  // Clave del grupo abierto en el modal de gestión. Vive en la vista y no en la
  // tabla para que el drilldown de la matriz pueda abrir el mismo modal.
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  // Buscar reinicia la selección: el cliente elegido puede salirse de la matriz.
  const onQueryChange = (value: string) => {
    setQuery(value);
    setDrilldown(null);
  };

  const clientRows = useMemo(() => filtrarClientes(WALLET_CLIENT_ROWS, query), [query]);
  const groupRows = useMemo(
    () => filtrarGrupos(WALLET_GROUP_ROWS, clientRows, drilldown),
    [clientRows, drilldown]
  );

  const drillCliente = drilldown
    ? WALLET_CLIENT_ROWS.find((c) => c.id === drilldown.clienteId)
    : undefined;

  return (
    <div className="wallet-scope flex flex-col gap-4 pb-6">
      <WalletHeader onSearchChange={setSearch} />

      <h2 className="text-lg font-semibold text-foreground">Cartera por cliente y tramo</h2>

      <WalletFilters summary={WALLET_SUMMARY} />
      <WalletStatCards summary={WALLET_SUMMARY} />
      <ControlMatrix
        rows={clientRows}
        drilldown={drilldown}
        onQueryChange={onQueryChange}
        onSelect={setDrilldown}
      />
      <InvoiceGroups
        rows={groupRows}
        drilldown={drilldown}
        clienteNombre={drillCliente ? corto(drillCliente.nombre) : null}
        openGroup={openGroup}
        onClearDrilldown={() => setDrilldown(null)}
        onOpenDetail={setOpenGroup}
      />

      <GroupDetailModal clave={openGroup} onClose={() => setOpenGroup(null)} />
    </div>
  );
}
