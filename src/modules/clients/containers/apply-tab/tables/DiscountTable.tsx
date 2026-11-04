import React, { ReactNode, useState } from "react";
import { Button, Dropdown, Table, TableProps } from "antd";
import { useTranslations } from "use-intl";
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
  const t = useTranslations("clients.applyTab.tables");
  const tCommon = useTranslations("common");
  const [activeRow, setActiveRow] = useState<IApplyTabRecord | null>(null);
  const [removeModal, setRemoveModal] = useState(false);

  const columns: TableProps<IApplyTabRecord>["columns"] = [
    {
      title: t("columns.adjustmentId"),
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
      title: t("columns.adjustmentType"),
      dataIndex: "motive_description",
      key: "motive_description",
      render: (motive_description) => <p>{motive_description}</p>,
      showSorterTooltip: false,
      sorter: (a, b) => (b.motive_description ?? "").localeCompare(a.motive_description ?? "")
    },
    {
      title: tCommon("fields.detail"),
      dataIndex: "entity_description",
      key: "entity_description"
    },
    {
      title: t("columns.initialAmount"),
      dataIndex: "amount",
      key: "amount",
      render: (amount) => <p className="fontMonoSpace">{formatMoney(amount)}</p>,
      sorter: (a, b) => a.amount - b.amount,
      showSorterTooltip: false,
      align: "right"
    },
    {
      title: tCommon("fields.invoice"),
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
      title: t("columns.appliedAmount"),
      dataIndex: "applied_amount",
      key: "applied_amount",
      render: (applied_amount) => <p className="fontMonoSpace">{formatMoney(applied_amount)}</p>,
      sorter: (a, b) => a.applied_amount - b.applied_amount,
      showSorterTooltip: false,
      align: "right"
    },
    {
      title: tCommon("fields.detail"),
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
                {tCommon("actions.edit")}
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
                {tCommon("actions.delete")}
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
        name={t("removeItemName")}
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
