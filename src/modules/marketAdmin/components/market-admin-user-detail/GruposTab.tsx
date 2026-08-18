"use client";

import { useMemo, useState } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Minus, Plus } from "lucide-react";
import UiSearchInput from "@/components/ui/search-input";
import ModalAgregarGrupos from "@/modules/marketAdmin/components/market-admin-user-detail/ModalAgregarGrupos";
import {
  GRUPOS_MOCK,
  TIPO_GRUPO_STYLES,
  type GrupoCliente
} from "@/modules/marketAdmin/mocks/userGroups";

type Props = {
  gruposIds: string[];
  onAgregar: (grupoId: string) => void;
  onQuitar: (grupoId: string) => void;
};

const headerCell = () => ({ style: { color: "#141414", fontWeight: 600 } });

export default function GruposTab({ gruposIds, onAgregar, onQuitar }: Props) {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const filtrados = useMemo(() => {
    const q = search.trim().toLowerCase();
    return GRUPOS_MOCK.filter(
      (g) => gruposIds.includes(g.id) && g.nombre.toLowerCase().includes(q)
    );
  }, [gruposIds, search]);

  const columns: ColumnsType<GrupoCliente> = [
    {
      title: "Grupo",
      dataIndex: "nombre",
      key: "nombre",
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#141414]">{v}</span>
    },
    {
      title: "Tipo",
      dataIndex: "tipo",
      key: "tipo",
      width: 140,
      onHeaderCell: headerCell,
      render: (v: string) => (
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            TIPO_GRUPO_STYLES[v] ?? "bg-[#F5F5F5] text-[#666666]"
          }`}
        >
          {v}
        </span>
      )
    },
    {
      title: "Clientes",
      dataIndex: "clientes",
      key: "clientes",
      width: 100,
      onHeaderCell: headerCell,
      render: (v: number) => <span className="text-sm text-[#141414]">{v}</span>
    },
    {
      title: "Estado",
      dataIndex: "activo",
      key: "activo",
      width: 120,
      onHeaderCell: headerCell,
      render: (activo: boolean) => (
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            activo ? "bg-[#E6F9E6] text-[#1A7A1A]" : "bg-[#EEEEEE] text-[#999999]"
          }`}
        >
          {activo ? "Activo" : "Inactivo"}
        </span>
      )
    },
    {
      title: "",
      key: "quitar",
      width: 48,
      onHeaderCell: headerCell,
      render: (_, g) => (
        <button
          title="Quitar grupo"
          onClick={() => onQuitar(g.id)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#CCCCCC] hover:bg-[#FEE2E2] hover:text-[#E53E3E] transition-colors"
        >
          <Minus size={13} />
        </button>
      )
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-4">
        <UiSearchInput placeholder="Buscar" onChange={(e) => setSearch(e.target.value)} />
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 text-sm font-semibold bg-[#CBE71E] text-[#141414] px-4 py-2 rounded-lg hover:bg-[#b8d11a] transition-colors flex-shrink-0"
        >
          <Plus size={14} /> Agregar grupo de clientes
        </button>
      </div>

      <Table
        columns={columns}
        dataSource={filtrados}
        rowKey="id"
        pagination={false}
        locale={{
          emptyText: search.trim()
            ? "No se encontraron grupos con ese nombre."
            : "Este usuario aún no tiene grupos de clientes asignados."
        }}
      />

      {showModal && (
        <ModalAgregarGrupos
          asignadosIds={gruposIds}
          onAgregar={onAgregar}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
