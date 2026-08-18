"use client";

import { useMemo, useState } from "react";
import { Modal, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Plus } from "lucide-react";
import UiSearchInput from "@/components/ui/search-input";
import {
  GRUPOS_MOCK,
  TIPO_GRUPO_STYLES,
  type GrupoCliente
} from "@/modules/marketAdmin/mocks/userGroups";

type Props = {
  asignadosIds: string[];
  onAgregar: (grupoId: string) => void;
  onClose: () => void;
};

const headerCell = () => ({ style: { color: "#141414", fontWeight: 600 } });

export default function ModalAgregarGrupos({ asignadosIds, onAgregar, onClose }: Props) {
  const [search, setSearch] = useState("");

  const disponibles = useMemo(() => {
    const q = search.trim().toLowerCase();
    return GRUPOS_MOCK.filter(
      (g) => !asignadosIds.includes(g.id) && g.nombre.toLowerCase().includes(q)
    );
  }, [asignadosIds, search]);

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
      title: "",
      key: "agregar",
      width: 48,
      onHeaderCell: headerCell,
      render: (_, g) => (
        <button
          title="Agregar grupo"
          onClick={() => onAgregar(g.id)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#CCCCCC] hover:bg-[#E6F9E6] hover:text-[#1A7A1A] transition-colors"
        >
          <Plus size={13} />
        </button>
      )
    }
  ];

  return (
    <Modal
      open
      onCancel={onClose}
      centered
      width={704}
      title={<span className="text-base font-bold text-[#141414]">Agregar grupo de clientes</span>}
      footer={null}
    >
      <div className="mb-4">
        <UiSearchInput placeholder="Buscar grupo..." onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Table
        columns={columns}
        dataSource={disponibles}
        rowKey="id"
        pagination={false}
        scroll={{ y: 320 }}
        locale={{ emptyText: "Todos los grupos ya están asignados." }}
      />
    </Modal>
  );
}
