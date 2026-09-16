"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Plus, Paperclip } from "lucide-react";
import GenericEyeButton from "@/components/ui/generic-eye-button";
import ProfitLoader from "@/components/ui/profit-loader";
import NuevaAsignacionModal from "@/modules/marketAdmin/components/MarketAdminManualBonus/NuevaAsignacionModal";
import { ESTADO_CONFIG } from "@/modules/marketAdmin/components/MarketAdminManualBonus/estadoConfig";
import {
  DateCell,
  StatusPill,
  TextCell,
  TypePill,
  headerCell
} from "@/modules/marketAdmin/components/market-admin-bonus-and-discounts/discountsTableConfig";
import { MARKET_ADMIN_DISCOUNTS_BASE } from "@/components/organisms/discounts/constants/routes";
import { type BonifManual } from "@/modules/marketAdmin/mocks/clientDetail";
import { DiscountByClient } from "@/types/discount/DiscountBasics";
import { ClienteOption, NuevaAsignacionData } from "@/types/marketAdmin/IMarketAdmin";
import { Product } from "@/types/products/products";

type Props = {
  descuentos: DiscountByClient[];
  isLoadingDescuentos: boolean;
  bonificados: BonifManual[];
  cliente: ClienteOption;
  productos: Product[];
  onCreateBonificado: (data: NuevaAsignacionData) => Promise<void>;
};

export default function PromocionesTab({
  descuentos,
  isLoadingDescuentos,
  bonificados,
  cliente,
  productos,
  onCreateBonificado
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [savingBonus, setSavingBonus] = useState(false);

  const handleCreateBonus = () => setShowBonusModal(true);

  // El contenedor ya muestra el toast de error; aquí solo se cierra en éxito.
  const handleSaveBonus = async (data: NuevaAsignacionData) => {
    try {
      setSavingBonus(true);
      await onCreateBonificado(data);
      setShowBonusModal(false);
    } catch {
      // handled upstream
    } finally {
      setSavingBonus(false);
    }
  };

  // Opens the rule-create screen with "Plan anual" preselected; returnTo brings
  // "Volver a la lista" back to this client detail instead of the discounts list.
  const handleCreateDiscount = () =>
    router.push(
      `${MARKET_ADMIN_DISCOUNTS_BASE}/regla/create?category=annual&returnTo=${encodeURIComponent(pathname)}`
    );

  const columns: ColumnsType<DiscountByClient> = [
    {
      title: "Nombre",
      dataIndex: "discount_name",
      key: "discount_name",
      sorter: (a, b) => (a.discount_name ?? "").localeCompare(b.discount_name ?? ""),
      onHeaderCell: headerCell,
      render: (v: string) => <TextCell value={v} />
    },
    {
      title: "Tipo descuentos",
      dataIndex: "discount_type",
      key: "discount_type",
      width: 160,
      sorter: (a, b) => (a.discount_type ?? "").localeCompare(b.discount_type ?? ""),
      onHeaderCell: headerCell,
      render: (tipo: string) => <TypePill tipo={tipo} />
    },
    {
      title: "Definiciones",
      dataIndex: "discount_definition",
      key: "discount_definition",
      sorter: (a, b) => (a.discount_definition ?? "").localeCompare(b.discount_definition ?? ""),
      onHeaderCell: headerCell,
      render: (v: string | null) => <TextCell value={v} />
    },
    {
      title: "Inicio",
      dataIndex: "start_date",
      key: "start_date",
      sorter: (a, b) => (a.start_date ?? "").localeCompare(b.start_date ?? ""),
      onHeaderCell: headerCell,
      render: (v: string) => <DateCell value={v} />
    },
    {
      title: "Fin",
      dataIndex: "end_date",
      key: "end_date",
      sorter: (a, b) => (a.end_date ?? "").localeCompare(b.end_date ?? ""),
      onHeaderCell: headerCell,
      render: (v: string | null) => <DateCell value={v} />
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      width: 110,
      sorter: (a, b) => a.status - b.status,
      onHeaderCell: headerCell,
      render: (status: number) => <StatusPill active={status} />
    },
    {
      title: "Adjunto",
      dataIndex: "contract_archive",
      key: "contract_archive",
      width: 90,
      onHeaderCell: headerCell,
      render: (url: string | null) =>
        url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title="Ver contrato"
            className="w-7 h-7 flex items-center justify-center border border-[#DDDDDD] rounded-md text-[#666666] hover:border-[#141414] hover:text-[#141414] transition-colors"
          >
            <Paperclip size={13} />
          </a>
        ) : (
          <TextCell value={null} />
        )
    },
    {
      title: "",
      key: "ver",
      width: 48,
      onHeaderCell: headerCell,
      render: (_, r) => <GenericEyeButton href={`${MARKET_ADMIN_DISCOUNTS_BASE}/regla/${r.id}`} />
    }
  ];

  const bonifColumns: ColumnsType<BonifManual> = [
    {
      title: "Producto",
      dataIndex: "producto",
      key: "producto",
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#141414] truncate">{v}</span>
    },
    {
      title: "Unidades",
      dataIndex: "unidades",
      key: "unidades",
      width: 100,
      onHeaderCell: headerCell,
      render: (v: number) => <span className="text-sm text-[#141414]">{v}</span>
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      width: 120,
      onHeaderCell: headerCell,
      render: (estado: BonifManual["estado"]) => (
        <span
          className={`px-2 py-1 text-[11px] font-semibold rounded-lg w-fit ${ESTADO_CONFIG[estado].className}`}
        >
          {ESTADO_CONFIG[estado].label}
        </span>
      )
    },
    {
      title: "Fecha",
      dataIndex: "creadoEn",
      key: "creadoEn",
      width: 120,
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#141414]">{v}</span>
    },
    {
      title: "Nota",
      dataIndex: "nota",
      key: "nota",
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#999999] truncate">{v || "—"}</span>
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={handleCreateDiscount}
          className="flex items-center gap-1.5 text-sm font-semibold bg-[#CBE71E] text-[#141414] px-4 py-2 rounded-lg hover:bg-[#b8d11a] transition-colors"
        >
          <Plus size={14} /> Crear descuento
        </button>
      </div>

      {isLoadingDescuentos ? (
        <div className="flex items-center justify-center py-16">
          <ProfitLoader />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={descuentos}
          rowKey="id"
          showSorterTooltip={false}
          pagination={false}
          locale={{ emptyText: "No hay descuentos creados aún." }}
        />
      )}

      {/* ── Bonificados manuales ── */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-[#141414]">Bonificados manuales</p>
          <button
            onClick={handleCreateBonus}
            className="flex items-center gap-1.5 text-sm font-semibold bg-[#CBE71E] text-[#141414] px-4 py-2 rounded-lg hover:bg-[#b8d11a] transition-colors"
          >
            <Plus size={14} /> Crear bonificado
          </button>
        </div>

        <div className="border border-[#E8E8E8] rounded-xl overflow-hidden">
          <Table
            columns={bonifColumns}
            dataSource={bonificados}
            rowKey="id"
            pagination={false}
            locale={{ emptyText: "No hay bonificados manuales creados aún." }}
          />
        </div>
      </div>

      {showBonusModal && (
        <NuevaAsignacionModal
          cliente={cliente}
          productos={productos}
          saving={savingBonus}
          onClose={() => setShowBonusModal(false)}
          onSave={handleSaveBonus}
        />
      )}
    </div>
  );
}
