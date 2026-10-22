"use client";

import { useMemo, useState } from "react";
import { Modal, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import UiSearchInput from "@/components/ui/search-input";
import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import { ICountry } from "@/types/countries/ICountries";

type Props = {
  asignadosIds: number[];
  allPaises: ICountry[];
  onAgregar: (countryIds: number[]) => Promise<boolean>;
  onClose: () => void;
  disabled?: boolean;
};

const headerCell = () => ({ style: { color: "#141414", fontWeight: 600 } });

export default function ModalAgregarPaises({
  asignadosIds,
  allPaises,
  onAgregar,
  onClose,
  disabled
}: Props) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const disponibles = useMemo(() => {
    const q = search.trim().toLowerCase();
    const items = allPaises.filter((p) => !asignadosIds.includes(p.id));
    return q ? items.filter((p) => p.country_name.toLowerCase().includes(q)) : items;
  }, [allPaises, asignadosIds, search]);

  // El filtro de búsqueda es local: solo se reconcilian las filas visibles para
  // no perder lo seleccionado antes de escribir en el buscador.
  const visibleSelectedIds = useMemo(
    () => disponibles.filter((p) => selectedIds.includes(p.id)).map((p) => p.id),
    [disponibles, selectedIds]
  );

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    const nextVisible = newSelectedRowKeys.map(Number);
    const visibleIds = new Set(disponibles.map((p) => p.id));
    setSelectedIds((prev) => [
      ...prev.filter((id) => !visibleIds.has(id)),
      ...nextVisible.filter((id) => visibleIds.has(id))
    ]);
  };

  const handleAgregar = async () => {
    const ok = await onAgregar(selectedIds);
    if (ok) onClose();
  };

  const columns: ColumnsType<ICountry> = [
    {
      title: "País",
      dataIndex: "country_name",
      key: "country_name",
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
      title={<span className="text-base font-bold text-[#141414]">Agregar países</span>}
      footer={null}
    >
      <div className="mb-4">
        <UiSearchInput
          id="modal-agregar-paises-search"
          placeholder="Buscar país..."
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
        locale={{ emptyText: "Todos los países ya están asignados." }}
        rowSelection={{
          columnWidth: 40,
          selectedRowKeys: visibleSelectedIds,
          onChange: onSelectChange
        }}
      />

      {selectedIds.length > 0 && (
        <p className="mt-3 text-sm text-[#666666]">
          {selectedIds.length === 1
            ? "1 país seleccionado"
            : `${selectedIds.length} países seleccionados`}
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
