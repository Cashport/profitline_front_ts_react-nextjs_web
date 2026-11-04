"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Pagination, Table, TableProps, Tooltip } from "antd";
import dayjs from "dayjs";
import { useTranslations } from "use-intl";

import { Badge } from "@/modules/chat/ui/badge";
import { Button } from "@/modules/chat/ui/button";
import { IAlert } from "@/types/dataQuality/IDataQuality";

interface AlertsTableProps {
  alerts: IAlert[];
  isLoading: boolean;
  pagination: {
    current: number;
    total: number;
    pageSize: number;
  };
  onPageChange: (page: number) => void;
}

const NO_EQUIVALENCE_ERROR_TYPE = "SIN_EQUIVALENCIA";
const VENTAS_ANOMALAS_ERROR_TYPE = "VENTAS_ANOMALAS";

const getAlertActionHref = (record: IAlert) =>
  record.error_type === NO_EQUIVALENCE_ERROR_TYPE
    ? `/data-quality/catalogs/${record.id_client}/${record.id_country}?clientName=${encodeURIComponent(
        record.client_name
      )}&countryName=${encodeURIComponent(record.country_name)}`
    : `/data-quality/client/${record.id_client}`;

type AlertsT = ReturnType<typeof useTranslations<"dataQuality.alerts.table">>;

const getColumns = (t: AlertsT): TableProps<IAlert>["columns"] => [
  {
    title: t("customer"),
    dataIndex: "client_name",
    render: (text: string) => (
      <span className="font-medium" style={{ color: "#141414" }}>
        {text}
      </span>
    )
  },
  {
    title: t("country"),
    dataIndex: "country_name",
    render: (text: string) => (
      <Badge variant="outline" className="text-[13px]">
        {text}
      </Badge>
    )
  },

  {
    title: t("issue"),
    dataIndex: "error_message",
    ellipsis: true,
    onCell: () => ({
      style: { maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }
    }),
    render: (text: string) => (
      <Tooltip title={text} placement="topLeft">
        <span style={{ color: "#141414" }}>{text}</span>
      </Tooltip>
    )
  },
  {
    title: t("frequency"),
    dataIndex: "periodicity",
    render: (periodicity: IAlert["periodicity"]) =>
      periodicity?.length ? (
        <div className="flex flex-wrap gap-1">
          {periodicity.map((item) => (
            <Badge key={item} variant="outline" className="text-[13px]">
              {item}
            </Badge>
          ))}
        </div>
      ) : (
        "-"
      )
  },
  {
    title: t("type"),
    dataIndex: "error_type"
  },
  {
    title: t("issueDate"),
    dataIndex: "created_at",
    width: 140,
    render: (text: string) => (
      <div className="text-sm" style={{ color: "#141414" }}>
        {dayjs(text).format("DD-MM-YY HH:mm")}
      </div>
    )
  },
  {
    title: t("priority"),
    width: 90,
    render: (_: string, record: IAlert) =>
      record.error_type === VENTAS_ANOMALAS_ERROR_TYPE ? `${record.error_level}%` : "-"
  },
  {
    title: t("status"),
    dataIndex: "status_description",
    width: 120,
    render: (_: string, record: IAlert) => (
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: record.status_color }} />
        <span className="text-sm">{record.status_description}</span>
      </div>
    )
  },
  {
    title: t("actions"),
    width: 90,
    render: (_, record: IAlert) => {
      const isCatalog = record.error_type === NO_EQUIVALENCE_ERROR_TYPE;
      return (
        <div className="flex items-center space-x-2">
          <Link href={getAlertActionHref(record)}>
            <Button
              variant="outline"
              size="sm"
              className="text-[13px] bg-transparent"
              title={isCatalog ? t("goToCatalog") : t("goToCustomer")}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              {t("go")}
            </Button>
          </Link>
        </div>
      );
    }
  }
];

export function AlertsTable({ alerts, isLoading, pagination, onPageChange }: AlertsTableProps) {
  const t = useTranslations("dataQuality.alerts.table");
  const columns = useMemo(() => getColumns(t), [t]);
  return (
    <>
      <Table<IAlert>
        columns={columns}
        dataSource={alerts}
        rowKey="id"
        pagination={false}
        loading={isLoading}
        showSorterTooltip={false}
        size="small"
        tableLayout="auto"
        scroll={{
          x: 100
        }}
      />

      <div className="mt-4 p-4 border-t flex items-center justify-between">
        <Pagination
          current={pagination.current}
          onChange={onPageChange}
          total={pagination.total}
          pageSize={pagination.pageSize}
          showSizeChanger={false}
        />
        <span className="text-sm" style={{ color: "#141414" }}>
          {t("showing", { count: alerts.length, total: pagination.total })}
        </span>
      </div>
    </>
  );
}
