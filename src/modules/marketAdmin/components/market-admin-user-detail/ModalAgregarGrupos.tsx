"use client";

import { useMemo, useState } from "react";
import { Modal, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import UiSearchInput from "@/components/ui/search-input";
import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";

type GrupoItem = { id: number; group_name: string };

type Props = {
  asignadosIds: number[];
  allGrupos: GrupoItem[];
  onAgregar: (grupoIds: number[]) => Promise<boolean>;
  onClose: () => void;
  disabled?: boolean;
};

const headerCell = () => ({ style: { color: "#141414", fontWeight: 600 } });

export default function ModalAgregarGrupos({
  asignadosIds,
  allGrupos,
  onAgregar,
  onClose,
  disabled
}: Props) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const disponibles = useMemo(() => {
    const q = search.trim().toLowerCase();
    const items = allGrupos.filter((g) => !asignadosIds.includes(g.id));
    return q ? items.filter((g) => g.group_name.toLowerCase().includes(q)) : items;
  }, [allGrupos, asignadosIds, search]);

  // El filtro de búsqueda es local: solo se reconcilian las filas visibles para
  // no perder lo seleccionado antes de escribir en el buscador.
  const visibleSelectedIds = useMemo(
    () => disponibles.filter((g) => selectedIds.includes(g.id)).map((g) => g.id),
    [disponibles, selectedIds]
  );

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    const nextVisible = newSelectedRowKeys.map(Number);
    const visibleIds = new Set(disponibles.map((g) => g.id));
    setSelectedIds((prev) => [
      ...prev.filter((id) => !visibleIds.has(id)),
      ...nextVisible.filter((id) => visibleIds.has(id))
    ]);
  };

  const handleAgregar = async () => {
    const ok = await onAgregar(selectedIds);
    if (ok) onClose();
  };

  const columns: ColumnsType<GrupoItem> = [
    {
      title: "Grupo",
      dataIndex: "group_name",
      key: "group_name",
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#141414]">{v}</span>
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
        <UiSearchInput
          id="modal-agregar-grupos-search"
          placeholder="Buscar grupo..."
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Table
        columns={columns}
        dataSource={disponibles}
        rowKey="id"
        loading={disabled}
        pagination={false}
        scroll={{ y: 320 }}
        locale={{ emptyText: "Todos los grupos ya están asignados." }}
        rowSelection={{
          columnWidth: 40,
          selectedRowKeys: visibleSelectedIds,
          onChange: onSelectChange
        }}
      />

      {selectedIds.length > 0 && (
        <p className="mt-3 text-sm text-[#666666]">
          {selectedIds.length === 1
            ? "1 grupo seleccionado"
            : `${selectedIds.length} grupos seleccionados`}
        </p>
      )}

      <div className="mt-6">
        <FooterButtons
          titleCancel="Cancelar"
          titleConfirm="Agregar seleccionados"
          onClose={onClose}
          handleOk={handleAgregar}
          isConfirmDisabled={selectedIds.length === 0}
          isConfirmLoading={disabled}
        />
      </div>
    </Modal>
  );
}
