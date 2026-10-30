"use client";

import GenericEyeButton from "@/components/ui/generic-eye-button";
import SortableTh from "@/modules/walletModule/components/shared/sortable-th";
import type { IBranch } from "@/types/branches/IBranches";
import { cn } from "@/utils/utils";

import { BRANCHES_PATH, NO_ADDRESS, SORT_LABEL, type BranchesSortKey } from "../../constants";
import { useBranchesStore } from "../../stores/branches-store";
import { formatPrice } from "../../utils/branches";
import BranchStatusBadge from "../branch-status-badge/branch-status-badge";
import PriceListBadge from "../price-list-badge/price-list-badge";

/** Encabezado sin orden, con el mismo estilo que `SortableTh` (el de Clientes). */
const PLAIN_TH =
  "whitespace-nowrap border-b border-cp-line bg-cp-surface px-3 py-3 text-left text-[13.5px] font-semibold text-cp-ink";
const TD = "px-3 py-2.5";

interface BranchesTableProps {
  branches: IBranch[];
  onClearAll: () => void;
}

/** Tabla del listado: encabezado sticky, columnas ordenables y el ojo que abre el detalle. */
export default function BranchesTable({ branches, onClearAll }: BranchesTableProps) {
  const sort = useBranchesStore((s) => s.sort);
  const toggleSort = useBranchesStore((s) => s.toggleSort);

  const sortState = { col: sort.key, dir: sort.dir === 1 ? "asc" : "desc" } as const;
  const sortable = (key: BranchesSortKey, align?: "right") => (
    <SortableTh
      col={key}
      label={SORT_LABEL[key]}
      align={align}
      sort={sortState}
      onSort={(col) => toggleSort(col as BranchesSortKey)}
    />
  );

  return (
    <table className="w-full table-fixed border-collapse text-[13px] text-cp-ink">
      <colgroup>
        <col style={{ width: "17%" }} />
        <col />
        <col style={{ width: "11%" }} />
        <col style={{ width: "18%" }} />
        <col style={{ width: "14%" }} />
        <col style={{ width: "10%" }} />
        <col style={{ width: "9%" }} />
        <col style={{ width: 56 }} />
      </colgroup>
      <thead className="sticky top-0 z-[1]">
        <tr>
          {sortable("client")}
          {sortable("branch")}
          {sortable("city")}
          <th scope="col" className={PLAIN_TH}>
            Dirección
          </th>
          {sortable("priceList")}
          {sortable("price", "right")}
          {sortable("status")}
          <th scope="col" className={PLAIN_TH}>
            <span className="sr-only">Acciones</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {branches.length ? (
          branches.map((b) => (
            <tr
              key={b.id}
              className="border-b border-cp-line transition-colors last:border-b-0 hover:bg-cp-subtle"
            >
              <td className={cn(TD, "truncate font-semibold")} title={b.client_name}>
                {b.client_name}
              </td>
              <td className={cn(TD, "truncate font-medium")} title={b.name}>
                {b.name}
              </td>
              <td className={cn(TD, "truncate text-cp-ink-2")}>{b.city}</td>
              <td
                className={cn(
                  TD,
                  "break-words leading-snug",
                  b.address === NO_ADDRESS ? "italic text-cp-ink-4" : "text-cp-ink-2"
                )}
              >
                {b.address}
              </td>
              <td className={TD}>
                <PriceListBadge priceList={b.price_list} />
              </td>
              <td className={cn(TD, "whitespace-nowrap text-right font-semibold tabular-nums")}>
                {formatPrice(b.base_price)}
              </td>
              <td className={TD}>
                <BranchStatusBadge isActive={b.is_active} />
              </td>
              <td className={TD}>
                <GenericEyeButton
                  href={`${BRANCHES_PATH}/${b.id}`}
                  title={`Ver detalle de ${b.client_name} ${b.name}`}
                  className="mx-auto"
                />
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={8} className="p-9 text-center">
              <p className="m-0 text-[13.5px] font-semibold">No hay sucursales que coincidan</p>
              <p className="m-0 mt-1 text-[13px] text-cp-ink-3">
                Prueba con otra búsqueda o quita algunos filtros.
              </p>
              <button
                type="button"
                onClick={onClearAll}
                className="mt-3 cursor-pointer border-0 bg-transparent text-[13px] font-semibold text-cp-ink underline"
              >
                Limpiar búsqueda y filtros
              </button>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
