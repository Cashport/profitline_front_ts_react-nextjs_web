"use client";

import { useMemo, useState } from "react";
import { Select, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import useSWR from "swr";
import GenericEyeButton from "@/components/ui/generic-eye-button";
import UiSearchInput from "@/components/ui/search-input";
import ProfitLoader from "@/components/ui/profit-loader";
import { getAllDiscountPackages } from "@/services/discount/discount.service";
import { MARKET_ADMIN_DISCOUNTS_BASE } from "@/components/organisms/discounts/constants/routes";
import { useAppStore } from "@/lib/store/store";
import { DiscountPackage } from "@/types/discount/DiscountPackage";
import AccionesDropdown from "./AccionesDropdown";
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

interface DiscountPackagesTabProps {
  onCrearNuevo: () => void;
}

export default function DiscountPackagesTab({ onCrearNuevo }: DiscountPackagesTabProps) {
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState(ESTADO_FILTER_ALL);
  const [page, setPage] = useState(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const { ID } = useAppStore((state) => state.selectedProject);
  const { data: discountsData, isLoading } = useSWR(
    ID ? ["discount-packages", ID, estadoFilter] : null,
    () =>
      getAllDiscountPackages({
        projectId: ID,
        params: estadoFilter === ESTADO_FILTER_ALL ? undefined : { active: Number(estadoFilter) }
      })
  );

  const descuentos = useMemo(() => discountsData?.data ?? [], [discountsData]);

  const filtered = useMemo(
    () => descuentos.filter((d) => (d.name ?? "").toLowerCase().includes(search.toLowerCase())),
    [search, descuentos]
  );

  const activos = filtered.filter((d) => d.active === 1).length;

  const columns: ColumnsType<DiscountPackage> = [
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
      dataIndex: "discountType",
      key: "discountType",
      width: 130,
      sorter: (a, b) => a.discountType.localeCompare(b.discountType),
      onHeaderCell: headerCell,
      render: (tipo: string) => <TypePill tipo={tipo} />
    },
    {
      title: "Inicio",
      dataIndex: "startDate",
      key: "startDate",
      sorter: (a, b) => a.startDate.localeCompare(b.startDate),
      onHeaderCell: headerCell,
      render: (v: string) => <DateCell value={v} />
    },
    {
      title: "Fin",
      dataIndex: "endDate",
      key: "endDate",
      sorter: (a, b) => (a.endDate ?? "").localeCompare(b.endDate ?? ""),
      onHeaderCell: headerCell,
      render: (v: string | null) => <DateCell value={v} />
    },
    {
      title: "Reglas",
      dataIndex: "reglas",
      key: "reglas",
      width: 90,
      onHeaderCell: headerCell,
      render: () => <span className="text-sm text-[#141414]">-</span>
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
      render: (_, r) => <GenericEyeButton href={`${MARKET_ADMIN_DISCOUNTS_BASE}/paquete/${r.id}`} />
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
        <AccionesDropdown
          selectedCount={selectedRowKeys.length}
          entityLabel="bonificado(s)"
          onClearSelection={() => setSelectedRowKeys([])}
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
          locale={{ emptyText: "No se encontraron bonificados." }}
          rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
          onRow={(record) => ({
            onClick: (e) => {
              // The selection checkbox handles its own toggle — don't double-toggle
              if ((e.target as HTMLElement).closest(".ant-table-selection-column")) return;
              setSelectedRowKeys((prev) =>
                prev.includes(record.id)
                  ? prev.filter((k) => k !== record.id)
                  : [...prev, record.id]
              );
            },
            className: "cursor-pointer"
          })}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            showSizeChanger: false,
            position: ["bottomRight"],
            showTotal: (total, range) =>
              `Mostrando ${range[0]}–${range[1]} de ${total} bonificados · ${activos} activos`
          }}
          onChange={(pag, _filters, _sorter, extra) =>
            setPage(extra.action === "paginate" ? pag.current ?? 1 : 1)
          }
        />
      )}
    </>
  );
}
