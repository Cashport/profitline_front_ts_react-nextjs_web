"use client";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { IProductInventoryItem } from "@/types/marketAdmin/IMarketAdmin";

dayjs.extend(utc);

type Props = {
  lotes: IProductInventoryItem[];
  loading?: boolean;
};

// Columnas fijas en las 2 últimas para que header y filas queden alineados
// (los grids son independientes, con `auto` se desalinean).
const gridCols = "grid grid-cols-[minmax(0,1.2fr)_minmax(0,1.5fr)_96px_72px] gap-4";

// La fecha llega como ISO en UTC (…T00:00:00.000Z) → se formatea en UTC para no correr un día.
const formatVence = (date: string) => {
  const d = dayjs.utc(date);
  return d.isValid() ? d.format("DD-MM-YYYY") : "—";
};

export default function ProductLotes({ lotes, loading = false }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-[#141414]">Lotes</p>
        {!loading && (
          <span className="text-xs text-[#999999]">
            {lotes.length} lote{lotes.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-[#999999]">Cargando lotes…</p>
      ) : lotes.length === 0 ? (
        <p className="text-sm text-[#999999]">Sin lotes disponibles.</p>
      ) : (
        <div>
          <div className={`${gridCols} pb-2`}>
            <span className="text-xs font-bold text-[#141414]">Lote</span>
            <span className="text-xs font-bold text-[#141414]">Bodega</span>
            <span className="text-xs font-bold text-[#141414]">Vence</span>
            <span className="text-xs font-bold text-[#141414] text-right">Unidades</span>
          </div>
          {lotes.map((lote) => (
            <div
              key={`${lote.batch}-${lote.id_warehouse}`}
              className={`${gridCols} py-3 border-t border-[#F5F5F5] items-center`}
            >
              <span className="text-sm font-mono text-[#141414]">{lote.batch}</span>
              <span
                className="text-sm text-[#141414] truncate min-w-0"
                title={lote.warehouse_description}
              >
                {lote.warehouse_description}
              </span>
              <span className="text-sm text-[#141414]">
                {formatVence(lote.batch_expiration_date)}
              </span>
              <span className="text-sm font-bold text-[#141414] text-right">{lote.units}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
