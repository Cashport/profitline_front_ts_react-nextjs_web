import React, { ReactNode, useState } from "react";
import { Button, Dropdown, Table, TableProps, Tooltip } from "antd";
import { ArrowDownLeft, DotsThreeVertical, Eye, Trash } from "@phosphor-icons/react";

import { useAppStore } from "@/lib/store/store";
import { formatDate } from "@/utils/utils";

import { ModalRemove } from "@/components/molecules/modals/ModalRemove/ModalRemove";
import { ModalConfirmAction } from "@/components/molecules/modals/ModalConfirmAction/ModalConfirmAction";

import { IApplyTabRecord } from "@/types/applyTabClients/IApplyTabClients";

interface PaymentsTableProps {
  data?: IApplyTabRecord[];
  // eslint-disable-next-line no-unused-vars
  handleDeleteRow?: (id: number) => void;
  // eslint-disable-next-line no-unused-vars
  handleEditRow: (row: IApplyTabRecord, editing_type: "invoice" | "payment" | "discount") => void;
  rowSelection: {
    selectedRowKeys: React.Key[];
    // eslint-disable-next-line no-unused-vars
    onChange: (newSelectedRowKeys: React.Key[], selectedRows: any[]) => void;
  };
  // eslint-disable-next-line no-unused-vars
  markPaymentAsUnidentified?: (row: IApplyTabRecord) => void;
}

const PaymentsTable: React.FC<PaymentsTableProps> = ({
  data,
  handleDeleteRow,
  handleEditRow,
  rowSelection,
  markPaymentAsUnidentified
}) => {
  const formatMoney = useAppStore((state) => state.formatMoney);
  const [activeRow, setActiveRow] = useState<IApplyTabRecord | null>(null);

  const [removeModal, setRemoveModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);

  const columns: TableProps<IApplyTabRecord>["columns"] = [
    {
      title: "Pago",
      dataIndex: "payment_id",
      key: "payment_id",
      render: (id) => <p className="sectionContainerTable__id">{id}</p>,
      sorter: (a, b) => a.payment_id - b.payment_id,
      showSorterTooltip: false
    },
    {
      title: "Fecha",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => <p>{date ? formatDate(date) : "-"}</p>,
      sorter: (a, b) => Date.parse(a.created_at) - Date.parse(b.created_at),
      showSorterTooltip: false
    },
    {
      title: "Comentario",
      dataIndex: "entity_description",
      key: "entity_description",
      render: (entity_description) => (
        <Tooltip title={entity_description}>
          <p className="sectionContainerTable__description">{entity_description}</p>
        </Tooltip>
      )
    },
    {
      title: "Monto",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => <p className="fontMonoSpace">{formatMoney(amount)}</p>,
      sorter: (a, b) => a.amount - b.amount,
      showSorterTooltip: false,
      align: "right"
    },
    {
      title: "Monto aplicado",
      dataIndex: "applied_amount",
      key: "applied_amount",
      render: (applied_amount) => <p className="fontMonoSpace">{formatMoney(applied_amount)}</p>,
      sorter: (a, b) => a.applied_amount - b.applied_amount,
      showSorterTooltip: false,
      align: "right"
    },
    {
      title: "Saldo",
      dataIndex: "current_value",
      key: "current_value",
      render: (current_value) => <p className="fontMonoSpace">{formatMoney(current_value)}</p>,
      sorter: (a, b) => a.current_value - b.current_value,
      showSorterTooltip: false,
      align: "right"
    },
    {
      title: "Detalle",
      width: 76,
      render: (_, row) => {
        const items = [
          {
            key: "1",
            label: (
              <Button
                icon={<Eye size={20} />}
                className="buttonNoBorder"
                onClick={() => {
                  setActiveRow(row);
                  handleEditRow(row, "payment");
                }}
              >
                Editar
              </Button>
            )
          },
          {
            key: "2",
            label: (
              <Button
                icon={<Trash size={20} />}
                className="buttonNoBorder"
                onClick={() => {
                  setActiveRow(row);
                  setRemoveModal(true);
                }}
              >
                Eliminar
              </Button>
            )
          },
          {
            key: "3",
            label: (
              <Button
                icon={<ArrowDownLeft size={20} />}
                className="buttonNoBorder"
                onClick={() => {
                  setActiveRow(row);
                  setConfirmModal(true);
                }}
              >
                No identificado
              </Button>
            )
          }
        ];

        const customDropdown = (menu: ReactNode) => (
          <div className="dropdownApplicationTable">{menu}</div>
        );

        return (
          <Dropdown
            dropdownRender={customDropdown}
            menu={{ items }}
            placement="bottomLeft"
            trigger={["click"]}
          >
            <Button className="dotsBtn">
              <DotsThreeVertical size={16} />
            </Button>
          </Dropdown>
        );
      }
    }
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={data?.map((data) => ({ ...data, key: data.payment_id }))}
        className="sectionContainerTable customSticky"
        pagination={false}
        rowSelection={rowSelection}
        sticky={{
          offsetHeader: 160
        }}
      />

      <ModalRemove
        name="elemento"
        isOpen={removeModal}
        onClose={() => {
          setActiveRow(null);
          setRemoveModal(false);
        }}
        onRemove={() => {
          setActiveRow(null);
          setRemoveModal(false);
          handleDeleteRow && activeRow && handleDeleteRow(activeRow.id);
        }}
      />

      <ModalConfirmAction
        title="¿Marcar pago como no identificado?"
        isOpen={confirmModal}
        onClose={() => setConfirmModal(false)}
        onOk={() => {
          setConfirmModal(false);
          markPaymentAsUnidentified && activeRow && markPaymentAsUnidentified(activeRow);
        }}
      />
    </>
  );
};

export default PaymentsTable;
