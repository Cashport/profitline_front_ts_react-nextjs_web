"use client";

import { useMemo, useState } from "react";
import { Dropdown, Spin, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DotsThreeVertical } from "@phosphor-icons/react";
import { Plus, Trash2 } from "lucide-react";
import UiSearchInput from "@/components/ui/search-input";
import ModalAgregarPaises from "@/modules/marketAdmin/components/market-admin-user-detail/ModalAgregarPaises";
import { ICountry } from "@/types/countries/ICountries";

type Props = {
  asignadosIds: number[];
  allPaises: ICountry[];
  loading?: boolean;
  disabled?: boolean;
  error?: string | null;
  onRetry: () => void;
  onAgregar: (countryIds: number[]) => Promise<boolean>;
  onQuitar: (countryId: number) => void;
};

const headerCell = () => ({ style: { color: "#141414", fontWeight: 600 } });

export default function PaisesSection({
  asignadosIds,
  allPaises,
  loading,
  disabled,
  error,
  onRetry,
  onAgregar,
  onQuitar
}: Props) {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const asignadosMap = useMemo(
    () => new Map(allPaises.filter((p) => asignadosIds.includes(p.id)).map((p) => [p.id, p])),
    [allPaises, asignadosIds]
  );

  const filtrados = useMemo(() => {
    const q = search.trim().toLowerCase();
    const items = Array.from(asignadosMap.values());
    return q ? items.filter((p) => p.country_name.toLowerCase().includes(q)) : items;
  }, [asignadosMap, search]);

  const columns: ColumnsType<ICountry> = [
    {
      title: "País",
      dataIndex: "country_name",
      key: "country_name",
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#141414]">{v}</span>
    },
    {
      title: "",
      key: "acciones",
      width: 48,
      onHeaderCell: headerCell,
      render: (_, p) => (
        <Dropdown
          trigger={["click"]}
          placement="bottomRight"
          disabled={disabled}
          menu={{
            items: [
              {
                key: "eliminar",
                label: "Eliminar",
                icon: <Trash2 size={14} />,
                onClick: () => onQuitar(p.id)
              }
            ]
          }}
        >
          <button
            title="Acciones"
            disabled={disabled}
            className="w-8 h-8 rounded-md flex items-center justify-center bg-[#F7F7F7] text-[#141414] border border-transparent hover:border-[#141414] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-transparent"
          >
            <DotsThreeVertical size={"1.2rem"} />
          </button>
        </Dropdown>
      )
    }
  ];

  if (error) {
    return (
      <div role="alert">
        <p className="text-red-600">{error}</p>
        <button onClick={onRetry} className="mt-2 text-sm underline">
          Reintentar
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spin />
      </div>
    );
  }

  return (
    <div className="cp-fill">
      <p className="text-sm font-bold text-[#141414] mb-4">Países</p>
      <div className="flex items-center justify-between gap-4 mb-4">
        <UiSearchInput placeholder="Buscar" onChange={(e) => setSearch(e.target.value)} />
        <button
          disabled={disabled}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 text-sm font-semibold bg-[#CBE71E] text-[#141414] px-4 h-[var(--control-h)] rounded-lg hover:bg-[#b8d11a] transition-colors flex-shrink-0"
        >
          <Plus size={18} /> Agregar países
        </button>
      </div>

      <Table
        className="cp-list-scroll"
        columns={columns}
        dataSource={filtrados}
        rowKey="id"
        loading={disabled}
        pagination={false}
        locale={{
          emptyText: search.trim()
            ? "No se encontraron países con ese nombre."
            : "Este usuario aún no tiene países asignados."
        }}
      />

      {showModal && (
        <ModalAgregarPaises
          asignadosIds={asignadosIds}
          allPaises={allPaises}
          onAgregar={onAgregar}
          onClose={() => setShowModal(false)}
          disabled={disabled}
        />
      )}
    </div>
  );
}
