"use client";

import { Button, Popover, Table, TableProps, Tag, Tooltip } from "antd";
import { Info } from "lucide-react";
import { Eye } from "@phosphor-icons/react";
import "./BalancesTable.scss";
import useScreenHeight from "@/components/hooks/useScreenHeight";
import useScreenWidth from "@/components/hooks/useScreenWidth";

import type { EstadoSaldo, SaldoData } from "../../context/saldos-context";

interface BalancesTableProps {
  data: SaldoData[];
  selectedSaldoIds: string[];
  onToggleSelection: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onClearSelection: () => void;
  onOpenDetail: (saldo: SaldoData) => void;
}

const estadoConfig: Record<string, { color: string; textColor: string }> = {
  "Pendiente NC": { color: "#FF9800", textColor: "#000" },
  Pendiente: { color: "#FFC107", textColor: "#000" },
  "En revisión": { color: "#2196F3", textColor: "#fff" },
  Aprobado: { color: "#4CAF50", textColor: "#fff" },
  Aplicado: { color: "#2E7D32", textColor: "#fff" },
  Rechazado: { color: "#E53935", textColor: "#fff" },
  "Aplicado parcial": { color: "#9C27B0", textColor: "#fff" }
};

const tipoConfig: Record<string, { label: string }> = {
  Devolución: { label: "Devolución" },
  "Acuerdo comercial": { label: "Acuerdo comercial" }
};

const getEstadoOrder = (estado: EstadoSaldo): number => {
  const order: Record<string, number> = {
    "Pendiente NC": 0,
    Pendiente: 1,
    "En revisión": 2,
    Aprobado: 3,
    "Aplicado parcial": 4,
    Aplicado: 5,
    Rechazado: 6
  };
  return order[estado] ?? 999;
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0
  }).format(amount);

const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const calcularDiasSaldo = (fechaEmision: string): number => {
  const fecha = new Date(fechaEmision);
  const hoy = new Date();
  const diffTime = Math.abs(hoy.getTime() - fecha.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const formatDiasSaldo = (fechaEmision: string): string => {
  const dias = calcularDiasSaldo(fechaEmision);
  if (dias >= 30) {
    const meses = Math.floor(dias / 30);
    return meses === 1 ? "1 mes" : `${meses} meses`;
  }
  return dias === 1 ? "1 día" : `${dias} días`;
};

const getCarteraColor = (estadoCartera: string): string => {
  switch (estadoCartera) {
    case "Al día":
      return "#22c55e";
    case "Preventiva":
      return "#eab308";
    case "Alerta incumplimiento":
      return "#f97316";
    case "Alerta bloqueo":
      return "#ef4444";
    case "Crítica":
      return "#171717";
    default:
      return "#9ca3af";
  }
};

export function BalancesTable({
  data,
  selectedSaldoIds,
  onToggleSelection,
  onSelectAll,
  onClearSelection,
  onOpenDetail
}: BalancesTableProps) {
  const height = useScreenHeight();
  const width = useScreenWidth();
  const columns: TableProps<SaldoData>["columns"] = [
    {
      title: "Id",
      dataIndex: "autoId",
      key: "autoId",
      sorter: (a, b) => a.autoId - b.autoId,
      showSorterTooltip: false,
      render: (value: number) => <span className="text-sm text-cashport-black">{value}</span>
    },
    {
      title: "Fecha saldo",
      dataIndex: "fechaEmision",
      key: "fecha",
      sorter: (a, b) => new Date(a.fechaEmision).getTime() - new Date(b.fechaEmision).getTime(),
      showSorterTooltip: false,
      render: (value: string) => (
        <span className="text-sm text-cashport-black">{formatDate(value)}</span>
      )
    },
    {
      title: "Días",
      dataIndex: "fechaEmision",
      key: "diasSaldo",
      sorter: (a, b) => calcularDiasSaldo(a.fechaEmision) - calcularDiasSaldo(b.fechaEmision),
      showSorterTooltip: false,
      render: (value: string) => (
        <span className="text-sm text-cashport-black">{formatDiasSaldo(value)}</span>
      )
    },
    {
      title: "Cliente",
      dataIndex: "cliente",
      key: "cliente",
      sorter: (a, b) => a.cliente.localeCompare(b.cliente),
      showSorterTooltip: false,
      render: (_: string, record: SaldoData) => {
        const popoverContent = (
          <div style={{ width: 260 }}>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: getCarteraColor(record.estadoCartera) }}
              />
              <span className="text-sm font-bold text-cashport-black">{record.estadoCartera}</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-gray-500">Cartera</span>
                <span className="text-sm font-bold text-cashport-black">
                  {formatCurrency(record.carteraTotal)}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-gray-500">Vencida</span>
                <span className="text-sm font-bold text-cashport-black">
                  {record.carteraVencidaPct}%
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-gray-500">Acuerdo de pago</span>
                {record.acuerdoPago ? (
                  <div className="text-right">
                    <span className="text-sm font-bold text-cashport-black">
                      {formatCurrency(record.acuerdoPago.monto || 0)}
                    </span>
                    {record.acuerdoPago.fecha && (
                      <p
                        className={`text-xs ${record.acuerdoPago.vencido ? "text-orange-500" : "text-gray-400"}`}
                      >
                        {formatDate(record.acuerdoPago.fecha)}
                        {record.acuerdoPago.vencido ? " Vencido" : ""}
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="text-sm font-bold text-cashport-black">Sin acuerdo</span>
                )}
              </div>
            </div>
          </div>
        );

        return (
          <div className="flex items-center gap-2" style={{ maxWidth: 260 }}>
            <Popover content={popoverContent} trigger="click" placement="bottomLeft">
              <button type="button" className="shrink-0">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: getCarteraColor(record.estadoCartera) }}
                />
              </button>
            </Popover>
            <span className="text-sm text-cashport-black truncate" title={record.cliente}>
              {record.cliente}
            </span>
          </div>
        );
      }
    },
    {
      title: "KAM",
      dataIndex: "kam",
      key: "kam",
      sorter: (a, b) => a.kam.localeCompare(b.kam),
      showSorterTooltip: false,
      render: (value: string) => <span className="text-sm text-cashport-black">{value}</span>
    },
    {
      title: "Tipo",
      dataIndex: "tipoNotaCredito",
      key: "tipo",
      sorter: (a, b) => a.tipoNotaCredito.localeCompare(b.tipoNotaCredito),
      showSorterTooltip: false,
      render: (value: string, record: SaldoData) => (
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-cashport-black">{tipoConfig[value]?.label ?? value}</span>
          {record.motivo && (
            <Tooltip title={record.motivo} placement="bottom">
              <button
                type="button"
                className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
          )}
        </div>
      )
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      width: 140,
      defaultSortOrder: "ascend",
      sorter: (a, b) => getEstadoOrder(a.estado) - getEstadoOrder(b.estado),
      showSorterTooltip: false,
      render: (value: string) => {
        const cfg = estadoConfig[value] ?? { color: "#9ca3af", textColor: "#000" };
        return (
          <Tag
            color={cfg.color}
            style={{ color: cfg.textColor, border: "none", fontWeight: 500, whiteSpace: "nowrap" }}
          >
            {value}
          </Tag>
        );
      }
    },
    {
      title: "Saldo inicial",
      dataIndex: "montoOriginal",
      key: "montoOriginal",
      align: "right",
      sorter: (a, b) => a.montoOriginal - b.montoOriginal,
      showSorterTooltip: false,
      render: (value: number) => (
        <span className="text-sm text-cashport-black font-medium fontMonoSpace">
          {formatCurrency(value)}
        </span>
      )
    },
    {
      title: "Pendiente",
      dataIndex: "montoDisponible",
      key: "montoDisponible",
      align: "right",
      sorter: (a, b) => a.montoDisponible - b.montoDisponible,
      showSorterTooltip: false,
      render: (value: number) => (
        <span className="text-sm font-bold text-cashport-black fontMonoSpace">
          {formatCurrency(value)}
        </span>
      )
    },
    {
      title: "",
      key: "acciones",
      width: 48,
      render: (_: unknown, record: SaldoData) => (
        <Button
          onClick={() => onOpenDetail(record)}
          className="buttonSeeProject"
          icon={<Eye size={"1.3rem"} />}
        />
      )
    }
  ];

  const rowSelection: TableProps<SaldoData>["rowSelection"] = {
    selectedRowKeys: selectedSaldoIds,
    onSelect: (record) => {
      onToggleSelection(record.id);
    },
    onSelectAll: (selected, selectedRows) => {
      if (selected) {
        onSelectAll(selectedRows.map((r) => r.id));
      } else {
        onClearSelection();
      }
    }
  };

  return (
    <Table<SaldoData>
      columns={columns}
      dataSource={data.map((s) => ({ ...s, key: s.id }))}
      rowSelection={rowSelection}
      pagination={{ pageSize: 10, showSizeChanger: false, position: ["bottomRight"] }}
      scroll={{ y: width > 1280 ? height - 345 : height - 370, x: undefined }}
      rowClassName={(record) =>
        selectedSaldoIds.includes(record.id) ? "ant-table-row-selected" : ""
      }
      size="small"
    />
  );
}
