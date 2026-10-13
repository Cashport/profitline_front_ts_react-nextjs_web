"use client";
import { useMemo } from "react";
import { Modal, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

import { useAppStore } from "@/lib/store/store";
import { formatDate } from "@/utils/utils";
import { useInvoiceBalances } from "@/hooks/useInvoiceBalances";
import { IInvoiceBalance } from "@/services/balances/balances";
import { IInvoice } from "@/types/invoices/IInvoices";

import "./modalInvoiceBalances.scss";

const { Text } = Typography;

interface ModalInvoiceBalancesProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: IInvoice | null;
}

/**
 * HU Galderma — vista de SOLO LECTURA de los saldos (balances) asociados a una
 * factura. No permite editar, legalizar, eliminar, reasignar ni cambiar montos.
 */
export const ModalInvoiceBalances = ({
  isOpen,
  onClose,
  invoice
}: ModalInvoiceBalancesProps) => {
  const formatMoney = useAppStore((state) => state.formatMoney);
  const { balances, loading } = useInvoiceBalances(invoice?.id, isOpen);

  const columns = useMemo<ColumnsType<IInvoiceBalance>>(
    () => [
      {
        title: "Balance",
        dataIndex: "id",
        key: "id",
        width: 90
      },
      {
        title: "Motivo",
        dataIndex: "motive_name",
        key: "motive_name",
        render: (value: string | null) => value ?? "-"
      },
      {
        title: "Valor inicial",
        dataIndex: "initial_value",
        key: "initial_value",
        align: "right",
        render: (value: number) => formatMoney(Number(value) || 0)
      },
      {
        title: "Valor actual",
        dataIndex: "current_value",
        key: "current_value",
        align: "right",
        render: (value: number) => formatMoney(Number(value) || 0)
      },
      {
        title: "Estado",
        dataIndex: "balance_status_name",
        key: "balance_status_name",
        render: (value: string | null, record) =>
          value ? (
            <Tag color={record.balance_status_color || undefined}>{value}</Tag>
          ) : (
            "-"
          )
      },
      {
        title: "Fecha",
        dataIndex: "created_at",
        key: "created_at",
        render: (value: string | null) => (value ? formatDate(value) : "-")
      },
      {
        title: "Comentarios",
        dataIndex: "comments",
        key: "comments",
        render: (value: string | null) => value ?? "-"
      }
    ],
    [formatMoney]
  );

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={1000}
      centered
      className="modalInvoiceBalances"
      style={{ maxWidth: "calc(100vw - 32px)" }}
      destroyOnClose
      title={
        <span>
          Saldos de <Text strong>{invoice?.id_erp ?? ""}</Text>
        </span>
      }
    >
      <Table<IInvoiceBalance>
        className="modalInvoiceBalances__table"
        rowKey="id"
        size="small"
        loading={loading}
        columns={columns}
        dataSource={balances}
        pagination={false}
        scroll={{ y: "40vh" }}
        locale={{ emptyText: "Esta factura no tiene saldos asociados" }}
      />
    </Modal>
  );
};
