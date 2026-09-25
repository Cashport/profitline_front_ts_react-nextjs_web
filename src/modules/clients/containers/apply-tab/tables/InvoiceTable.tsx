import React, { ReactNode, useState } from "react";
import { Button, Dropdown, Table, TableProps } from "antd";
import { DotsThreeVertical, Eye, Trash } from "phosphor-react";

import { formatDate } from "@/utils/utils";
import { useAppStore } from "@/lib/store/store";
import { useModalDetail } from "@/context/ModalContext";
import { ModalRemove } from "@/components/molecules/modals/ModalRemove/ModalRemove";

import { IApplyTabRecord } from "@/types/applyTabClients/IApplyTabClients";

interface InvoiceTableProps {
  data?: IApplyTabRecord[];
  clientId: string;
  projectId: number;
  // eslint-disable-next-line no-unused-vars
  handleDeleteRow?: (id: number) => void;
  // eslint-disable-next-line no-unused-vars
  handleEditRow: (row: IApplyTabRecord, editing_type: "invoice" | "payment" | "discount") => void;
  // eslint-disable-next-line no-unused-vars
  rowSelection: {
    selectedRowKeys: React.Key[];
    // eslint-disable-next-line no-unused-vars
    onChange: (newSelectedRowKeys: React.Key[], selectedRows: any[]) => void;
  };
}

const InvoiceTable: React.FC<InvoiceTableProps> = ({
  data,
  clientId,
  projectId,
  handleDeleteRow,
  handleEditRow,
  rowSelection
}) => {
  const [activeRow, setActiveRow] = useState<IApplyTabRecord | null>(null);
  const [removeModal, setRemoveModal] = useState(false);
  const formatMoney = useAppStore((state) => state.formatMoney);
  const { openModal } = useModalDetail();

  const columns: TableProps<IApplyTabRecord>["columns"] = [
    {
      title: "Factura",
      dataIndex: "id_erp",
      key: "id_erp",
      render: (id_erp, row) => {
        if (!row.financial_record_id) {
          return <p>{id_erp}</p>;
        }
        return (
          <p
            className="sectionContainerTable__id"
            onClick={() =>
              openModal("invoice", {
                invoiceId: row.financial_record_id as number,
                showId: row.id_erp,
                clientId,
                projectId
              })
            }
          >
            {id_erp}
          </p>
        );
      },
      sorter: (a, b) => a.id_erp.localeCompare(b.id_erp),
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
      title: "Monto inicial",
      dataIndex: "initial_value",
      key: "initial_value",
      render: (initial_value) => <p className="fontMonoSpace">{formatMoney(initial_value)}</p>,
      sorter: (a, b) => a.initial_value - b.initial_value,
      showSorterTooltip: false,
      align: "right"
    },
    {
      title: "Ajuste contable",
      dataIndex: "adjustments",
      key: "adjustments",
      render: (_, row: IApplyTabRecord) => {
        const adjustments = row.adjustments;
        if (!adjustments?.length) return <p>-</p>;
        return (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {adjustments.map((adj) => (
              <p
                key={adj.adjustment_id}
                className="sectionContainerTable__id"
                onClick={(e) => {
                  e.stopPropagation();
                  openModal("adjustment", {
                    adjusmentId: adj.adjustment_id,
                    clientId,
                    projectId
                  });
                }}
              >
                {adj.id_erp ?? adj.adjustment_id}
              </p>
            ))}
          </div>
        );
      },
      align: "right"
    },
    {
      title: "Monto aplicado",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => <p className="fontMonoSpace">{formatMoney(amount)}</p>,
      sorter: (a, b) => a.amount - b.amount,
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
                  handleEditRow(row, "invoice");
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
        dataSource={data?.map((data) => ({ ...data, key: data.id }))}
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
    </>
  );
};

export default InvoiceTable;
