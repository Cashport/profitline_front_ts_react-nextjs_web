import React, { ReactNode, useState } from "react";
import { Button, Dropdown, Table, TableProps } from "antd";
import { Trash, DotsThreeVertical, Pencil } from "phosphor-react";

import { useAppStore } from "@/lib/store/store";
import { useModalDetail } from "@/context/ModalContext";

import { ModalRemove } from "@/components/molecules/modals/ModalRemove/ModalRemove";

import { IApplyTabRecord } from "@/types/applyTabClients/IApplyTabClients";

interface DiscountTableProps {
  data?: IApplyTabRecord[];
  clientId: string;
  projectId: number;
  // eslint-disable-next-line no-unused-vars
  handleDeleteRow?: (id: number) => void;
  // eslint-disable-next-line no-unused-vars
  rowSelection: {
    selectedRowKeys: React.Key[];
    // eslint-disable-next-line no-unused-vars
    onChange: (newSelectedRowKeys: React.Key[], selectedRows: any[]) => void;
  };
  // eslint-disable-next-line no-unused-vars
  handleEditRow?: (record: IApplyTabRecord) => void;
}

const DiscountTable: React.FC<DiscountTableProps> = ({
  data,
  clientId,
  projectId,
  handleDeleteRow,
  rowSelection,
  handleEditRow
}) => {
  const formatMoney = useAppStore((state) => state.formatMoney);
  const { openModal } = useModalDetail();
  const [activeRow, setActiveRow] = useState<IApplyTabRecord | null>(null);
  const [removeModal, setRemoveModal] = useState(false);

  const columns: TableProps<IApplyTabRecord>["columns"] = [
    {
      title: "ID ajuste",
      dataIndex: "erp_id",
      key: "erp_id",
      render: (id, row) => {
        return (
          <p
            className="sectionContainerTable__id"
            onClick={() =>
              openModal("adjustment", {
                adjusmentId: Number(row.financial_discount_id),
                clientId,
                projectId
              })
            }
          >
            {id}
          </p>
        );
      },
      showSorterTooltip: false
    },
    {
      title: "Tipo de ajuste",
      dataIndex: "motive_description",
      key: "motive_description",
      render: (motive_description) => <p>{motive_description}</p>,
      showSorterTooltip: false,
      sorter: (a, b) => (b.motive_description ?? "").localeCompare(a.motive_description ?? "")
    },
    {
      title: "Detalle",
      dataIndex: "entity_description",
      key: "entity_description"
    },
    {
      title: "Monto inicial",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => <p className="fontMonoSpace">{formatMoney(amount)}</p>,
      sorter: (a, b) => a.amount - b.amount,
      showSorterTooltip: false,
      align: "right"
    },
    {
      title: "Factura",
      dataIndex: "invoices",
      key: "invoices",
      render: (_, row: IApplyTabRecord) => {
        const invoices = row.invoices;
        if (!invoices?.length) return <p>-</p>;
        return (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {invoices.map((inv) => (
              <p
                key={inv.invoice_id}
                className="sectionContainerTable__id"
                onClick={(e) => {
                  e.stopPropagation();
                  openModal("invoice", {
                    invoiceId: inv.financial_discount_id,
                    showId: inv.id_erp,
                    clientId,
                    projectId
                  });
                }}
              >
                {inv.id_erp}
              </p>
            ))}
          </div>
        );
      },
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
      title: "Detalle",
      width: 76,
      render: (_, row) => {
        const items = [
          {
            key: "1",
            label: (
              <Button
                icon={<Pencil size={20} />}
                className="buttonNoBorder"
                onClick={() => {
                  handleEditRow && handleEditRow(row);
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
        dataSource={data?.map((data) => ({ ...data, key: data.financial_discount_id }))}
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

export default DiscountTable;
