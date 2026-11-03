"use client";

import { useMemo, useState } from "react";
import { Dropdown, Spin, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DotsThreeVertical } from "@phosphor-icons/react";
import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "use-intl";
import UiSearchInput from "@/components/ui/search-input";
import ModalAgregarGrupos from "@/modules/marketAdmin/components/market-admin-user-detail/ModalAgregarGrupos";

type GrupoItem = { id: number; group_name: string };

type Props = {
  asignadosIds: number[];
  allGrupos: GrupoItem[];
  loading?: boolean;
  disabled?: boolean;
  onAgregar: (grupoIds: number[]) => Promise<boolean>;
  onQuitar: (grupoId: number) => void;
};

const headerCell = () => ({ style: { color: "#141414", fontWeight: 600 } });

export default function GruposTab({
  asignadosIds,
  allGrupos,
  loading,
  disabled,
  onAgregar,
  onQuitar
}: Props) {
  const t = useTranslations("marketAdmin.userDetail.groupsTab");
  const tCommon = useTranslations("common");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const asignadosMap = useMemo(
    () => new Map(allGrupos.filter((g) => asignadosIds.includes(g.id)).map((g) => [g.id, g])),
    [allGrupos, asignadosIds]
  );

  const filtrados = useMemo(() => {
    const q = search.trim().toLowerCase();
    const items = Array.from(asignadosMap.values());
    return q ? items.filter((g) => g.group_name.toLowerCase().includes(q)) : items;
  }, [asignadosMap, search]);

  const columns: ColumnsType<GrupoItem> = [
    {
      title: t("group"),
      dataIndex: "group_name",
      key: "group_name",
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#141414]">{v}</span>
    },
    {
      title: "",
      key: "acciones",
      width: 48,
      onHeaderCell: headerCell,
      render: (_, g) => (
        <Dropdown
          trigger={["click"]}
          placement="bottomRight"
          disabled={disabled}
          menu={{
            items: [
              {
                key: "eliminar",
                label: tCommon("actions.delete"),
                icon: <Trash2 size={14} />,
                onClick: () => onQuitar(g.id)
              }
            ]
          }}
        >
          <button
            title={tCommon("fields.actions")}
            aria-label={tCommon("fields.actions")}
            disabled={disabled}
            className="w-8 h-8 rounded-md flex items-center justify-center bg-[#F7F7F7] text-[#141414] border border-transparent hover:border-[#141414] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-transparent"
          >
            <DotsThreeVertical size={"1.2rem"} />
          </button>
        </Dropdown>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spin />
      </div>
    );
  }

  return (
    <div className="cp-fill">
      <div className="flex items-center justify-between gap-4 mb-4">
        <UiSearchInput
          placeholder={tCommon("placeholders.search")}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 text-sm font-semibold bg-[#CBE71E] text-[#141414] px-4 h-[var(--control-h)] rounded-lg hover:bg-[#b8d11a] transition-colors flex-shrink-0"
        >
          <Plus size={18} /> {t("add")}
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
          emptyText: search.trim() ? t("noSearchResults") : t("empty")
        }}
      />

      {showModal && (
        <ModalAgregarGrupos
          asignadosIds={asignadosIds}
          allGrupos={allGrupos}
          onAgregar={onAgregar}
          onClose={() => setShowModal(false)}
          disabled={disabled}
        />
      )}
    </div>
  );
}
