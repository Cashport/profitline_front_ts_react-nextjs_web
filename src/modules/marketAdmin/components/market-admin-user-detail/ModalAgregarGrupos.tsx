"use client";

import { useMemo, useState } from "react";
import { Modal, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Plus } from "lucide-react";
import UiSearchInput from "@/components/ui/search-input";

type GrupoItem = { id: number; group_name: string };

type Props = {
  asignadosIds: number[];
  allGrupos: GrupoItem[];
  onAgregar: (grupoId: number) => void;
  onClose: () => void;
};

const headerCell = () => ({ style: { color: "#141414", fontWeight: 600 } });

export default function ModalAgregarGrupos({ asignadosIds, allGrupos, onAgregar, onClose }: Props) {
  const [search, setSearch] = useState("");

  const disponibles = useMemo(() => {
    const q = search.trim().toLowerCase();
    const items = allGrupos.filter((g) => !asignadosIds.includes(g.id));
    return q ? items.filter((g) => g.group_name.toLowerCase().includes(q)) : items;
  }, [allGrupos, asignadosIds, search]);

  const columns: ColumnsType<GrupoItem> = [
    {
      title: "Grupo",
      dataIndex: "group_name",
      key: "group_name",
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#141414]">{v}</span>
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
