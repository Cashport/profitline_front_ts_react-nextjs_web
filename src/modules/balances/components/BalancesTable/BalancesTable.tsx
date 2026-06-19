"use client";

import { useState } from "react";
import { Button, Flex, message, Table, TableProps } from "antd";
import { Eye } from "@phosphor-icons/react";
import "./BalancesTable.scss";
import useScreenWidth from "@/components/hooks/useScreenWidth";
import { IBalanceRow } from "@/types/financialDiscounts/IFinancialDiscounts";
import { sendToOtherBalances } from "@/services/balances/balances";
import { useMessageApi } from "@/context/MessageContext";
import { BalanceRowActions, BalanceTableContext } from "../BalanceRowActions/BalanceRowActions";
import { ModalUploadBalanceFile } from "../ModalUploadBalanceFile/ModalUploadBalanceFile";
import { ModalSendBalanceToApproval } from "../ModalSendBalanceToApproval/ModalSendBalanceToApproval";
import {
  BalanceDecisionAction,
  ModalApproveRejectBalance
} from "../ModalApproveRejectBalance/ModalApproveRejectBalance";

interface BalancesTableProps {
  data: IBalanceRow[];
  loading?: boolean;
  context?: BalanceTableContext;
  selectedSaldoIds: string[];
  onToggleSelection: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onDeselectAll: (ids: string[]) => void;
  onOpenDetail: (balance: IBalanceRow) => void;
  onUploaded?: () => void;
}

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

export function BalancesTable({
  data,
  loading,
  context = "balances",
  selectedSaldoIds,
  onToggleSelection,
  onSelectAll,
  onDeselectAll,
  onOpenDetail,
  onUploaded
}: BalancesTableProps) {
  const width = useScreenWidth();
  const { showMessage } = useMessageApi();

  const [activeRecord, setActiveRecord] = useState<IBalanceRow | null>(null);
  const [openModal, setOpenModal] = useState<"upload" | "approval" | "decision" | null>(null);
  const [decisionAction, setDecisionAction] = useState<BalanceDecisionAction>("approve");

  const closeModal = () => setOpenModal(null);

  const colWidth = (px: number) => (width > 1400 ? px : undefined);

  const handleCargarSoporte = (record: IBalanceRow) => {
    setActiveRecord(record);
    setOpenModal("upload");
  };

  const handleEnviarAprobacion = (record: IBalanceRow) => {
    setActiveRecord(record);
    setOpenModal("approval");
  };

  const handleSendOtherBalances = async (record: IBalanceRow) => {
    const hideLoading = message.loading("Enviando a otros saldos...", 0);
    try {
      await sendToOtherBalances(record.id);
      showMessage("success", "Saldo enviado a otros saldos correctamente");
      onUploaded?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Ocurrió un error al enviar a otros saldos";
      showMessage("error", errorMessage);
    } finally {
      hideLoading();
    }
  };

  const handleDecision = (record: IBalanceRow, action: BalanceDecisionAction) => {
    setActiveRecord(record);
    setDecisionAction(action);
    setOpenModal("decision");
  };

  const columns: TableProps<IBalanceRow>["columns"] = [
    {
      title: "Id",
      dataIndex: "id",
      key: "id",
      width: colWidth(120),
      sorter: (a, b) => a.id - b.id,
      showSorterTooltip: false,
      render: (value: number) => <span className="text-sm text-cashport-black">{value}</span>
    },
    {
      title: "Fecha saldo",
      dataIndex: "created_at",
      key: "fecha",
      fixed: "left",
      width: colWidth(120),
      sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      showSorterTooltip: false,
      render: (value: string) => (
        <span className="text-sm text-cashport-black">{formatDate(value)}</span>
      )
    },
    {
      title: "Días",
      key: "diasSaldo",
      width: 50,
      showSorterTooltip: false,
      render: () => <span className="text-sm text-cashport-black" />
    },
    ...(context === "balances"
      ? [
          {
            title: "Cliente",
            dataIndex: "client_name",
            key: "cliente",
            sorter: (a: IBalanceRow, b: IBalanceRow) =>
              (a.client_name ?? "").localeCompare(b.client_name ?? ""),
            showSorterTooltip: false,
            render: (value: string) => (
              <div className="flex items-center gap-2" style={{ maxWidth: 260 }}>
                <span className="text-sm text-cashport-black truncate" title={value}>
                  {value}
                </span>
              </div>
            )
          }
        ]
      : []),
    {
      title: "Tipo",
      dataIndex: "motive_name",
      key: "tipo",
      width: colWidth(195),
      sorter: (a, b) => (a.motive_name ?? "").localeCompare(b.motive_name ?? ""),
      showSorterTooltip: false,
      render: (value: string) => <span className="text-sm text-cashport-black">{value ?? "-"}</span>
    },
    {
      title: "Descripción",
      key: "descripcion",
      dataIndex: "COMMENTS",
      showSorterTooltip: false,
      render: (_: unknown, record: IBalanceRow) => (
        <span className="text-sm text-cashport-black">
          {record.COMMENTS ?? record.comments ?? "-"}
        </span>
      )
    },
    {
      title: "Saldo inicial",
      dataIndex: "initial_amount",
      key: "initial_amount",
      width: colWidth(200),
      align: "right",
      sorter: (a, b) => a.initial_amount - b.initial_amount,
      showSorterTooltip: false,
      render: (value: number) => (
        <span className="text-sm text-cashport-black font-medium fontMonoSpace">
          {formatCurrency(value)}
        </span>
      )
    },
    {
      title: "Pendiente",
      dataIndex: "pending_amount",
      key: "pending_amount",
      width: colWidth(200),
      align: "right",
      sorter: (a, b) => a.pending_amount - b.pending_amount,
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
      width: 88,
      render: (_: unknown, record: IBalanceRow) => (
        <Flex gap={4} align="center">
          <BalanceRowActions
            record={record}
            context={context}
            onCargarSoporte={handleCargarSoporte}
            onEnviarAprobacion={handleEnviarAprobacion}
            onSendOtherBalances={handleSendOtherBalances}
            onDecision={handleDecision}
          />
          <Button
            onClick={() => onOpenDetail(record)}
            className="buttonSeeProject"
            icon={<Eye size={"1.3rem"} />}
          />
        </Flex>
      )
    }
  ];

  const groupIds = data.map((s) => String(s.id));

  const rowSelection: TableProps<IBalanceRow>["rowSelection"] = {
    selectedRowKeys: selectedSaldoIds,
    onSelect: (record) => {
      onToggleSelection(String(record.id));
    },
    onSelectAll: (selected) => {
      if (selected) {
        onSelectAll(groupIds);
      } else {
        onDeselectAll(groupIds);
      }
    }
  };

  return (
    <>
      <Table<IBalanceRow>
        columns={columns}
        dataSource={data.map((s) => ({ ...s, key: String(s.id) }))}
        loading={loading}
        rowSelection={rowSelection}
        pagination={{ pageSize: 10, showSizeChanger: false, position: ["bottomRight"] }}
        rowClassName={(record) =>
          selectedSaldoIds.includes(String(record.id)) ? "ant-table-row-selected" : ""
        }
        size="small"
      />

      {activeRecord && (
        <>
          <ModalUploadBalanceFile
            isOpen={openModal === "upload"}
            onClose={closeModal}
            record={activeRecord}
            onUploaded={onUploaded}
          />
          <ModalSendBalanceToApproval
            isOpen={openModal === "approval"}
            onClose={closeModal}
            record={activeRecord}
            onUploaded={onUploaded}
          />
          <ModalApproveRejectBalance
            isOpen={openModal === "decision"}
            onClose={closeModal}
            record={activeRecord}
            action={decisionAction}
            onUploaded={onUploaded}
          />
        </>
      )}
    </>
  );
}
