"use client";

import { useMemo, useState } from "react";
import { Select, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import useSWR from "swr";
import GenericEyeButton from "@/components/ui/generic-eye-button";
import UiSearchInput from "@/components/ui/search-input";
import ProfitLoader from "@/components/ui/profit-loader";
import ApprovalStatusPill from "@/components/ui/approval-status-pill";
import { getApprovalEntityStatusLabel } from "@/constants/approvalEntityStatus";
import { getAdminPromotions } from "@/services/marketAdmin/marketAdmin";
import { MARKET_ADMIN_DISCOUNTS_BASE } from "@/components/organisms/discounts/constants/routes";
import { useAppStore } from "@/lib/store/store";
import { IPromotionListItem } from "@/types/marketAdmin/IMarketAdmin";
import DiscountsToolbar from "./DiscountsToolbar";
import {
  DateCell,
  ESTADO_FILTER_ALL,
  ESTADO_FILTER_OPTIONS,
  ESTADO_SELECT_CLASSNAME,
  PAGE_SIZE,
  StatusPill,
  TextCell,
  TypePill,
  headerCell
} from "./discountsTableConfig";
import { PROMOTION_TYPE_LABELS } from "./promotionLabels";

interface BonificadosTabProps {
  onCrearNuevo: () => void;
}

export default function BonificadosTab({ onCrearNuevo }: BonificadosTabProps) {
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState(ESTADO_FILTER_ALL);
  const [page, setPage] = useState(1);

  const { ID } = useAppStore((state) => state.selectedProject);
  const { data, isLoading } = useSWR(ID ? ["admin-promotions", ID, estadoFilter] : null, () =>
    getAdminPromotions(
      estadoFilter === ESTADO_FILTER_ALL ? undefined : { active: Number(estadoFilter) }
    )
  );

  const promotions = useMemo(() => data ?? [], [data]);

  const filtered = useMemo(
    () => promotions.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [search, promotions]
  );

  const activas = filtered.filter((p) => p.active === 1).length;

  const columns: ColumnsType<IPromotionListItem> = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      onHeaderCell: headerCell,
      render: (v: string) => <TextCell value={v} />
    },
    {
      title: "Tipo",
      dataIndex: "type",
      key: "type",
      width: 160,
      sorter: (a, b) => a.type.localeCompare(b.type),
      onHeaderCell: headerCell,
      render: (type: IPromotionListItem["type"]) => <TypePill tipo={PROMOTION_TYPE_LABELS[type]} />
    },
    {
      title: "Niveles",
      dataIndex: "ranges_count",
      key: "ranges_count",
      width: 100,
      align: "right",
      sorter: (a, b) => a.ranges_count - b.ranges_count,
      onHeaderCell: headerCell,
      render: (v: number) => <span className="text-sm text-[#141414]">{v}</span>
    },
    {
      title: "Unidad de negocio",
      dataIndex: "business_unit",
      key: "business_unit",
      sorter: (a, b) => (a.business_unit ?? "").localeCompare(b.business_unit ?? ""),
      onHeaderCell: headerCell,
      render: (v: string | null) => <TextCell value={v ?? "Todas"} />
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
      title: "Aprobación",
      dataIndex: "approval_entity_status_id",
      key: "approval_entity_status_id",
      width: 140,
      sorter: (a, b) =>
        getApprovalEntityStatusLabel(a.approval_entity_status_id).localeCompare(
          getApprovalEntityStatusLabel(b.approval_entity_status_id)
        ),
      onHeaderCell: headerCell,
      render: (statusId: number | null) => <ApprovalStatusPill statusId={statusId} />
    },
    {
      title: "Estado",
      dataIndex: "active",
      key: "active",
      width: 110,
      sorter: (a, b) => a.active - b.active,
      onHeaderCell: headerCell,
      render: (active: number) => <StatusPill active={active} />
    },
    {
      title: "",
      key: "ver",
      width: 48,
      onHeaderCell: headerCell,
      render: (_, p) => <GenericEyeButton href={`${MARKET_ADMIN_DISCOUNTS_BASE}/${p.id}`} />
    }
  ];

  return (
    <>
      <DiscountsToolbar onCrearNuevo={onCrearNuevo}>
        <UiSearchInput
          placeholder="Buscar..."
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <Select
          value={estadoFilter}
          onChange={(value) => {
            setEstadoFilter(value);
            setPage(1);
          }}
          options={ESTADO_FILTER_OPTIONS}
          placeholder="Estado"
          style={{ minWidth: 140 }}
          className={ESTADO_SELECT_CLASSNAME}
        />
      </DiscountsToolbar>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <ProfitLoader />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          showSorterTooltip={false}
          locale={{ emptyText: "No hay promociones para mostrar." }}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            showSizeChanger: false,
            position: ["bottomRight"],
            showTotal: (total, range) =>
              `Mostrando ${range[0]}–${range[1]} de ${total} promociones · ${activas} activas`
          }}
          onChange={(pag, _filters, _sorter, extra) =>
            setPage(extra.action === "paginate" ? pag.current ?? 1 : 1)
          }
        />
      )}
    </>
  );
}
